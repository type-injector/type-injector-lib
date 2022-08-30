import { expect } from 'chai';
import { Logger } from './logger';
import { InjectConfig, TypeInjector } from './type-injector';

describe('type injector basics', () => {
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
  it('should be able to inject objects by token', () => {
    const injectTokens = {
      baseUrl: TypeInjector.createToken<string>('ServiceBaseUrl'),
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

    const givenBaseUrl = 'http://given-base.url' as const;
    const injector = new TypeInjector()
      .provideValue(injectTokens.baseUrl, givenBaseUrl)
    ;

    const configurableService = injector.get(ConfigurableService);
    expect(configurableService.baseUrl).to.equal(givenBaseUrl);
  });

  /**
   * cyclic dependencies are a code smell.
   *
   * This inject implementation does not support cyclic dependencies
   * so it will thorw a hard runtime error whenever it detects one.
   * The error should include the whole tree so it might help to solve
   * the issue.
   */
  it('should show cyclic errors', () => {
    const serviceC = TypeInjector.createToken<ServiceC>('ServiceC');
    class ServiceA {
      serviceC: ServiceC;
      static injectConfig: InjectConfig = { deps: [serviceC] };
      constructor(serviceC: ServiceC) { this.serviceC = serviceC }
    }
    class ServiceB {
      serviceA: ServiceA;
      static injectConfig: InjectConfig = { deps: [ServiceA] };
      constructor(serviceA: ServiceA) { this.serviceA = serviceA }
    }
    class ServiceC {
      serviceB: ServiceB;
      static injectConfig: InjectConfig = { deps: [ServiceB] };
      constructor(serviceB: ServiceB) { this.serviceB = serviceB }
    }

    const loggerCalls = [] as Parameters<Logger['error']>[];
    const injector = new TypeInjector()
      .provideValue(Logger, { error: (...args) => {
        loggerCalls.push(args);
      } } as Logger)
      .provideImplementation(serviceC, ServiceC)
    ;
    try {
      injector.get(ServiceA);
      expect.fail('no error thrown');
    } catch (e) {
      const expectedMessage = 'dependency cycle detected: "ServiceA"\n'
      + ' -> "TypeInjectorToken: ServiceC"\n'
      + ' -> "ServiceB"\n'
      + ' -> "ServiceA"\n';
      expect(e).to.include({ message: expectedMessage });
      expect(loggerCalls[0][0]).to.equal(expectedMessage);
    }
  });
});
