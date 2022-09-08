[type-injector - v1.0.0-alpha](../README.md) / InjectFactory

# Interface: InjectFactory<T\>

Define a factory method with dependencies to create an injectable value.

## Type parameters

| Name |
| :------ |
| `T` |

## Hierarchy

- [`InjectConfig`](InjectConfig.md)

  ↳ **`InjectFactory`**

## Table of contents

### Properties

- [create](InjectFactory.md#create)
- [deps](InjectFactory.md#deps)
- [label](InjectFactory.md#label)
- [scope](InjectFactory.md#scope)

## Properties

### create

• **create**: (...`args`: `any`[]) => `T`

#### Type declaration

▸ (...`args`): `T`

##### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | `any`[] |

##### Returns

`T`

#### Defined in

[inject-factory.ts:9](https://github.com/e-hein/type-inject/blob/5c37f1b/src/inject-factory.ts#L9)

___

### deps

• **deps**: [`InjectToken`](../README.md#injecttoken)<`unknown`\>[]

Inject tokens for all arguments required to create an injectable value.

- For classes the dependencies have to match the consturctor parameters
- For all other functions (like factories) the tokens have to match the parameters

In both cases "match" means that the inject tokens return the right types of
all parameters in the same order as they are needed for the function/constructor call.

The dependencies of an inject token are not created before the inject token
itself gets created.

#### Inherited from

[InjectConfig](InjectConfig.md).[deps](InjectConfig.md#deps)

#### Defined in

[inject-token.ts:21](https://github.com/e-hein/type-inject/blob/5c37f1b/src/inject-token.ts#L21)

___

### label

• `Optional` **label**: `string`

#### Defined in

[inject-factory.ts:7](https://github.com/e-hein/type-inject/blob/5c37f1b/src/inject-factory.ts#L7)

___

### scope

• `Optional` **scope**: `symbol`

#### Defined in

[inject-factory.ts:8](https://github.com/e-hein/type-inject/blob/5c37f1b/src/inject-factory.ts#L8)
