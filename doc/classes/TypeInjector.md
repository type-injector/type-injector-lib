[type-inject](../README.md) / [Exports](../modules.md) / TypeInjector

# Class: TypeInjector

Entrypoint to create TypeInjectors and InjectTokens.

**`See`**

 - [TypeInjector.build()](TypeInjector.md#build) - fastest way to create a TypeInjector that can create simple or statically configured classes.
 - [TypeInjector.construct()](TypeInjector.md#construct) - to manually provide values, factories or implementations before building the injector.
 - [TypeInjector.createToken()](TypeInjector.md#createtoken) - to create type safe inject tokens used to provide values or factories

## Table of contents

### Methods

- [get](TypeInjector.md#get)
- [build](TypeInjector.md#build)
- [construct](TypeInjector.md#construct)
- [createToken](TypeInjector.md#createtoken)

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

[type-injector.ts:105](https://github.com/e-hein/type-inject/blob/4e7c44a/src/type-injector.ts#L105)

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

[type-injector.ts:151](https://github.com/e-hein/type-inject/blob/4e7c44a/src/type-injector.ts#L151)

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

[type-injector.ts:141](https://github.com/e-hein/type-inject/blob/4e7c44a/src/type-injector.ts#L141)

___

### createToken

▸ `Static` **createToken**<`T`\>(`type`): [`InjectToken`](../modules.md#injecttoken)<`T` extends (...`args`: `any`[]) => `U` ? `U` : `T`\>

Create a typed inject token for anything.

This helper binds type information to a symbol so you can use that
symbol to inject a typed value.
Because the TypeInjector has no information how to create this symbol,
it has to be provided before it gets injected the first time.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `type` | `string` \| `T` & (...`args`: `any`[]) => `any` & { `name`: `string`  } | can be an abstract class or a simple string |

#### Returns

[`InjectToken`](../modules.md#injecttoken)<`T` extends (...`args`: `any`[]) => `U` ? `U` : `T`\>

a token that can be used to first provide then inject anything

#### Defined in

[type-injector.ts:128](https://github.com/e-hein/type-inject/blob/4e7c44a/src/type-injector.ts#L128)
