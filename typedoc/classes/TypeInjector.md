[type-inject](../README.md) / [Exports](../modules.md) / TypeInjector

# Class: TypeInjector

Entrypoint to create TypeInjectors.

**`See`**

 - [TypeInjector.build()](TypeInjector.md#build) - fastest way to create a TypeInjector that can create simple or statically configured classes.
 - [TypeInjector.construct()](TypeInjector.md#construct) - to manually provide values, factories or implementations before building the injector.

## Table of contents

### Methods

- [get](TypeInjector.md#get)
- [build](TypeInjector.md#build)
- [construct](TypeInjector.md#construct)

## Methods

### get

▸ `Abstract` **get**<`T`\>(`token`): `T`

Get something from the cdi.

Might create a new instance or return an existing one.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `token` | [`InjectToken`](../modules.md#injecttoken)<`T`\> | [InjectToken](../modules.md#injecttoken) identifying the value to inject |

#### Returns

`T`

#### Defined in

[type-injector.ts:19](https://github.com/e-hein/type-inject/blob/51d9756/src/type-injector.ts#L19)

___

### build

▸ `Static` **build**(): [`TypeInjector`](TypeInjector.md)

Shortcut to create an injector without configuration.

**`See`**

[TypeInjector.construct()](TypeInjector.md#construct) - if you need to provide values, factories or override implementations

#### Returns

[`TypeInjector`](TypeInjector.md)

TypeInjector

#### Defined in

[type-injector.ts:50](https://github.com/e-hein/type-inject/blob/51d9756/src/type-injector.ts#L50)

___

### construct

▸ `Static` **construct**(): [`TypeInjectorBuilder`](TypeInjectorBuilder.md)

Starts the construction of a new injector.

After calling construct you can chain several methods to
configure the injector before you finally .build() it.

**`See`**

[TypeInjector.build()](TypeInjector.md#build) - a shortcut to create an injector without configuration

#### Returns

[`TypeInjectorBuilder`](TypeInjectorBuilder.md)

TypeInjectorBuilder

#### Defined in

[type-injector.ts:40](https://github.com/e-hein/type-inject/blob/51d9756/src/type-injector.ts#L40)
