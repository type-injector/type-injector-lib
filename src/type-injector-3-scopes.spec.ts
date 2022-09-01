import { expect } from 'chai';
import { ChildInjector, InjectConfig, Logger, TypeInjector } from './index';

/**
 * Scopes
 *
 * There are many examples where it's useful to create child injectors for different
 * scopes:
 * - creating an injector for a request context
 * - creating an injector for a component context
 * - creating an injector for a session context
 * - creating an injector for an authenticated context
 *
 * Disadvantages:
 * - Scopes increase complexity in resolving factories
 *   so it takes more time to create new instances.
 * - Scopes increase complexity in debugging and finding errors
 * - Scopes increase the difficulty to predict runtime behavior
 *
 * Advantages:
 * - Scopes can provide more specific informations like:
 *   * auth tokens
 *   * logged in user id
 *   * request urls / parameters
 * - Scopes can change general behavior
 *   * Debug-Scope --> verbose Logging
 * - Scopes can get clean up so all objects that contain informations
 *   of that scopes will get destroyed (e.g. auth/user)
 *
 * Summary:
 * You should carefully think about introducing scopes and which scopes
 * you need. They add much complexity but might have large advantages, too.
 *
 * Remark:
 * 99% of scope implementation is in child-injector.ts. If you do not use
 * scopes at all and you use some kind of tree shaking, your tree shaking
 * should be able to exclude this code from your compilation unit.
 */
