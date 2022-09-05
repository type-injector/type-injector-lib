import { InjectFactory } from './inject-factory';
import { DeclaredInjectToken, InjectableClass, InjectToken } from './inject-token';
import { Logger } from './logger';

/**
 * Minimalistic TypeInjector.
 *
 * If you don't want to use the builder pattern or subscopes you could use the BasicTypeInjector
 * to further reduce runtime bundle size.
 *
 * @see {@link TypeInjector.construct} - using the builder pattern to configure your injector.
 */
 export class BasicTypeInjector {
  /**
   * Get something from the cdi.
   *
   * Might create a new instance or return an existing one.
   *
   * @typeParam T - Type defined by the token. Will match the type of the returned value.
   * @param token - {@link InjectToken} identifying the value to inject
   * @returns a value that implements the Type defined by the token.
   */
  get<T>(token: InjectToken<T>): T {
    return this._instances.has(token)
      ? this._instances.get(token) as T
      : this._create(token)
    ;
  }

  /**
   * Create a simple new top level injector.
   *
   * @see {@link TypeInjector.construct} - to create a preconfigured injector
   */
  constructor({ instances, factories }: InjectorConfig = {}) {
    this._instances = cloneMap(instances);
    this._factories = cloneMap(factories);
  }

  protected _factories = new Map<InjectToken<any>, InjectFactory<any>>();
  protected _instances = new Map<InjectToken<any>, any>();
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

  /**
   * @internal
   */
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

/**
 * @internal
 */
 export function hasInjectConfig<T>(token: unknown): token is InjectableClass<T> {
  return !!(token as Partial<InjectableClass<T>>).injectConfig;
}

export interface InjectorConfig {
  instances?: Map<InjectToken<any>, any> | { [key: DeclaredInjectToken<any>]: any },
  factories?: Map<InjectToken<any>, InjectFactory<any>> | { [key: DeclaredInjectToken<any>]: InjectFactory<any> },
}

/**
 * @internal
 */
function cloneMap<K, V>(map?: Map<K, V> | { [key: DeclaredInjectToken<any>]: any }): Map<K, V> {
  const clone = new Map<K, V>();
  if (map) {
    if (map instanceof Map) {
      map.forEach((value, key) => clone.set(key, value));
    } else {
      Object.getOwnPropertySymbols(map).forEach((key) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        clone.set(key as any, (map as any)[key]);
      });
    }
  }
  return clone;
}
