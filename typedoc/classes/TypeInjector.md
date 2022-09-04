[type-inject - v1.0.0-alpha](../README.md) / TypeInjector

# Class: TypeInjector

Entrypoint to create TypeInjectors.

**`See`**

 - [TypeInjector.build()](TypeInjector.md#build) - fastest way to create a TypeInjector that can create simple or statically configured classes.
 - [TypeInjector.construct()](TypeInjector.md#construct) - to manually provide values, factories or implementations before building the injector.

## Implemented by

- [`InjectorScope`](InjectorScope.md)

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

| Name | Description |
| :------ | :------ |
| `T` | type defined by the token. Will match the type of the returned value. |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `token` | [`InjectToken`](../README.md#injecttoken)<`T`\> | [InjectToken](../README.md#injecttoken) identifying the value to inject |

#### Returns

`T`

a value that implements the type defined by the token.

#### Defined in

[type-injector.ts:20](https://github.com/e-hein/type-inject/blob/3c5f497/src/type-injector.ts#L20)

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

[type-injector.ts:53](https://github.com/e-hein/type-inject/blob/3c5f497/src/type-injector.ts#L53)

___

### construct

▸ `Static` **construct**(): [`TypeInjectorBuilder`](TypeInjectorBuilder.md)

Starts the construction of a new injector.

```typescript
TypeInjector.construct()
  [...provide...]
.build();
```

**`See`**

[TypeInjector.build()](TypeInjector.md#build) - a shortcut to create an injector without configuration

#### Returns

[`TypeInjectorBuilder`](TypeInjectorBuilder.md)

TypeInjectorBuilder

#### Defined in

[type-injector.ts:43](https://github.com/e-hein/type-inject/blob/3c5f497/src/type-injector.ts#L43)
