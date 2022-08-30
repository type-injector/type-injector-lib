import { Logger } from './logger';

export class TypeInjector {
  static createToken<T>(type: (T & (abstract new (...args: any[]) => any) & { name: string }) | string): InjectToken<T extends abstract new (...args: any[]) => infer U ? U : T> {
    return Symbol.for(`TypeInjectorToken: ${typeof type === 'string' ? type : type.name}`);
  }

  provideValue<T>(token: InjectToken<T>, value: T): TypeInjector {
    this._instances.set(token, value);
    return this;
  }

  provideFactory<T>(token: InjectToken<T>, factory: InjectFactory<T>): TypeInjector {
    this._factories.set(token, factory);
    return this;
  }

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
      throw new Error(this._createCycligErrorMessage(token));
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

  private _createCycligErrorMessage(token: InjectToken<unknown>) {
    this.get(Logger).error('dependency cycle', this._instancesInCreation.keys());
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
    return `dependency cycle: ${Array.from(this._instancesInCreation.keys()).map((key) => nameOf(key)).join('->')}`;
  }

  private _get<T>(token: InjectToken<T>, initiator: Initiator): T {
    return this._instances.has(token)
      ? this._instances.get(token) as T
      : this._create(token, initiator)
    ;
  }
}

const startOfCycle = 'startOfCycle' as const;

export type InjectableClass<T> = (new (..._args: any[]) => T) & {
  injectConfig: InjectConfig;
}

export interface InjectConfig {
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
