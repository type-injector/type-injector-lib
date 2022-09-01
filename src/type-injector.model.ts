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
  label?: string,
  scope?: symbol,
  create: (...args: any[]) => T,
}

export type ConstructorWithoutArguments<T> = new () => T;

export type InjectToken<T> = ConstructorWithoutArguments<T> | InjectableClass<T> | (symbol & { description: string });
