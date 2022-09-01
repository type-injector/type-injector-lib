import { InjectFactory, InjectToken } from './type-injector.model';
import { TypeInjector, TypeInjectorBuilder, TypeInjectorImpl } from './type-injector';
import { Logger } from './logger';

export class ChildInjector extends TypeInjectorImpl {
  static withIdent(ident: symbol) {
    return {
      from(parent: TypeInjector): TypeInjectorBuilder {
        return new class extends TypeInjectorBuilder {
          provideFactory<T>(token: InjectToken<T>, factory: InjectFactory<T>): TypeInjectorBuilder {
            return super.provideFactory(
              token,
              { ...factory, scope: ident },
            )
          }
          build() {
            const childInjector = new ChildInjector(
              ident as symbol & { description: string },
              parent as TypeInjectorImpl,
              this._factories,
              this._instances,
            );
            this._closeFactory();
            return childInjector;
          }
        }
      }
    };
  }

  private _ownInstances: any[];

  private constructor(
    public readonly ident: symbol & { description: string },
    private _parent: TypeInjectorImpl,
    _factories: Map<InjectToken<any>, InjectFactory<any>>,
    _instances: Map<InjectToken<any>, any>,
  ) {
    super(_factories, _instances);
    this._ownInstances = Array.from(_instances.values());
  }

  getOptFactory<T>(token: InjectToken<T>): InjectFactory<T> {
    return this._factories.get(token) as InjectFactory<T> || this._parent.getOptFactory(token);
  }

  private _createInOwnScope<T>(token: InjectToken<T>, factory: InjectFactory<T>): InstanceWithSource<T> {
    this._markAsInCreation(token, factory);
    const args = factory.deps.map((dep) => this.get(dep));
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

  protected _markAsInCreation(token: InjectToken<unknown>, factory: InjectFactory<unknown>, scopeIdent = this.ident) {
    super._markAsInCreation(token, factory, scopeIdent);
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
  private _hasOwnDependencies(token: InjectToken<unknown>, factory: InjectFactory<unknown>): boolean {
    token !== Logger && this.logger.info?.(`start dependency check of ${this._nameOf(token)} in '${this.ident.description}'`);
    this._markAsInCreation(token, factory);
    const dependencyInScope = factory.deps.find((dep) => {
      const instance = this.get(dep);
      return this._ownInstances.includes(instance);
    });
    this._abortedCreation(token);
    token !== Logger && this.logger.info?.(
      `dependency check result: '${this._nameOf(token)}' ${dependencyInScope
        ? `depends on '${this._nameOf(dependencyInScope)}' provided`
        : 'has *no* overridden dependencies'
      } in '${this.ident.description}'`
    );
    return !!dependencyInScope;
  }

  private _createWithSource<T>(token: InjectToken<T>): InstanceWithSource<T> {
    const providedFactory = this._factories.get(token);
    if (providedFactory) {
      return this._createInOwnScope<T>(token, providedFactory);
    }

    const parentFactory = this._parent.getOptFactory<T>(token);
    if (parentFactory && this._hasOwnDependencies(token, parentFactory)) {
      return this._createInOwnScope(token, parentFactory);
    } else {
      return this._useInstanceFromParentScope(token);
    }
  }

  protected _createDependencyEntryLog(token: InjectToken<unknown>, factory: InjectFactory<unknown>): string {
    return super._createDependencyEntryLog(token, factory)
      + `\n      scope: '${factory.scope?.description || 'top level injector'}'`
    ;
  }

  protected _create<T>(token: InjectToken<T>): T {
    return this._createWithSource(token).instance;
  }
}

interface InstanceWithSource<T> {
  instance: T,
  fromParentScope: boolean,
}
