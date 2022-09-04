/**
 * Every class that has an constructor without parameters can get used as Inject token.
 *
 * @typeParam T - defines that InstanceType of the constructor.
 */
export type ConstructorWithoutArguments<T> = new () => T;

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

/**
 * Every class can get an InjectableClass by adding a static injectConfig property.
 *
 * For classes that can get instantiated without constructor arguments it
 * is *not* required to add an injectConfig. An injectConfig is required to
 * tell the TypedInjector to use a constructor with arguments to create a
 * class instance.
 *
 * @see {@link InjectConfig | InjectConfig}
 */
 export type InjectableClass<T> = (new (..._args: any[]) => T) & {
  injectConfig: InjectConfig;
}

/**
 * To configure any dependency type safe you can {@link declareInjectToken | declare an inject token}.
 *
 * @typeParam T - type of the value to get injected with this token.
 */
// T is used when using the token.
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
export type DeclaredInjectToken<T> = symbol & { description: string };

/**
 * An InjectToken can be a {@link ConstructorWithoutArguments}, {@link InjectableClass} or a {@link DeclaredInjectToken}.
 *
 * @typeParam T - defines the required type of the value to inject with that token.
 * @see {@link declareInjectToken}
 */
export type InjectToken<T> = ConstructorWithoutArguments<T> | InjectableClass<T> | DeclaredInjectToken<T>;

/**
 * Create a typed inject token for anything.
 *
 * This helper binds type information to a symbol so you can use that
 * symbol to inject a typed value.
 * Because the TypeInjector has no information how to create this symbol,
 * it has to be provided before it gets injected the first time.
 *
 * @typeParam T - defines the required type of the value to inject with that token.
 * @param type - can be an abstract class or a simple string
 * @returns a token that can be used to first provide then inject anything
 */
export function declareInjectToken<T>(type: (T & (abstract new (...args: any[]) => any) & { name: string }) | string): DeclaredInjectToken<T extends abstract new (...args: any[]) => infer U ? U : T> {
  return Symbol.for(`TypeInjectorToken: ${typeof type === 'string' ? type : type.name}`) as symbol & { description: string };
}
