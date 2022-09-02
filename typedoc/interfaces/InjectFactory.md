[type-inject](../README.md) / [Exports](../modules.md) / InjectFactory

# Interface: InjectFactory<T\>

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

[type-injector.model.ts:34](https://github.com/e-hein/type-inject/blob/ae9b59e/src/type-injector.model.ts#L34)

___

### deps

• **deps**: [`InjectToken`](../modules.md#injecttoken)<`unknown`\>[]

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

[type-injector.model.ts:28](https://github.com/e-hein/type-inject/blob/ae9b59e/src/type-injector.model.ts#L28)

___

### label

• `Optional` **label**: `string`

#### Defined in

[type-injector.model.ts:32](https://github.com/e-hein/type-inject/blob/ae9b59e/src/type-injector.model.ts#L32)

___

### scope

• `Optional` **scope**: `symbol`

#### Defined in

[type-injector.model.ts:33](https://github.com/e-hein/type-inject/blob/ae9b59e/src/type-injector.model.ts#L33)
