[type-injector - v1.0.0-alpha](../README.md) / InjectConfig

# Interface: InjectConfig

## Hierarchy

- **`InjectConfig`**

  ↳ [`InjectFactory`](InjectFactory.md)

## Table of contents

### Properties

- [deps](InjectConfig.md#deps)

## Properties

### deps

• **deps**: [`InjectToken`](../README.md#injecttoken)<`unknown`\>[]

Inject tokens for all arguments required to create an injectable value.

- For classes the dependencies have to match the consturctor parameters
- For all other functions (like factories) the tokens have to match the parameters

In both cases "match" means that the inject tokens return the right types of
all parameters in the same order as they are needed for the function/constructor call.

The dependencies of an inject token are not created before the inject token
itself gets created.

#### Defined in

[inject-token.ts:21](https://github.com/e-hein/type-injector/blob/cdff06c/src/inject-token.ts#L21)
