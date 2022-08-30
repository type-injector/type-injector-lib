import { expect } from 'chai';
import { Logger } from './logger';
import { InjectConfig, TypeInjector } from './type-injector';

describe('scopes', () => {
  it('should always return the same instance', () => {
    class BaseService {
      readonly isBaseService = true;
    }

    const injector = new TypeInjector();
    const base1 = injector.get(BaseService);
    const base2 = injector.get(BaseService);

    expect(base1 === base2).to.be.true;
  });

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
