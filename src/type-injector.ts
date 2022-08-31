import { ConstructorWithoutArguments, InjectableClass, InjectFactory, InjectToken } from './public-base';
import { hasInjectConfig, Initiator, startOfCycle } from './private-base';
import { Logger } from './logger';

export class TypeInjector {
  /**
   * Create a typed inject token for anything.
   *
   * This helper binds type information to a symbol so you can use that
   * symbol to inject a typed value.
   * Because the TypeInjector has no information how to create this symbol,
   * it has to be provided before it gets injected the first time.
   *
   * @param type can be an abstract class or a simple string
   * @returns a token that can be used to first provide then inject anything
   */
  static createToken<T>(type: (T & (abstract new (...params: any[]) => any) & { name: string }) | string): InjectToken<T extends abstract new (...args: any[]) => infer U ? U : T> {
    return Symbol.for(`TypeInjectorToken: ${typeof type === 'string' ? type : type.name}`);
  }

  /**
   * Provide an existing value for a given token.
   *
   * This can be useful to provide an existing instance of a
   * service class, simple values like flags or configuration objects
   * from the environment.
   *
   * @param token which is used to inject the value
   * @param value that will get returned for the token
   * @returns the Injector itself to allow chaining provides
   */
  provideValue<T>(token: InjectToken<T>, value: T): TypeInjector {
    this._instances.set(token, value);
    return this;
  }

  /**
   * Provide a function that lazily create a value.
   *
   * The provided function will be called the first time the token is requested.
   *
   * @param token which is used to inject the value
   * @param factory that creates something that matches the type of the token
   * @returns the Injector itself to allow chaining provides
   */
  provideFactory<T>(token: InjectToken<T>, factory: InjectFactory<T>): TypeInjector {
    this._factories.set(token, factory);
    return this;
  }

  /**
   * Provide an (alternative) implementation.
   *
   * This is a shortcut to create a factory for an implementation
   * that is injectable itself (has no constructor args / static inject config).
   * Like every factory it's called lazy on the first request of the token.
   *
   * @param token general class or created inject token for an interface
   * @param impl to instanciate as soon as it's requested the first time
   * @returns the Injector itself to allow chaining provides
   */
  provideImplementation<T>(token: InjectToken<T>, impl: ConstructorWithoutArguments<T> | InjectableClass<T>) {
    if (hasInjectConfig(impl)) {
      this._factories.set(token, {
        ...impl.injectConfig,
        create: (...args: any[]) => new impl(...args),
      });
    } else {
      this._factories.set(token, {
        deps: [],
        create: () => new impl(),
      });
    }
    return this;
  }

  /**
   * Get something from the cdi.
   *
   * Might create a new instance or return an existing one.
   *
   * @param token
   * @returns
   */
  get<T>(token: InjectToken<T>): T {
    return this._get(token, startOfCycle);
  }

  protected _factories = new Map<InjectToken<any>, InjectFactory<any>>();
  protected _instances = new Map<InjectToken<any>, any>();
  private _instancesInCreation = new Map<InjectToken<any>, any>();

  getFactory<T>(token: InjectToken<T>): InjectFactory<T> {
    const providedFactory = this._factories.get(token);
    if (providedFactory) {
      return providedFactory as InjectFactory<T>;
    }

    if (typeof token === 'function') {
      const config = hasInjectConfig(token) ? token.injectConfig : { deps: [] };
      return {
        ...config,
        create: (...params: any[]) => new token(...params) as any as T,
      }
    }

    throw new Error('could not find a factory to create token: ' + this._nameOf(token));
  }

  protected _markAsInCreation(token: InjectToken<unknown>, initiator: Initiator) {
    if (this._instancesInCreation.has(token)) {
      throw new Error(this._createCyclicErrorMessage(token));
    }
    this._instancesInCreation.set(token, initiator);
  }

  protected _finishedCreation(token: InjectToken<unknown>) {
    this._instancesInCreation.delete(token);
  }

  protected _create<T>(token: InjectToken<T>, initiator: Initiator): T {
    this._markAsInCreation(token, initiator);

    const factory = this.getFactory(token);
    const params = factory.deps.map((dep) => this._get(dep, token));
    const created = factory.create(...params);
    this._instances.set(token, created);

    this._finishedCreation(token);
    return created;
  }

  private _nameOf = (token: InjectToken<unknown>): string => {
    switch (typeof token) {
      case 'symbol':
        return token.description || token.toString() || 'unknown';
      case 'function':
        return token.name;
    }
  };

  private _createCyclicErrorMessage(token: InjectToken<unknown>) {
    const errorMsg = `dependency cycle detected: ${Array.from(this._instancesInCreation.keys())
      .concat(token)
      .map((key) => this._nameOf(key)).join('\n -> ')}\n`;
    this.get(Logger).error(errorMsg);
    return errorMsg;
  }

  protected _get<T>(token: InjectToken<T>, initiator: Initiator): T {
    return this._instances.has(token)
      ? this._instances.get(token) as T
      : this._create(token, initiator)
    ;
  }
}
