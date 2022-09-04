import { TypeInjectorBuilder } from './type-injector-builder';
import { InjectToken } from './inject-token';

/**
 * Entrypoint to create TypeInjectors.
 *
 * @see {@link build | TypeInjector.build()} - fastest way to create a TypeInjector that can create simple or statically configured classes.
 * @see {@link construct | TypeInjector.construct()} - to manually provide values, factories or implementations before building the injector.
 */
export abstract class TypeInjector {
  /**
   * Get something from the cdi.
   *
   * Might create a new instance or return an existing one.
   *
   * @typeParam T - type defined by the token. Will match the type of the returned value.
   * @param token - {@link InjectToken} identifying the value to inject
   * @returns a value that implements the type defined by the token.
   */
  abstract get<T>(token: InjectToken<T>): T;

  /**
   * Never create an instance of this class!
   *
   * It's only used as an interface and provides static
   * methods to create TypeInjectors
   */
  private constructor() {
    // prevent creating an instance of this class directly
  }

  /**
   * Starts the construction of a new injector.
   *
   * ```typescript
   * TypeInjector.construct()
   *   [...provide...]
   * .build();
   * ```
   * @returns TypeInjectorBuilder
   * @see {@link build | TypeInjector.build()} - a shortcut to create an injector without configuration
   */
  static construct(): TypeInjectorBuilder {
    return new TypeInjectorBuilder();
  }

  /**
   * Shortcut to create an injector without configuration.
   *
   * @returns TypeInjector
   * @see {@link construct | TypeInjector.construct()} - if you need to provide values, factories or override implementations
   */
  static build(): TypeInjector {
    return new TypeInjectorBuilder().build();
  }
}
