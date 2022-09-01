import { expect } from 'chai';
import { InjectConfig, Logger, TypeInjector } from './index';

describe('type injector basics', () => {
  it('should get instanciated by the build pattern', () => {
    const injector = TypeInjector.build();
    expect(injector).to.exist;
  });

  /**
   * BaseService without constructor arguments
   * */
  class BaseService {
    readonly isBaseService = true;
  }

  it('should be able to inject a type without further configuration', () => {
    const injector = TypeInjector.build();
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
    const injector = TypeInjector.build();

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
    const injector = TypeInjector.build();

    const composedService = injector.get(ComposedService);
    expect(composedService.baseService.isBaseService).to.equal(true);
  });

  /**
   * Inject simple values by symbol token:
   */
  it('should be possible to configure the injector during construction time to inject objects by token', () => {
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
    const injectorFactory = TypeInjector.create();
    injectorFactory.provideValue(injectTokens.baseUrl, givenBaseUrl)
    const injector = injectorFactory.build();

    const configurableService = injector.get(ConfigurableService);
    expect(configurableService.baseUrl).to.equal(givenBaseUrl);
  });

  it('should not be possible to continue configuration after build', () => {
    const injectorFactory = TypeInjector.create();
    injectorFactory.build();
    try {
      injectorFactory.provideValue(Logger, new Logger());
      expect.fail('no error thrown');
    } catch (e) {
      expect((e as { message: string}).message).to.include('no further config')
    }
  });

  it('should not be possible to build more than one injector from one configuration', () => {
    const injectorFactory = TypeInjector.create();
    injectorFactory.build();
    try {
      injectorFactory.build();
      expect.fail('no error thrown');
    } catch (e) {
      expect((e as { message: string}).message).to.include('already built')
    }
  });

  /**
   * Cyclic dependencies are a code smell.
   *
   * This inject implementation does not support cyclic dependencies
   * so it will throw a hard runtime error whenever it detects one.
   * The error should include the whole tree so it might help to solve
   * the issue.
   */
  it('should show cyclic errors', () => {
    const serviceC = TypeInjector.createToken<ServiceC>('ServiceC');
    class ServiceA {
      static injectConfig: InjectConfig = { deps: [serviceC] };
      constructor( public serviceC: ServiceC ) {}
    }
    class ServiceB {
      static injectConfig: InjectConfig = { deps: [ServiceA] };
      constructor( public serviceA: ServiceA ) {}
    }
    class ServiceC {
      static injectConfig: InjectConfig = { deps: [ServiceB] };
      constructor( public serviceB: ServiceB ) {}
    }

    const loggerCalls = [] as Parameters<Logger['error']>[];
    const injector = TypeInjector.create()
      .provideValue(Logger, { error: (...args) => {
        loggerCalls.push(args);
      } } as Logger)
      .provideImplementation(serviceC, ServiceC)
      .build()
    ;
    try {
      injector.get(ServiceA);
      expect.fail('no error thrown');
    } catch (e) {
      const expectedMessage = 'dependency cycle detected:\n'
        + ' -> ServiceA\n'
        + '      factory: ServiceA.injectConfig\n'
        + '\n'
        + ' -> TypeInjectorToken: ServiceC\n'
        + '      factory: provideImpl: ServiceC\n'
        + '\n'
        + ' -> ServiceB\n'
        + '      factory: ServiceB.injectConfig\n'
        + '\n'
        + ' -> ServiceA\n'
        + '      factory: ServiceA.injectConfig\n'
        + '\n'
      ;
//      console.log('test\n----\n' + loggerCalls[0][0] + '\n-----\n');
      expect(e).to.include({ message: expectedMessage });
      expect(loggerCalls[0][0]).to.equal(expectedMessage);
    }
  });
});
