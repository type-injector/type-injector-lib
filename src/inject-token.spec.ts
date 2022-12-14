import { expect } from 'chai';
import { declareInjectToken, InjectConfig, TypeInjector } from './index';

describe('inject tokens', () => {
  it('should be possible to use any constructor without arguments as inject token', () => {
    const simpleClassPropValue = 'given simple class prop value';
    class SimpleClass {
      prop = simpleClassPropValue;
    }

    const injector = new TypeInjector();
    const instance = injector.get(SimpleClass);

    expect(instance.prop).to.equal(simpleClassPropValue);
  });

  it('should be possible to enable injection of any class by adding a static inject config', () => {
    const givenSimpleClassPropValue = 'given simple class prop value';
    class SimpleClass {
      prop = givenSimpleClassPropValue;
    }
    class ComposedClassWithConfiguration {
      simpleClass: SimpleClass;

      static injectConfig: InjectConfig = {
        deps: [SimpleClass]
      }
      constructor(simpleClass: SimpleClass) {
        this.simpleClass = simpleClass;
      }
    }

    const injector = new TypeInjector();
    const instance = injector.get(ComposedClassWithConfiguration);

    expect(instance.simpleClass.prop).to.equal(givenSimpleClassPropValue);
  });

  it('should be possible to add static inject config by extending a class', () => {
    const givenSimpleClassPropValue = 'given simple class prop value';
    class SimpleClass {
      prop = givenSimpleClassPropValue;
    }
    class ThirdPartyLibraryService {
      simpleClass: SimpleClass;

      constructor(simpleClass: SimpleClass) {
        this.simpleClass = simpleClass;
      }
    }
    const thirdPartyLibraryService = declareInjectToken(ThirdPartyLibraryService)

    const injector = TypeInjector.construct()
      .provideFactory(thirdPartyLibraryService, {
        deps: [SimpleClass],
        create: (simpleClass) => new ThirdPartyLibraryService(simpleClass),
      })
      .build()
    ;
    const instance = injector.get(thirdPartyLibraryService);

    expect(instance.simpleClass.prop).to.equal(givenSimpleClassPropValue);
  });

  describe('create inject token for anyting', () => {
    it('should be possible to inject boolean values', () => {
      const givenBooleanValue = false;
      const tokenForBoolean = declareInjectToken<boolean>('any unique string');

      const injector = TypeInjector.construct()
        .provideValue(tokenForBoolean, givenBooleanValue)
        .build()
      ;
      const result = injector.get(tokenForBoolean);

      expect(result).to.equal(givenBooleanValue);
    });

    it('should be possible to inject functions', () => {
      let expectedResult = 'initial value';
      const providedFunction = () => expectedResult;
      const tokenForFunction = declareInjectToken<() => string>('any unique string');

      const injector = TypeInjector.construct()
        .provideValue(tokenForFunction, providedFunction)
        .build()
      ;
      const fn = injector.get(tokenForFunction);
      expectedResult = 'current value';
      const actualResult = fn();

      expect(actualResult).to.equal(expectedResult);
    });

    it('should be possible to inject any object', () => {
      const providedObject = { prop: 'initial value' };
      const tokenForObject = declareInjectToken<{ prop: string }>('any unique string');

      const injector = TypeInjector.construct()
        .provideValue(tokenForObject, providedObject)
        .build()
      ;
      const instance = injector.get(tokenForObject);

      expect(instance === providedObject).to.be.true;
    });
  });

  it('will throw an error for tokens that are not provided (yet)', () => {
    const unknownToken = declareInjectToken('unknown');
    const injector = new TypeInjector();

    try {
      injector.get(unknownToken);
      expect.fail('did not throw');
    } catch (e) {
      expect((e as {message: string}).message).to.include('could not find a factory');
    }
  });
});
