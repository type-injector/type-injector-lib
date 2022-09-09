[type-injector-lib - v1.0.0-alpha](../README.md) / TypeInjector

# Class: TypeInjector

Stable DI-Container that can be used everywhere.

## Hierarchy

- [`BasicTypeInjector`](BasicTypeInjector.md)

  ↳ **`TypeInjector`**

## Table of contents

### Constructors

- [constructor](TypeInjector.md#constructor)

### Methods

- [get](TypeInjector.md#get)
- [construct](TypeInjector.md#construct)

## Constructors

### constructor

• **new TypeInjector**(`__namedParameters?`)

Create a simple new top level injector.

**`See`**

[construct](TypeInjector.md#construct) - to create a preconfigured injector

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | [`InjectorConfig`](../interfaces/InjectorConfig.md) |

#### Inherited from

[BasicTypeInjector](BasicTypeInjector.md).[constructor](BasicTypeInjector.md#constructor)

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

#### Inherited from

[BasicTypeInjector](BasicTypeInjector.md).[get](BasicTypeInjector.md#get)

#### Defined in

[basic-type-injector.ts:23](https://github.com/e-hein/type-inject/blob/d186a3a/src/basic-type-injector.ts#L23)

___

### construct

▸ `Static` **construct**(): [`TypeInjectorBuilder`](TypeInjectorBuilder.md)

Starts the construction of a new injector.

```typescript
TypeInjector.construct()
  [...provide...]
.build();
```

#### Returns

[`TypeInjectorBuilder`](TypeInjectorBuilder.md)

TypeInjectorBuilder

#### Defined in

[type-injector.ts:19](https://github.com/e-hein/type-inject/blob/d186a3a/src/type-injector.ts#L19)
