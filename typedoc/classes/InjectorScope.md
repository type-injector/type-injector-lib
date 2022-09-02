[type-inject](../README.md) / [Exports](../modules.md) / InjectorScope

# Class: InjectorScope

## Hierarchy

- `TypeInjectorImpl`

  ↳ **`InjectorScope`**

## Table of contents

### Properties

- [ident](InjectorScope.md#ident)

### Methods

- [get](InjectorScope.md#get)
- [getOptFactory](InjectorScope.md#getoptfactory)
- [withIdent](InjectorScope.md#withident)

## Properties

### ident

• `Readonly` **ident**: `symbol` & { `description`: `string`  }

#### Defined in

injector-scope.ts:37

## Methods

### get

▸ **get**<`T`\>(`token`): `T`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `token` | [`InjectToken`](../modules.md#injecttoken)<`T`\> |

#### Returns

`T`

#### Inherited from

TypeInjectorImpl.get

#### Defined in

type-injector-impl.ts:10

___

### getOptFactory

▸ **getOptFactory**<`T`\>(`token`): [`InjectFactory`](../interfaces/InjectFactory.md)<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `token` | [`InjectToken`](../modules.md#injecttoken)<`T`\> |

#### Returns

[`InjectFactory`](../interfaces/InjectFactory.md)<`T`\>

#### Overrides

TypeInjectorImpl.getOptFactory

#### Defined in

injector-scope.ts:46

___

### withIdent

▸ `Static` **withIdent**(`ident`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `ident` | `symbol` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `from` | (`parent`: [`TypeInjector`](TypeInjector.md)) => [`TypeInjectorBuilder`](TypeInjectorBuilder.md) |

#### Defined in

injector-scope.ts:9
