import { InjectFactory } from './inject-factory';
import { ConstructorWithoutArguments, InjectableClass, InjectToken } from './inject-token';
import { hasInjectConfig, BasicTypeInjector } from './basic-type-injector';

/**
 * Stable DI-Container that can be used everywhere.
 */
export class TypeInjector extends BasicTypeInjector {
  /**
   * Starts the construction of a new injector.
   *
   * ```typescript
   * TypeInjector.construct()
   *   [...provide...]
   * .build();
   * ```
   * @returns TypeInjectorBuilder
   */
   static construct(): TypeInjectorBuilder {
    return new TypeInjectorBuilder();
  }
}

/**
 * Configuration phase of an injector.
 *
 * use {@link build | .build()} to finish configuration.
 */
 export class TypeInjectorBuilder {
  protected _instances = new Map<InjectToken<any>, any>();
  protected _factories = new Map<InjectToken<any>, InjectFactory<any>>();

  /**
   * Provide an existing value for a given token.
   *
   * This can be useful to provide an existing instance of a
   * service class, simple values like flags or configuration objects
   * from the environment.
   *
   * @typeParam T - type defined by the token. Has to match the type of the value.
   * @param token - which will get used to inject the value
   * @param value - that will get returned for the token
   * @returns the Injector itself to allow chaining provides
   */
  provideValue<T>(token: InjectToken<T>, value: T): TypeInjectorBuilder {
    this._instances.set(token, value);
    return this;
  }

  /**
   * Provide a function that lazily creates a value.
   *
   * The provided function will be called the first time the token is requested.
   *
   * @typeParam T - type defined by the token. Has to match the return type of the factory.
   * @param token - which will get used to inject the value
   * @param factory - that creates something that matches the type of the token
   * @returns the Injector itself to allow chaining provides
   */
   provideFactory<T>(token: InjectToken<T>, factory: InjectFactory<T>): TypeInjectorBuilder {
    this._factories.set(token, factory);
    return this;
  }

  /**
   * Provide an (alternative) implementation.
   *
   * This is a shortcut to create a factory for an implementation
   * that is injectable itself (has no constructor args / static inject config).
   * Like every factory it's called lazily on the first request of the token.
   *
   * @typeParam T - type defined by the token. Has to match the type of the implementation.
   * @param token - which will get used to inject the value
   * @param impl - to instanciate as soon as it's requested the first time
   * @returns the Injector itself to allow chaining provides
   */
  provideImplementation<T>(token: InjectToken<T>, impl: ConstructorWithoutArguments<T> | InjectableClass<T>): TypeInjectorBuilder {
    const label = `provideImpl: ${impl.name}`;
    if (hasInjectConfig(impl)) {
      return this.provideFactory(token, {
        label, create: (...args: any[]) => new impl(...args), ...impl.injectConfig,
      });
    } else {
      return this.provideFactory(token, {
        label, deps: [], create: () => new impl(),
      });
    }
  }

  protected _closeBuilder() {
    const alreadyCreatedInjector = () => {
      throw new Error('injector already built - no further configuration/builds possible');
    }
    this.provideFactory = alreadyCreatedInjector;
    this.provideImplementation = alreadyCreatedInjector;
    this.provideValue = alreadyCreatedInjector;
    this.build = alreadyCreatedInjector;
    this._factories = new Map();
    this._instances = new Map();
  }

  /**
   * Finish configuration of the TypeInjector
   */
  build(): TypeInjector {
    const injector = new TypeInjector({
      instances: this._instances,
      factories: this._factories,
    });
    this._closeBuilder();
    return injector;
  }
}
