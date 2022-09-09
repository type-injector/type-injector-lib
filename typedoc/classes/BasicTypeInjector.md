[type-injector-lib - v1.0.0-alpha](../README.md) / BasicTypeInjector

# Class: BasicTypeInjector

Minimalistic TypeInjector.

If you don't want to use the builder pattern or subscopes you could use the BasicTypeInjector
to further reduce runtime bundle size.

**`See`**

[construct](TypeInjector.md#construct) - using the builder pattern to configure your injector.

## Hierarchy

- **`BasicTypeInjector`**

  ↳ [`TypeInjector`](TypeInjector.md)

  ↳ [`InjectorScope`](InjectorScope.md)

## Table of contents

### Constructors

- [constructor](BasicTypeInjector.md#constructor)

### Methods

- [get](BasicTypeInjector.md#get)

## Constructors

### constructor

• **new BasicTypeInjector**(`__namedParameters?`)

Create a simple new top level injector.

**`See`**

[construct](TypeInjector.md#construct) - to create a preconfigured injector

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | [`InjectorConfig`](../interfaces/InjectorConfig.md) |

#### Defined in

[basic-type-injector.ts:35](https://github.com/e-hein/type-inject/blob/d186a3a/src/basic-type-injector.ts#L35)

## Methods

### get

▸ **get**<`T`\>(`token`): `T`

Get something from the cdi.

Might create a new instance or return an existing one.

#### Type parameters

| Name | Description |
| :------ | :------ |
| `T` | Type defined by the token. Will match the type of the returned value. |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `token` | [`InjectToken`](../README.md#injecttoken)<`T`\> | [InjectToken](../README.md#injecttoken) identifying the value to inject |

#### Returns

`T`

a value that implements the type defined by the token.

#### Defined in

[basic-type-injector.ts:23](https://github.com/e-hein/type-inject/blob/d186a3a/src/basic-type-injector.ts#L23)
