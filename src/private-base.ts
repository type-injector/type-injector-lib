import { InjectableClass, InjectToken } from './public-base';

export type Initiator = InjectToken<unknown> | typeof startOfCycle;

export function hasInjectConfig<T>(token: unknown): token is InjectableClass<T> {
  return !!(token as Partial<InjectableClass<T>>).injectConfig;
}

export const startOfCycle = 'startOfCycle' as const;
