[type-inject](README.md) / Exports

# type-inject

## Table of contents

### Classes

- [ChildInjector](classes/ChildInjector.md)
- [Logger](classes/Logger.md)
- [TypeInjector](classes/TypeInjector.md)
- [TypeInjectorBuilder](classes/TypeInjectorBuilder.md)

### Interfaces

- [InjectConfig](interfaces/InjectConfig.md)
- [InjectFactory](interfaces/InjectFactory.md)

### Type Aliases

- [ConstructorWithoutArguments](modules.md#constructorwithoutarguments)
- [InjectToken](modules.md#injecttoken)
- [InjectableClass](modules.md#injectableclass)

## Type Aliases

### ConstructorWithoutArguments

Ƭ **ConstructorWithoutArguments**<`T`\>: () => `T`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

• ()

#### Defined in

[type-injector.model.ts:37](https://github.com/e-hein/type-inject/blob/4e7c44a/src/type-injector.model.ts#L37)

___

### InjectToken

Ƭ **InjectToken**<`T`\>: [`ConstructorWithoutArguments`](modules.md#constructorwithoutarguments)<`T`\> \| [`InjectableClass`](modules.md#injectableclass)<`T`\> \| `symbol` & { `description`: `string`  }

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[type-injector.model.ts:39](https://github.com/e-hein/type-inject/blob/4e7c44a/src/type-injector.model.ts#L39)

___

### InjectableClass

Ƭ **InjectableClass**<`T`\>: (...`_args`: `any`[]) => `T` & { `injectConfig`: [`InjectConfig`](interfaces/InjectConfig.md)  }

Every class can get an InjectableClass by adding a static injectConfig property.

For classes that can get instantiated without constructor arguments it
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

[type-injector.model.ts:11](https://github.com/e-hein/type-inject/blob/4e7c44a/src/type-injector.model.ts#L11)
