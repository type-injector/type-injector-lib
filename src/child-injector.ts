import { Initiator } from './private-base';
import { InjectFactory, InjectToken } from './public-base';
import { TypeInjector } from './type-injector';

export class ChildInjector extends TypeInjector {
  static withIdent(ident: symbol) {
    return {
      from(parent: TypeInjector): TypeInjector {
        return new ChildInjector(ident, parent);
      }
    };
  }

  private _ownInstances = [] as any[];

  private constructor(
    public readonly ident: symbol,
    private _parent: TypeInjector,
  ) {
    super();
  }

  provideValue<T>(token: InjectToken<T>, value: T): TypeInjector {
    this._ownInstances.push(value);
    return super.provideValue(token, value);
  }

  getFactory<T>(token: InjectToken<T>): InjectFactory<T> {
    return this._factories.get(token) as InjectFactory<T> || this._parent.getFactory(token);
  }

  private _createInOwnScope<T>(token: InjectToken<T>, initiator: Initiator, factory: InjectFactory<T>): InstanceWithSource<T> {
    this._markAsInCreation(token, initiator);
    const args = factory.deps.map((dep) => this._get(dep, token));
    const created = factory.create(...args);
    this._ownInstances.push(created);
    this._instances.set(token, created);
    this._finishedCreation(token);
    return {
      instance: created,
      fromParentScope: false,
    };
  }

  /**
   * Do not create an own instance but ask parent scope for an instance.
   *
   * After checking that no own instance is needed this method can get called to
   * query the parent scope to resolve the token. This might create a new instance
   * in the (parent) parent if it doesn't exist yet.
   *
   * This instance is linked into _instances to prevent further calls with the same
   * token to repeat all dependency checks.
   *
   * @param token
   * @returns instance from parent + flag that it is from parent
   */
  private _useInstanceFromParentScope<T>(token: InjectToken<T>): InstanceWithSource<T> {
    const refFromParent = this._parent.get(token);
    this._instances.set(token, refFromParent);
    return {
      instance: refFromParent,
      fromParentScope: true,
    }
  }

  /**
   * Checks if there are own/overridden dependencies.
   *
   * Therefore this function will query for all dependencies which
   * might trigger lazy creation. But all of them are cached in the
   * appropriate scope and needed for the creation anyway so there's
   * not much wasted computing time (only a duplicate lookup).
   *
   * Even if it does not create the requested value it's important
   * to add it to the values in creation to detect dependency cycles.
   *
   * @param token
   * @param initiator
   */
  private _hasOwnDependencies(token: InjectToken<unknown>, initiator: Initiator, factory: InjectFactory<unknown>): boolean {
    this._markAsInCreation(token, initiator);
    const hasOwnDependencies = factory.deps.some((dep) => {
      const instance = this._get(dep, token);
      return this._ownInstances.includes(instance);
    });
    this._finishedCreation(token);
    return hasOwnDependencies;
  }

  private _createWithSource<T>(token: InjectToken<T>, initiator: Initiator): InstanceWithSource<T> {
    const providedFactory = this._factories.get(token);
    if (providedFactory) {
      return this._createInOwnScope<T>(token, initiator, providedFactory);
    }

    const parentFactory = this._parent.getFactory<T>(token);
    if (this._hasOwnDependencies(token, initiator, parentFactory)) {
      return this._createInOwnScope(token, initiator, parentFactory);
    } else {
      return this._useInstanceFromParentScope(token);
    }
  }

  protected _create<T>(token: InjectToken<T>, initiator: Initiator): T {
    return this._createWithSource(token, initiator).instance;
  }
}

interface InstanceWithSource<T> {
  instance: T,
  fromParentScope: boolean,
}
