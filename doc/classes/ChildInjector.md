[type-inject](../README.md) / [Exports](../modules.md) / ChildInjector

# Class: ChildInjector

## Hierarchy

- `TypeInjectorImpl`

  ↳ **`ChildInjector`**

## Table of contents

### Properties

- [ident](ChildInjector.md#ident)

### Methods

- [get](ChildInjector.md#get)
- [getOptFactory](ChildInjector.md#getoptfactory)
- [withIdent](ChildInjector.md#withident)

## Properties

### ident

• `Readonly` **ident**: `symbol` & { `description`: `string`  }

#### Defined in

[child-injector.ts:34](https://github.com/e-hein/type-inject/blob/4e7c44a/src/child-injector.ts#L34)

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

[type-injector.ts:160](https://github.com/e-hein/type-inject/blob/4e7c44a/src/type-injector.ts#L160)

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

[child-injector.ts:43](https://github.com/e-hein/type-inject/blob/4e7c44a/src/child-injector.ts#L43)

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

[child-injector.ts:6](https://github.com/e-hein/type-inject/blob/4e7c44a/src/child-injector.ts#L6)
