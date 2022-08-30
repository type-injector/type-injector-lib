import { expect } from 'chai';
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

  it('should be able to inject objects by token', () => {
    const givenBaseUrl = 'http://given-base.url' as const;
    const injector = new TypeInjector()
      .provideValue(injectTokens.baseUrl, givenBaseUrl)
    ;

    const configurableService = injector.get(ConfigurableService);
    expect(configurableService.baseUrl).to.equal(givenBaseUrl);
  });
});
