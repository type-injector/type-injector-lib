import { InjectConfig } from './inject-token';

/**
 * Define a factory method with dependencies to create an injectable value.
 */
 export interface InjectFactory<T> extends InjectConfig {
  label?: string,
  scope?: symbol,
  create: (...args: any[]) => T,
}
