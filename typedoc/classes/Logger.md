[type-inject - v1.0.0-alpha](../README.md) / Logger

# Class: Logger

Simple Logger implementation.

Will only log errors to console. Provide an alternative implementation
to log more details / log in a different was.

**`See`**

./logger.spec.ts for more details

## Table of contents

### Constructors

- [constructor](Logger.md#constructor)

### Properties

- [info](Logger.md#info)
- [warn](Logger.md#warn)

### Methods

- [error](Logger.md#error)

## Constructors

### constructor

• **new Logger**()

## Properties

### info

• `Optional` **info**: (`message`: `string`, ...`details`: `any`[]) => `void`

#### Type declaration

▸ (`message`, ...`details`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `...details` | `any`[] |

##### Returns

`void`

#### Defined in

[logger.ts:10](https://github.com/e-hein/type-inject/blob/dbcc852/src/logger.ts#L10)

___

### warn

• `Optional` **warn**: (`message`: `string`, ...`details`: `any`[]) => `void`

#### Type declaration

▸ (`message`, ...`details`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `...details` | `any`[] |

##### Returns

`void`

#### Defined in

[logger.ts:11](https://github.com/e-hein/type-inject/blob/dbcc852/src/logger.ts#L11)

## Methods

### error

▸ **error**(`message`, ...`details`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `...details` | `any`[] |

#### Returns

`void`

#### Defined in

[logger.ts:12](https://github.com/e-hein/type-inject/blob/dbcc852/src/logger.ts#L12)
