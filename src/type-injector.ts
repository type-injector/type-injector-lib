import { Logger } from './logger';
import { ConstructorWithoutArguments, InjectableClass, InjectFactory, InjectToken } from './type-injector.model';

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

  /**
   * Get something from the cdi.
   *
   * Might create a new instance or return an existing one.
   *
   * @param token
   * @returns
   */
  get<T>(token: InjectToken<T>): T {
    return this._instances.has(token)
      ? this._instances.get(token) as T
      : this._create(token)
    ;
  }

  protected _factories = new Map<InjectToken<any>, InjectFactory<any>>();
  protected _instances = new Map<InjectToken<any>, any>();
  private _instancesInCreation = new Map<InjectToken<unknown>, {
    factory: InjectFactory<unknown>,
  }>()

  getFactory<T>(token: InjectToken<T>): InjectFactory<T> {
    const providedFactory = this._factories.get(token);
    if (providedFactory) {
      return providedFactory as InjectFactory<T>;
    }

    if (typeof token === 'function') {
      const config = hasInjectConfig(token) ? token.injectConfig : { deps: [] };
      return {
        ...config,
        label: `${token.name}.injectConfig`,
        create: (...params: any[]) => new token(...params) as any as T,
      }
    }

    throw new Error('could not find a factory to create token: ' + this._nameOf(token));
  }

  protected _markAsInCreation(token: InjectToken<unknown>, factory: InjectFactory<unknown>) {
    if (this._instancesInCreation.has(token)) {
      throw new Error(this._createCyclicErrorMessage(token, factory));
    }
    this._instancesInCreation.set(token, { factory });
  }

  protected _finishedCreation(token: InjectToken<unknown>) {
    this._instancesInCreation.delete(token);
  }

  protected _create<T>(token: InjectToken<T>): T {
    const factory = this.getFactory(token);
    this._markAsInCreation(token, factory);

    const params = factory.deps.map((dep) => this.get(dep));
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

  private _createCyclicErrorMessage(token: InjectToken<unknown>, factory: InjectFactory<unknown>) {
    const inCreation = Array.from(this._instancesInCreation.entries()).concat([[token, { factory }]]);
    const dependencyPath = inCreation.map(([token, { factory }]) => {
      const tokenName = this._nameOf(token);
      const factoryName = factory.label || factory.create.name;
      const factoryScope = factory.scope?.description;

      let text = `\n -> ${tokenName}`;
      if (factoryScope) {
        text += `\n      scope: '${factoryScope}'`;
      }
      text += `\n      factory: ${factoryName}`;
      return text;
    });
    const errorMsg = `dependency cycle detected:${dependencyPath.join('\n')}\n\n`;
    this.get(Logger).error(errorMsg);
    return errorMsg;
  }
}

function hasInjectConfig<T>(token: unknown): token is InjectableClass<T> {
  return !!(token as Partial<InjectableClass<T>>).injectConfig;
}
