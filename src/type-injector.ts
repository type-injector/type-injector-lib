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
  static createToken<T>(type: (T & (abstract new (...args: any[]) => any) & { name: string }) | string): InjectToken<T extends abstract new (...args: any[]) => infer U ? U : T> {
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
    return this._get(token, 'startOfCycle');
  }

  private _factories = new Map<InjectToken<any>, InjectFactory<any>>();
  private _instances = new Map<InjectToken<any>, any>();
  private _instancesInCreation = new Map<InjectToken<any>, any>();

  private _getFactory<T>(token: InjectToken<T>) {
    const providedFactory = this._factories.get(token);
    if (providedFactory) {
      return providedFactory;
    }

    if (typeof token === 'function') {
      const config = hasInjectConfig(token) ? token.injectConfig : { deps: [] };
      return {
        ...config,
        create: (...args: any[]) => new token(...args) as any as T,
      }
    }
  }

  private _create<T>(token: InjectToken<T>, initiator: Initiator): T {
    if (this._instancesInCreation.has(token)) {
      throw new Error(this._createCyclicErrorMessage(token));
    }
    this._instancesInCreation.set(token, initiator);

    const factory = this._getFactory(token);
    if (factory) {
      const args = factory.deps.map((dep) => this._get(dep, token));
      const created = factory.create(...args) as T;
      this._instancesInCreation.delete(token);
      this._instances.set(token, created);
      return created;
    }

    throw new Error('could not find a factory to create token');
  }

  private _createCyclicErrorMessage(token: InjectToken<unknown>) {
    const nameOf = (arg: Initiator): string => {
      if (!arg) {
        return 'undefined';
      }
      if (arg === startOfCycle) {
        return nameOf(token);
      }
      switch (typeof arg) {
        case 'symbol':
          return arg.description || arg.toString() || 'unknown';
        case 'function':
          return arg.name;
      }
    };
    const errorMsg = `dependency cycle detected: ${Array.from(this._instancesInCreation.keys())
      .concat(token)
      .map((key) => nameOf(key)).join('\n -> ')}\n`;
    this.get(Logger).error(errorMsg);
    return errorMsg;
  }

  private _get<T>(token: InjectToken<T>, initiator: Initiator): T {
    return this._instances.has(token)
      ? this._instances.get(token) as T
      : this._create(token, initiator)
    ;
  }
}

const startOfCycle = 'startOfCycle' as const;

/**
 * Every class can get an InjectableClass by adding a static injectConfig property.
 *
 * For classes that can get instantiated without constructor arguments it
 * is *not* required to add an injectConfig. An injectConfig is required to
 * tell the TypedInjector to use a constructor with arguments to create a
 * class instance.
 *
 * @see {@link InjectConfig InjectConfig}
 */
export type InjectableClass<T> = (new (..._args: any[]) => T) & {
  injectConfig: InjectConfig;
}

export interface InjectConfig {
  /**
   * Inject tokens for all arguments required to create an injectable value.
   *
   * - For classes the dependencies have to match the consturctor parameters
   * - For all other functions (like factories) the tokens have to match the parameters
   *
   * In both cases "match" means that the inject tokens return the right types of
   * all parameters in the same order as they are needed for the function/constructor call.
   *
   * The dependencies of an inject token are not created before the inject token
   * itself gets created.
   */
  deps: InjectToken<unknown>[];
}

export interface InjectFactory<T> extends InjectConfig {
  create: (...args: any[]) => T,
}

export type ConstructorWithoutArguments<T> = new () => T;

export type InjectToken<T> = ConstructorWithoutArguments<T> | InjectableClass<T> | symbol;

type Initiator = InjectToken<unknown> | typeof startOfCycle;

function hasInjectConfig<T>(token: unknown): token is InjectableClass<T> {
  return !!(token as Partial<InjectableClass<T>>).injectConfig;
}
