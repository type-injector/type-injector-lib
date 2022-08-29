import { expect } from 'chai';
import { InjectConfig, TypeInjector } from './src'
import { Logger } from './src/logger';

describe('type inject', () => {
  describe('create objects', () => {
    it('should be able to instanciate an injector', () => {
      const injector = new TypeInjector();
      expect(injector).to.exist;
    });

    /**
     * BaseService without constructor arguments
     * */
    class BaseService {
      readonly isBaseService = true;
    }

    it('should be able to inject a type without further configuration', () => {
      const injector = new TypeInjector();
      const baseService = injector.get(BaseService);
      expect(baseService.isBaseService).to.equal(true);
    });

    /**
     * NotInjectable with constructor arguments and without config
     * */
    class NotInjectable {
      baseService: BaseService;

      constructor(
        baseService: BaseService
      ) {
        this.baseService = baseService;
      }
    }

    it('should show compile error for classes that do not have an empty constructor nor an inject config', () => {
      const injector = new TypeInjector();

      // @ts-expect-error shown by api
      injector.get(NotInjectable);
    });

    /**
     * ComposedService adds an injectConfig to the class with constructor arguments
     * so it get's injectable again
     */
    class ComposedService extends NotInjectable {
      static injectConfig: InjectConfig = {
        deps: [BaseService],
      };
    }

    it('should be able to inject types with an inject config', () => {
      const injector = new TypeInjector();

      const composedService = injector.get(ComposedService);
      expect(composedService.baseService.isBaseService).to.equal(true);
    });

    /**
     * Inject simple values by symbol token:
     */
    const injectTokens = {
      baseUrl: Symbol.for('ServiceBaseUrl'),
    }

    class ConfigurableService {
      readonly baseUrl: string;

      static injectConfig: InjectConfig = {
        deps: [injectTokens.baseUrl],
      };
      constructor(
        baseUrl: string,
      ) {
        this.baseUrl = baseUrl;
      }
    }

    it('should be able to inject objects by token', () => {
      const givenBaseUrl = 'http://given-base.url' as const;
      const injector = new TypeInjector()
        .provideValue<string>(injectTokens.baseUrl, givenBaseUrl)
      ;

      const configurableService = injector.get(ConfigurableService);
      expect(configurableService.baseUrl).to.equal(givenBaseUrl);
    });
  });

  describe('provider variants', () => {
    const injectToken = Symbol.for('TestInjectToken');

    describe('provide value', () => {
      it('should be possible to provide a value', () => {
        const givenValue = { name: 'givenValue' };
        const injector = new TypeInjector()
          .provideValue(injectToken, givenValue)
        ;
        expect(injector.get(injectToken) === givenValue).to.be.true;
      });

      class BaseService {
        isProvided = false;
      }

      it('should always prefer provided values', () => {
        const injector = new TypeInjector()
          .provideValue(BaseService, { isProvided: true })
        ;
        expect(injector.get(BaseService).isProvided).to.be.true;
      });
    });

    describe('provide factory', () => {
      it('should be possible to provide a factory', () => {
        let factoryCalls = 0;
        class FactoryResult {
          instanceCount = factoryCalls;
        }
        const injector = new TypeInjector()
          .provideFactory(FactoryResult, {
            deps: [],
            create: () => {
              factoryCalls++;
              return new FactoryResult();
            },
          })
        ;
        expect(factoryCalls).to.equal(0);

        const instance1 = injector.get(FactoryResult);
        expect(factoryCalls).to.equal(1);
        expect(instance1.instanceCount).to.equal(1);

        const instance2 = injector.get(FactoryResult);
        expect(factoryCalls).to.equal(1);
        expect(instance1 === instance2);
      });
    });

    describe('provide implementation', () => {
      it('should be possible to provide an (alternative) implementation', () => {
        class CommonImpl {
          typeName = 'CommonImpl';
          constructor(typeName: string) {
            this.typeName = typeName;
          }
        }
        class InjectableCommonImpl extends CommonImpl {
          static readonly injectConfig: InjectConfig = {
            deps: [injectToken],
          }
        }
        class SpecialImpl extends CommonImpl {
          typeName = 'SpecialImpl';
          constructor() {
            super('SpecialImpl');
          }
        }

        const injector = new TypeInjector();
        injector.provideImplementation(InjectableCommonImpl, SpecialImpl);

        expect(injector.get(InjectableCommonImpl).typeName).to.equal('SpecialImpl');
      });
    });
  });

  describe('scopes', () => {
    class BaseService {
      readonly isBaseService = true;
    }
    it('should always return the same instance', () => {
      const injector = new TypeInjector();
      const base1 = injector.get(BaseService);
      const base2 = injector.get(BaseService);

      expect(base1 === base2).to.be.true;
    });

    class CycligService {
      parent: CycligService;
      static readonly injectConfig: InjectConfig = {
        deps: [CycligService],
      }
      constructor(parent: CycligService) {
        this.parent = parent;
      }
    }

    it('should show cyclic errors', () => {
      const injector = new TypeInjector()
        .provideValue(Logger, { error: (..._args) => { /* no not log errors */ } } as Logger)
      ;
      try {
        injector.get(CycligService);
        expect.fail('no error thrown');
      } catch (e) {
        expect(e).to.include({ message: 'dependency cycle: CycligService' })
      }
    });
  });
});