describe('scopes', () => {
  /**
   * That is the same as using no scopes and very easy to handle:
   */
  describe('using a single scope', () => {
    it('should always return the same instance', () => {
      class BaseService {
        readonly isBaseService = true;
      }

      const injector = new TypeInjector();
      const base1 = injector.get(BaseService);
      const base2 = injector.get(BaseService);

      expect(base1 === base2).to.be.true;
    });

    it('should not matter in which order you provide factories/values/implementations', () => {
      // GIVEN:
      const injectToken = {
        logger: TypeInjector.createToken<Logger>('logger'),
        logFn: TypeInjector.createToken<(msg: string) => void>('log fn'),
      };
      const injector = new TypeInjector();

      let lastLoggedInfo: string | false = false;
      class MockedLogger extends Logger {
        info = (message: string) => {
          lastLoggedInfo = message;
        }
      }

      // WHEN:
      // 1. provide a function that is using the logger
      injector.provideFactory(injectToken.logFn, {
        deps: [injectToken.logger],
        create: (logger: Logger) => (msg: string) => logger.info?.(msg),
      });

      // 2. change the used logger
      injector.provideImplementation(injectToken.logger, MockedLogger);

      // 3. use the injector to create the logFn
      injector.get(injectToken.logFn)('my message');

      // THEN:
      // logFn should use the replaced logger implementation:
      expect(lastLoggedInfo).to.equal('my message');
    });
  });

  /**
   * If you create a scope you will get an child injector which
   * might provide additional informations
   */
  describe('child injector', () => {
    it('should be possible to create a child injector', () => {
      const givenAuthToken = 'hack_me¯\\_(ツ)_/¯s';
      const givenBaseUrl = 'https://service.url/api';

      const authToken = TypeInjector.createToken<string>('auth token');
      const baseUrl = TypeInjector.createToken<string>('base url');

      const parentInjector = new TypeInjector()
        .provideFactory(baseUrl, {
          deps: [],
          create: () => givenBaseUrl,
        })
      ;
      const authorizedScope = Symbol.for('authorized injection scope');
      const authorizedInjector = ChildInjector.withIdent(authorizedScope).from(parentInjector)
        .provideValue(authToken, givenAuthToken)
      ;

      class ServiceA {
        static injectConfig: InjectConfig = { deps: [
          baseUrl, authToken,
        ]};
        constructor(
          public readonly baseUrl: string,
          public readonly authToken: string,
        ) {}
      }

      // the authorized injector will combine its own information (authToken)
      // with the information of the parent injector (base url)
      const instance = authorizedInjector.get(ServiceA);
      expect(instance.baseUrl).to.equal(givenBaseUrl);
      expect(instance.authToken).to.equal(givenAuthToken);

      try {
        // the parent injector will still not know anything about the auth token
        // and it won't hold any objects that need the auth token
        parentInjector.get(ServiceA);
        expect.fail('did not throw');
      } catch (e) {
        expect((e as { message: string }).message).to.match(/not find a factory.*auth token/);
      }
    });
  });

  /**
   * Choosing the scope to create an instance.
   *
   * Constraints:
   * - never create a 2nd instance if there's an instance which can get reused
   * - an instance can't get reused if it has (indirect) dependencies that are overridden in child scope
   */
  describe('auto scope selection', () => {
    it('should provide the most specialized instance', () => {
      // GIVEN:
      // There's a SimpleService that is not special:
      class SimpleService {
        isSpecial = false;
      }
      // The topLevelInjector has no special configuration:
      const topLevelInjector = new TypeInjector();

      // There's a SpecialSimpleService that is special:
      class SpecialSimpleService extends SimpleService {
        isSpecial = true;
      }
      // And there is a child injector that overrides the SimpleService implementation with the SpecialSimpleService implementation
      const childInjector = ChildInjector.withIdent(Symbol.for('child injector')).from(topLevelInjector)
        .provideImplementation(SimpleService, SpecialSimpleService)
      ;

      // WHEN:
      // 1. Requesting an instance from top level scope.
      //    So there is a cached instance which is a candidate to get reused.
      const instanceFromTopLevelScope = topLevelInjector.get(SimpleService);
      // 2. Requesting an instance from child scope.
      //    There is already an instance in the top level scope but the implementaion of SimpleService
      //    is overridden in child scope, so we cannot reuse the instance from top level scope
      //    and will create its own instance in child scope.
      const instanceFromChildScope = childInjector.get(SimpleService);

      // THEN:
      // - There are two separate instances depending on the scope:
      expect(instanceFromTopLevelScope !== instanceFromChildScope).to.be.true;
      // - The SimpleService from the top level scope is *not* special:
      expect(instanceFromTopLevelScope.isSpecial).to.be.false;
      // - The SimpleService from the child scope is special:
      expect(instanceFromChildScope.isSpecial).to.be.true;
    });

    it('should create separate instances if there are dependency to instances in its own scope', () => {
      // GIVEN:
      // There's a SimpleService that depends on Logger:
      class SimpleService {
        static injectConfig: InjectConfig = { deps: [Logger] };
        constructor(
          public readonly logger: Logger,
        ) {}
      }
      // The topLevelInjector has no special configuration:
      const topLevelInjector = new TypeInjector()

      // There's a SpecialLogger implementation:
      class SpecialLogger extends Logger {
        isSpecialLogger = true;
      }
      // And there is a child injector that overrides the Logger implementation with the SpecialLogger implementation
      const childInjector = ChildInjector.withIdent(Symbol.for('child injector')).from(topLevelInjector)
        .provideImplementation(Logger, SpecialLogger)
      ;

      // WHEN:
      // 1. Requesting an instance from top level scope.
      //    So there is a cached instance which is a candidate to get reused.
      const instanceFromTopLevelScope = topLevelInjector.get(SimpleService);
      // 2. Requesting an instance from child scope.
      //    There is already an instance in the top level scope but SimpleService is using Logger
      //    and Logger is overridden in the child scope, so we cannot reuse the instance from the top level scope
      //    and will create its own instance in child scope.
      const instanceFromChildScope = childInjector.get(SimpleService);

      // THEN:
      // - There are two separate instances depending on the scope:
      expect(instanceFromTopLevelScope !== instanceFromChildScope).to.be.true;
      // - The SimpleService from the top level scope will use Logger (*not* SpecialLogger from child scope).
      expect(topLevelInjector.get(SimpleService).logger instanceof Logger).to.be.true;
      expect(topLevelInjector.get(SimpleService).logger instanceof SpecialLogger).to.be.false;
      // - The SimpleService from the child scope will use the SpecialLogger.
      expect(childInjector.get(SimpleService).logger instanceof SpecialLogger).to.be.true;
    });

    it('should create the instance in the parent scope if there are no dependencies to instances in its own scope', () => {
      // GIVEN:
      // There's a SimpleService that depends on Logger:
      class SimpleService {
        static injectConfig: InjectConfig = { deps: [Logger] };
        constructor(
          public readonly logger: Logger,
        ) {}
      }
      // The topLevelInjector has no special configuration:
      const topLevelInjector = new TypeInjector();
      // The childInjector has no special configuration either:
      const childInjector = ChildInjector.withIdent(Symbol.for('child injector')).from(topLevelInjector);

      // WHEN:
      // 1. Requesting an instance from child scope.
      //    It will find no special dependency in its own scope.
      //    So it will delegate the creation of SimpleService to the top level scope.
      const instanceFromChildScope = childInjector.get(SimpleService);
      // 2. Requesting an instance from top level scope.
      //    It will find the cached instance which had been created by the child scope delegate.
      const instanceFromTopLevelScope = topLevelInjector.get(SimpleService);

      // THEN:
      // - There is only one instance for all scopes:
      expect(instanceFromChildScope === instanceFromTopLevelScope).to.be.true;
    });

    it('should skip intermediate layers', () => {
      // GIVEN:
      class SimpleService {}
      const topLevelInjector = new TypeInjector();

      /**
       topLevelInjector
        ├── midLevelInjector
        │   └── verySpecialInjector
        └── branchBInjector
      */
      const midLevelInjector = ChildInjector.withIdent(Symbol.for('mid level')).from(topLevelInjector);
      const verySpecialInjector = ChildInjector.withIdent(Symbol.for('very special')).from(midLevelInjector);

      const branchBInjector = ChildInjector.withIdent(Symbol.for('branch b')).from(topLevelInjector);

      // WHEN:
      const instanceFromVerySpecialInjector = verySpecialInjector.get(SimpleService);
      const instanceFromBranchBInjector = branchBInjector.get(SimpleService);

      // THEN:
      expect(instanceFromBranchBInjector === instanceFromVerySpecialInjector).to.be.true;
    });

    it('should use special implementations from mid level', () => {
      // GIVEN:
      class SimpleService { isSpecial = false; }
      class SpecialService extends SimpleService { isSpecial = true; }

      /**
       topLevelInjector
        ├── midLevelInjector (SimpleService -> SpecialService)
        │   └── verySpecialInjector
        └── branchBInjector
      */
      const topLevelInjector = new TypeInjector();

      const midLevelInjector = ChildInjector.withIdent(Symbol.for('mid level')).from(topLevelInjector)
        .provideImplementation(SimpleService, SpecialService)
      ;
      const verySpecialInjector = ChildInjector.withIdent(Symbol.for('very special')).from(midLevelInjector);

      const branchBInjector = ChildInjector.withIdent(Symbol.for('branch b')).from(topLevelInjector);

      // WHEN:
      const instanceFromBranchBInjector = branchBInjector.get(SimpleService);
      const instanceFromVerySpecialInjector = verySpecialInjector.get(SimpleService);
      const instanceFromTopLevel = topLevelInjector.get(SimpleService);
      const instanceFromMidLevel = midLevelInjector.get(SimpleService);

      // THEN:
      expect(instanceFromBranchBInjector === instanceFromTopLevel).to.be.true;
      expect(instanceFromBranchBInjector.isSpecial).to.be.false;
      expect(instanceFromVerySpecialInjector !== instanceFromTopLevel).to.be.true;
      expect(instanceFromVerySpecialInjector === instanceFromMidLevel).to.be.true;
      expect(instanceFromVerySpecialInjector.isSpecial).to.be.true;
    });

    it('will not reuse special implementations from different branches', () => {
      // GIVEN:
      class SimpleService { isSpecial = false; }
      class SpecialService extends SimpleService { isSpecial = true; }

      /**
       topLevelInjector
        ├── branchAInjector (SimpleService -> SpecialService)
        └── branchBInjector (SimpleService -> SpecialService)
      */
      const topLevelInjector = new TypeInjector();

      const branchAInjector = ChildInjector.withIdent(Symbol.for('branch a')).from(topLevelInjector)
        .provideImplementation(SimpleService, SpecialService)
      ;

      const branchBInjector = ChildInjector.withIdent(Symbol.for('branch b')).from(topLevelInjector)
        .provideImplementation(SimpleService, SpecialService)
      ;

      // WHEN:
      const instanceFromTopLevel = topLevelInjector.get(SimpleService);
      const instanceFromBranchA = branchAInjector.get(SimpleService);
      const instanceFromBranchB = branchBInjector.get(SimpleService);

      // THEN:
      expect(instanceFromTopLevel !== instanceFromBranchA).to.be.true;
      expect(instanceFromTopLevel !== instanceFromBranchB).to.be.true;
      expect(instanceFromBranchA !== instanceFromBranchB).to.be.true;
      expect(instanceFromTopLevel.isSpecial).to.be.false;
      expect(instanceFromBranchA.isSpecial).to.be.true;
      expect(instanceFromBranchB.isSpecial).to.be.true;
    });

    it('should create separate instance for indirect dependency', () => {
      // GIVEN
      class ExtendedLogger {
        static injectConfig: InjectConfig = {
          deps: [Logger],
        }
        constructor(
          public logger: Logger,
        ) {}
      }
      class BusinessService {
        static injectConfig: InjectConfig = {
          deps: [ExtendedLogger],
        }
        constructor(
          public extLogger: ExtendedLogger,
        ) {}
      }
      const topLevelInjector = new TypeInjector();

      class SpecialLogger extends Logger {}
      const childInjector = ChildInjector.withIdent(Symbol.for('child')).from(topLevelInjector)
        .provideImplementation(Logger, SpecialLogger)
      ;

      // WHEN
      const businessServiceFromTopLevel = topLevelInjector.get(BusinessService);
      const businessServiceFromChild = childInjector.get(BusinessService);

      // THEN
      expect(businessServiceFromChild !== businessServiceFromTopLevel).to.be.true;
      expect(businessServiceFromChild.extLogger !== businessServiceFromTopLevel.extLogger).to.be.true;
      expect(businessServiceFromTopLevel.extLogger.logger instanceof SpecialLogger).to.be.false;
      expect(businessServiceFromChild.extLogger.logger instanceof SpecialLogger).to.be.true;
    });

    it('should lookup parnet factory recursively', () => {
      const givenContent = { desc: 'given content' };
      const contentToken = TypeInjector.createToken<typeof givenContent>('content token');
      const topLevelInjector = new TypeInjector()
        .provideFactory(contentToken, { deps: [], create: () => givenContent})
      ;
      const midLevelInjector = ChildInjector.withIdent(Symbol.for('mid level')).from(topLevelInjector);
      const verySpecialInjector = ChildInjector.withIdent(Symbol.for('very special')).from(midLevelInjector);

      const content = verySpecialInjector.get(contentToken);

      expect(content === givenContent).to.be.true;
    });

    it('should detect dependency cycles across different scopes', () => {
      const serviceC = TypeInjector.createToken<ServiceC>('ServiceC');
      class ServiceA {
        static injectConfig: InjectConfig = { deps: [serviceC] };
        constructor(
          public serviceC: ServiceC,
        ) {}
      }
      class ServiceB {}
      class ServiceC {}

      const loggerCalls = [] as Parameters<Logger['error']>[];
      const topLevelInjector = new TypeInjector()
        .provideValue(Logger, { error: (...args) => { loggerCalls.push(args) } } as Logger)
        .provideImplementation(serviceC, ServiceC)
      ;

      class SpecialServiceC extends ServiceC {
        static injectConfig: InjectConfig = { deps: [ServiceB] };
        constructor(
          public serviceB: ServiceB,
        ) {
          super();
        }
      }
      const midLevelInjector = ChildInjector.withIdent(Symbol.for('mid level')).from(topLevelInjector)
        .provideImplementation(serviceC, SpecialServiceC)
      ;

      class SpecialServiceB extends ServiceB {
        static injectConfig: InjectConfig = { deps: [ServiceA] };
        constructor(
          public serviceA: ServiceA,
        ) {
          super();
        }
      }
      const verySpecialInjector = ChildInjector.withIdent(Symbol.for('very special')).from(midLevelInjector)
        .provideImplementation(ServiceB, SpecialServiceB)
      ;

      expect(() => topLevelInjector.get(ServiceA)).not.to.throw();
      expect(() => midLevelInjector.get(ServiceA)).not.to.throw();
      try {
        verySpecialInjector.get(ServiceA);
        expect.fail('no error thrown');
      } catch (e) {
        const expectedMessage = 'dependency cycle detected:\n'
          + ' -> ServiceA\n'
          + '      factory: ServiceA.injectConfig\n'
          + '      scope: \'top level injector\'\n'
          + '\n'
          + ' -> TypeInjectorToken: ServiceC\n'
          + '      factory: provideImpl: SpecialServiceC\n'
          + '      scope: \'mid level\'\n'
          + '\n'
          + ' -> ServiceB\n'
          + '      factory: provideImpl: SpecialServiceB\n'
          + '      scope: \'very special\'\n'
          + '\n'
          + ' -> ServiceA\n'
          + '      factory: ServiceA.injectConfig\n'
          + '      scope: \'top level injector\'\n'
          + '\n'
        ;
//        console.log('test\n----\n' + loggerCalls[0][0] + '\n-----\n');
        expect(e).to.include({ message: expectedMessage });
        expect(loggerCalls[0][0]).to.equal(expectedMessage);
      }
    });

    it('should be possible to use a custom logger implementation to log the scope decission', () => {
      // GIVEN:
      const injectToken = { baseUrl: TypeInjector.createToken<string>('base url') };
      class SimpleService {
        static injectConfig: InjectConfig = { deps: [injectToken.baseUrl]}
        constructor( public baseUrl: string ) {}
      }
      const loggedInfo = [] as string[];
      class VerboseLogger extends Logger {
        info = (message: string, ..._details: any[]) => {
          loggedInfo.push(message);
          console.log(message, _details);
        };
      }

      /**
       topLevelInjector (Logger -> VerboseLogger)
        ├── midLevelInjector (baseUrl -> 'https://base.url')
        │   └── verySpecialInjector
        └── branchBInjector
      */
      const topLevelInjector = new TypeInjector()
        .provideImplementation(Logger, VerboseLogger)
      ;

      const midLevelInjector = ChildInjector.withIdent(Symbol.for('mid level')).from(topLevelInjector)
        .provideValue(injectToken.baseUrl, 'https://base.url')
      ;
      const verySpecialInjector = ChildInjector.withIdent(Symbol.for('very special')).from(midLevelInjector);

      verySpecialInjector.get(SimpleService);
      console.log(loggedInfo.join('\n\n'));
    });
  });
});
