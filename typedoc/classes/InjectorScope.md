[type-inject - v1.0.0-alpha](../README.md) / InjectorScope

# Class: InjectorScope

A scope is a child injector that might provide additional values or override implementations.

## Hierarchy

- `TypeInjectorImpl`

  ↳ **`InjectorScope`**

## Implements

- [`TypeInjector`](TypeInjector.md)

## Table of contents

### Properties

- [ident](InjectorScope.md#ident)

### Methods

- [get](InjectorScope.md#get)
- [construct](InjectorScope.md#construct)

## Properties

### ident

• `Readonly` **ident**: `symbol` & { `description`: `string`  }

#### Defined in

[injector-scope.ts:61](https://github.com/e-hein/type-inject/blob/3c5f497/src/injector-scope.ts#L61)

## Methods

### get

▸ **get**<`T`\>(`token`): `T`

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

#### Implementation of

[TypeInjector](TypeInjector.md).[get](TypeInjector.md#get)

#### Inherited from

TypeInjectorImpl.get

#### Defined in

[type-injector-impl.ts:13](https://github.com/e-hein/type-inject/blob/3c5f497/src/type-injector-impl.ts#L13)

___

### construct

▸ `Static` **construct**(): `Object`

fluent construction of InejectorScopes.

```typescript
InjectorScope.construct()
  .withIdent(Symbol.for('scope name'))
  .fromParent(parentScope)
  [...provide...]
.build();
```

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `withIdent` | (`ident`: `symbol`) => { `fromParent`: (`parent`: [`TypeInjector`](TypeInjector.md)) => [`TypeInjectorBuilder`](TypeInjectorBuilder.md)  } |

#### Defined in

[injector-scope.ts:25](https://github.com/e-hein/type-inject/blob/3c5f497/src/injector-scope.ts#L25)
