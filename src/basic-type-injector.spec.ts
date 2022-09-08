import { expect } from 'chai';
import { BasicTypeInjector, InjectConfig, Logger, declareInjectToken } from './index';

/**
 * That's the common base of TypeInjector and InjectorScope.
 *
 * It can also get used standalone in very basic setups.
 * For more complex setups you should use file://./type-injector.ts#TypeInjector.
 */
describe('basic type injector', () => {
  it('should allow you to create a basic type injector', () => {
    class SimpleService {
      static injectConfig: InjectConfig = {
        deps: [Logger],
      };
      constructor(
        public readonly logger: Logger,
      ) {}
    }

    const injector = new BasicTypeInjector();
    const simpleService = injector.get(SimpleService);

    expect(simpleService.logger).to.exist;
  });

  it('should be possible to pass values to a basic type injector', () => {
    const givenBaseUrl = 'http://base.url';
    const injectToken = {
      baseUrl: declareInjectToken<string>('base url'),
    };
    class BusinessService {
      static injectConfig = {
        deps: [injectToken.baseUrl],
      }
      constructor(
        public readonly baseUrl: string,
      ) {}
    }
    const injector = new BasicTypeInjector({
      instances: {
        [injectToken.baseUrl]: givenBaseUrl,
      },
    });

    const service = injector.get(BusinessService);

    expect(service.baseUrl).to.equal(givenBaseUrl);
  });

  it('should be possible to pass values and factories to a basic type injector', () => {
    const givenBaseUrl = 'http://base.url';
    const givenResult = { content: 'business value' };
    interface HttpService {
      get: (url: string) => any,
    }
    const injectToken = {
      baseUrl: declareInjectToken<string>('base url'),
      http: declareInjectToken<HttpService>('http service'),
    };
    class BusinessService {
      static injectConfig = {
        deps: [injectToken.baseUrl, injectToken.http, Logger],
      }
      constructor(
        public readonly baseUrl: string,
        public readonly httpService: HttpService,
        public readonly logger: Logger,
      ) {}
      getSomething() {
        return this.httpService.get(this.baseUrl) as typeof givenResult;
      }
    }
    const urlCalls = [] as string[];
    class MockedHttpService implements HttpService {
      get = (url: string) => urlCalls.push(url) && givenResult;
    }

    const injector = new BasicTypeInjector({
      instances: {
        [injectToken.baseUrl]: givenBaseUrl,
      },
      factories: {
        [injectToken.http]: {
          deps: [],
          create: () => new MockedHttpService(),
        }
      }
    });

    const businessService = injector.get(BusinessService);

    expect(businessService.logger === injector.get(Logger)).to.be.true;

    const result = businessService.getSomething();
    expect(result === givenResult).to.be.true;
    expect(urlCalls[0]).to.equal(givenBaseUrl);
  });
});
