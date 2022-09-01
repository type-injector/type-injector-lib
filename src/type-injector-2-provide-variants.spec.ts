import { expect } from 'chai';
import { TypeInjector } from './type-injector';

describe('provide variants', () => {
  describe('provide value', () => {
    it('should be possible to provide a value', () => {
      const injectToken = TypeInjector.createToken<{ name: string}>('TestInjectToken');
      const givenValue = { name: 'givenValue' };
      const injector = TypeInjector.create()
        .provideValue(injectToken, givenValue)
        .build()
      ;
      expect(injector.get(injectToken) === givenValue).to.be.true;
    });

    class BaseService {
      isProvided = false;
    }

    it('should always prefer provided values', () => {
      const injector = TypeInjector.create()
        .provideValue(BaseService, { isProvided: true })
        .build()
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
      const injector = TypeInjector.create()
        .provideFactory(FactoryResult, {
          deps: [],
          create: () => {
            factoryCalls++;
            return new FactoryResult();
          },
        })
        .build()
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
      interface MyService {
        typeName: string;
      }
      const myServiceInjectToken = TypeInjector.createToken<MyService>('MyService');

      class MyServiceImpl implements MyService {
        readonly typeName = 'SpecialImpl';
      }

      const injector = TypeInjector.create()
        .provideImplementation(myServiceInjectToken, MyServiceImpl)
        .build()
      ;
      const instance = injector.get(myServiceInjectToken);

      expect(instance.typeName).to.equal('SpecialImpl');
    });
  });
});
