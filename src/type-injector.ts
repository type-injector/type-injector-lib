import { Logger } from './logger';
import { ConstructorWithoutArguments, InjectableClass, InjectFactory, InjectToken } from './type-injector.model';

export class TypeInjectorFactory {
  protected _instances = new Map<InjectToken<any>, any>();
  protected _factories = new Map<InjectToken<any>, InjectFactory<any>>();

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
  provideValue<T>(token: InjectToken<T>, value: T): TypeInjectorFactory {
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
   provideFactory<T>(token: InjectToken<T>, factory: InjectFactory<T>): TypeInjectorFactory {
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
  provideImplementation<T>(token: InjectToken<T>, impl: ConstructorWithoutArguments<T> | InjectableClass<T>): TypeInjectorFactory {
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

  protected _closeFactory() {
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
    const injector = new TypeInjectorImpl(this._factories, this._instances);
    this._closeFactory();
    return injector;
  }
}

export interface TypeInjector {
  /**
   * Get something from the cdi.
   *
   * Might create a new instance or return an existing one.
   *
   * @param token
   * @returns
   */
  get<T>(token: InjectToken<T>): T;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace TypeInjector {
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
  export function createToken<T>(type: (T & (abstract new (...args: any[]) => any) & { name: string }) | string): InjectToken<T extends abstract new (...args: any[]) => infer U ? U : T> {
    return Symbol.for(`TypeInjectorToken: ${typeof type === 'string' ? type : type.name}`) as symbol & { description: string };
  }

  export function create(): TypeInjectorFactory {
    return new TypeInjectorFactory();
  }

  export function build(): TypeInjector {
    return new TypeInjectorFactory().build();
  }
}

export class TypeInjectorImpl implements TypeInjector {
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

  constructor(
    protected _factories: Map<InjectToken<any>, InjectFactory<any>>,
    protected _instances: Map<InjectToken<any>, any>,
  ) {}

  private _instancesInCreation = new Map<InjectToken<unknown>, {
    factory: InjectFactory<unknown>,
  }>();
  private _initialLogger = new Logger();
  protected get logger(): Logger {
    if (this._instancesInCreation.has(Logger)) {
      return this._initialLogger;
    }
    const logger = this.get(Logger);
    Object.defineProperty(this, 'logger', { value: logger });
    return logger;
  }

  getOptFactory<T>(token: InjectToken<T>): InjectFactory<T> | undefined {
    const providedFactory = this._factories.get(token);
    if (providedFactory) {
      return providedFactory as InjectFactory<T>;
    }

    if (typeof token === 'function') {
      const config = hasInjectConfig(token) ? token.injectConfig : { deps: [] };
      return {
        ...config,
        label: `${token.name}.injectConfig`,
        create: (...args: any[]) => new token(...args) as any as T,
      }
    }
  }

  private _getFactory<T>(token: InjectToken<T>): InjectFactory<T> {
    const factory = this.getOptFactory(token);
    if (!factory) {
      throw new Error('could not find a factory to create token: ' + this._nameOf(token));
    }
    return factory;
  }

  protected _markAsInCreation(token: InjectToken<unknown>, factory: InjectFactory<unknown>, scopeIdent?: symbol & { description: string }) {
    if (this._instancesInCreation.has(token)) {
      const errorMessage = this._createCyclicErrorMessage(token, factory);
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    this._instancesInCreation.set(token, { factory });
    this.logger.info?.((scopeIdent ? `'${scopeIdent.description}'` : 'top level injector')
      + ` starts creation of ${this._createDependencyEntryLog(token, factory)}`
    );
  }

  protected _finishedCreation(token: InjectToken<unknown>) {
    this._instancesInCreation.delete(token);
    this.logger.info?.(`finished creation of ${this._nameOf(token)}`)
  }

  protected _abortedCreation(token: InjectToken<unknown>) {
    this._instancesInCreation.delete(token);
    token !== Logger && this.logger.info?.(`aborted creation of ${this._nameOf(token)}`)
  }

  protected _create<T>(token: InjectToken<T>): T {
    const factory = this._getFactory(token);
    this._markAsInCreation(token, factory);

    const args = factory.deps.map((dep) => this.get(dep));
    const created = factory.create(...args);
    this._instances.set(token, created);

    this._finishedCreation(token);
    return created;
  }

  protected _nameOf = (token: InjectToken<unknown>): string => {
    switch (typeof token) {
      case 'symbol':
        return token.description;
      case 'function':
        return token.name;
    }
  };

  protected _createDependencyEntryLog(token: InjectToken<unknown>, factory: InjectFactory<unknown>) {
    const tokenName = this._nameOf(token);
    const factoryName = factory.label || factory.create.name;

    let text = `\n -> ${tokenName}`;
    text += `\n      factory: ${factoryName}`;
    return text;
  }

  private _createCyclicErrorMessage(token: InjectToken<unknown>, factory: InjectFactory<unknown>) {
    const dependencyPath = Array.from(this._instancesInCreation.entries())
      .concat([[token, { factory }]])
      .map(([token, { factory }]) => this._createDependencyEntryLog(token, factory))
      .join('\n')
    ;
    return `dependency cycle detected:${dependencyPath}\n\n`;
  }
}

function hasInjectConfig<T>(token: unknown): token is InjectableClass<T> {
  return !!(token as Partial<InjectableClass<T>>).injectConfig;
}
