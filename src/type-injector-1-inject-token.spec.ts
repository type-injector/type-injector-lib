import { expect } from 'chai';
import { InjectConfig, TypeInjector } from './type-injector';

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

    const injetor = new TypeInjector();
    const instance = injetor.get(ComposedClassWithConfiguration);

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
    class ThirdPartyLibraryServiceWithInjectConfig extends ThirdPartyLibraryService {
      static injectConfig: InjectConfig = {
        deps: [SimpleClass]
      }
    }

    const injetor = new TypeInjector();
    const instance = injetor.get(ThirdPartyLibraryServiceWithInjectConfig);

    expect(instance.simpleClass.prop).to.equal(givenSimpleClassPropValue);
  });

  describe('create inject token for anyting', () => {
    it('should be possible to inject boolean values', () => {
      const givenBooleanValue = false;
      const tokenForBoolean = TypeInjector.createToken<boolean>('any unique string');

      const injector = new TypeInjector()
        .provideValue(tokenForBoolean, givenBooleanValue)
      ;
      const result = injector.get(tokenForBoolean);

      expect(result).to.equal(givenBooleanValue);
    });
  });

  it('should be possible to inject functions', () => {
    let expectedResult = 'initial value';
    const providedFunction = () => expectedResult;
    const tokenForFunction = TypeInjector.createToken<() => string>('any unique string');

    const injector = new TypeInjector()
      .provideValue(tokenForFunction, providedFunction)
    ;
    const fn = injector.get(tokenForFunction);
    expectedResult = 'current value';
    const actualResult = fn();

    expect(actualResult).to.equal(expectedResult);
  });

  it('should be possible to inject any object', () => {
    const providedObject = { prop: 'initial value' };
    const tokenForObject = TypeInjector.createToken<{ prop: string }>('any unique string');

    const injector = new TypeInjector()
      .provideValue(tokenForObject, providedObject)
    ;
    const instance = injector.get(tokenForObject);

    expect(instance === providedObject).to.be.true;
  });
});
