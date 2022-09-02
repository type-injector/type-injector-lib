[type-inject](../README.md) / [Exports](../modules.md) / TypeInjectorBuilder

# Class: TypeInjectorBuilder

Configuration phase of an injector.

use [.build()](TypeInjectorBuilder.md#build) to finish configuration.

## Table of contents

### Constructors

- [constructor](TypeInjectorBuilder.md#constructor)

### Methods

- [build](TypeInjectorBuilder.md#build)
- [provideFactory](TypeInjectorBuilder.md#providefactory)
- [provideImplementation](TypeInjectorBuilder.md#provideimplementation)
- [provideValue](TypeInjectorBuilder.md#providevalue)

## Constructors

### constructor

• **new TypeInjectorBuilder**()

## Methods

### build

▸ **build**(): [`TypeInjector`](TypeInjector.md)

Finish configuration of the TypeInjector

#### Returns

[`TypeInjector`](TypeInjector.md)

#### Defined in

[type-injector.ts:82](https://github.com/e-hein/type-inject/blob/ae9b59e/src/type-injector.ts#L82)

___

### provideFactory

▸ **provideFactory**<`T`\>(`token`, `factory`): [`TypeInjectorBuilder`](TypeInjectorBuilder.md)

Provide a function that lazily creates a value.

The provided function will be called the first time the token is requested.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `token` | [`InjectToken`](../modules.md#injecttoken)<`T`\> | which will get used to inject the value |
| `factory` | [`InjectFactory`](../interfaces/InjectFactory.md)<`T`\> | that creates something that matches the type of the token |

#### Returns

[`TypeInjectorBuilder`](TypeInjectorBuilder.md)

the Injector itself to allow chaining provides

#### Defined in

[type-injector.ts:38](https://github.com/e-hein/type-inject/blob/ae9b59e/src/type-injector.ts#L38)

___

### provideImplementation

▸ **provideImplementation**<`T`\>(`token`, `impl`): [`TypeInjectorBuilder`](TypeInjectorBuilder.md)

Provide an (alternative) implementation.

This is a shortcut to create a factory for an implementation
that is injectable itself (has no constructor args / static inject config).
Like every factory it's called lazily on the first request of the token.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `token` | [`InjectToken`](../modules.md#injecttoken)<`T`\> | which will get used to inject the value |
| `impl` | [`ConstructorWithoutArguments`](../modules.md#constructorwithoutarguments)<`T`\> \| [`InjectableClass`](../modules.md#injectableclass)<`T`\> | to instanciate as soon as it's requested the first time |

#### Returns

[`TypeInjectorBuilder`](TypeInjectorBuilder.md)

the Injector itself to allow chaining provides

#### Defined in

[type-injector.ts:54](https://github.com/e-hein/type-inject/blob/ae9b59e/src/type-injector.ts#L54)

___

### provideValue

▸ **provideValue**<`T`\>(`token`, `value`): [`TypeInjectorBuilder`](TypeInjectorBuilder.md)

Provide an existing value for a given token.

This can be useful to provide an existing instance of a
service class, simple values like flags or configuration objects
from the environment.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `token` | [`InjectToken`](../modules.md#injecttoken)<`T`\> | which will get used to inject the value |
| `value` | `T` | that will get returned for the token |

#### Returns

[`TypeInjectorBuilder`](TypeInjectorBuilder.md)

the Injector itself to allow chaining provides

#### Defined in

[type-injector.ts:24](https://github.com/e-hein/type-inject/blob/ae9b59e/src/type-injector.ts#L24)
