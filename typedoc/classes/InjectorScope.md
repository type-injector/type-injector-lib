[type-injector - v1.0.0-alpha](../README.md) / InjectorScope

# Class: InjectorScope

A scope is a child injector that might provide additional values or override implementations.

## Hierarchy

- [`BasicTypeInjector`](BasicTypeInjector.md)

  ↳ **`InjectorScope`**

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

[injector-scope.ts:62](https://github.com/e-hein/type-inject/blob/5c37f1b/src/injector-scope.ts#L62)

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

[basic-type-injector.ts:23](https://github.com/e-hein/type-inject/blob/5c37f1b/src/basic-type-injector.ts#L23)

___

### construct

▸ `Static` **construct**(): `Object`

Fluent construction of InjectorScopes.

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

[injector-scope.ts:24](https://github.com/e-hein/type-inject/blob/5c37f1b/src/injector-scope.ts#L24)
