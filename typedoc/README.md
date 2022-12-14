type-injector-lib - v1.0.0-alpha-7

# type-injector-lib - v1.0.0-alpha-7

## Table of contents

### Classes

- [BasicTypeInjector](classes/BasicTypeInjector.md)
- [InjectorScope](classes/InjectorScope.md)
- [Logger](classes/Logger.md)
- [TypeInjector](classes/TypeInjector.md)
- [TypeInjectorBuilder](classes/TypeInjectorBuilder.md)

### Interfaces

- [InjectConfig](interfaces/InjectConfig.md)
- [InjectFactory](interfaces/InjectFactory.md)
- [InjectorConfig](interfaces/InjectorConfig.md)

### Type Aliases

- [ConstructorWithoutArguments](README.md#constructorwithoutarguments)
- [DeclaredInjectToken](README.md#declaredinjecttoken)
- [InjectToken](README.md#injecttoken)
- [InjectableClass](README.md#injectableclass)

### Functions

- [declareInjectToken](README.md#declareinjecttoken)

## Type Aliases

### ConstructorWithoutArguments

Ƭ **ConstructorWithoutArguments**<`T`\>: () => `T`

#### Type parameters

| Name | Description |
| :------ | :------ |
| `T` | defines that InstanceType of the constructor. |

#### Type declaration

• ()

Every class that has a constructor without parameters can get used as InjectToken.

#### Defined in

[inject-token.ts:6](https://github.com/e-hein/type-injector-lib/blob/447ba03/src/inject-token.ts#L6)

___

### DeclaredInjectToken

Ƭ **DeclaredInjectToken**<`T`\>: `symbol` & { `description`: `string`  }

To configure any dependency type-safe you can [declare an inject token](README.md#declareinjecttoken).

#### Type parameters

| Name | Description |
| :------ | :------ |
| `T` | type of the value to get injected with this token. |

#### Defined in

[inject-token.ts:45](https://github.com/e-hein/type-injector-lib/blob/447ba03/src/inject-token.ts#L45)

___

### InjectToken

Ƭ **InjectToken**<`T`\>: [`ConstructorWithoutArguments`](README.md#constructorwithoutarguments)<`T`\> \| [`InjectableClass`](README.md#injectableclass)<`T`\> \| [`DeclaredInjectToken`](README.md#declaredinjecttoken)<`T`\>

An InjectToken can be a [ConstructorWithoutArguments](README.md#constructorwithoutarguments), [InjectableClass](README.md#injectableclass) or a [DeclaredInjectToken](README.md#declaredinjecttoken).

**`See`**

[declareInjectToken](README.md#declareinjecttoken)

#### Type parameters

| Name | Description |
| :------ | :------ |
| `T` | defines the required type of the value to inject with that token. |

#### Defined in

[inject-token.ts:53](https://github.com/e-hein/type-injector-lib/blob/447ba03/src/inject-token.ts#L53)

___

### InjectableClass

Ƭ **InjectableClass**<`T`\>: (...`_args`: `any`[]) => `T` & { `injectConfig`: [`InjectConfig`](interfaces/InjectConfig.md)  }

Every class can get an InjectableClass by adding a static injectConfig property.

For classes that can get instantiated without constructor arguments, it
is *not* required to add an injectConfig. An injectConfig is required to
tell the TypedInjector to use a constructor with arguments to create a
class instance.

**`See`**

[InjectConfig](interfaces/InjectConfig.md)

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[inject-token.ts:34](https://github.com/e-hein/type-injector-lib/blob/447ba03/src/inject-token.ts#L34)

## Functions

### declareInjectToken

▸ **declareInjectToken**<`T`\>(`type`): [`DeclaredInjectToken`](README.md#declaredinjecttoken)<`T` extends (...`args`: `any`[]) => infer U ? `U` : `T`\>

Create a typed inject token for anything.

This helper binds type information to a symbol so you can use that
symbol to inject a typed value.
Because the TypeInjector has no information how to create this symbol,
it has to be provided before it gets injected the first time.

#### Type parameters

| Name | Description |
| :------ | :------ |
| `T` | defines the required type of the value to inject with that token. |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `type` | `string` \| `T` & (...`args`: `any`[]) => `any` & { `name`: `string`  } | can be an abstract class or a simple string |

#### Returns

[`DeclaredInjectToken`](README.md#declaredinjecttoken)<`T` extends (...`args`: `any`[]) => infer U ? `U` : `T`\>

a token that can be used to first provide then inject anything

#### Defined in

[inject-token.ts:67](https://github.com/e-hein/type-injector-lib/blob/447ba03/src/inject-token.ts#L67)
