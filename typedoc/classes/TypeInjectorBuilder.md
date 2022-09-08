[type-injector - v1.0.0-alpha](../README.md) / TypeInjectorBuilder

# Class: TypeInjectorBuilder

Start configuration phase of a type injector.

```typescript
import { declareInjectToken, TypeInjector } from 'type-injector';

const injectToken = {
  simpleValue: declareInjectToken<string>('simple value'),
  createdValue: declareInjectToken<string>('created value'),
}

const injector = TypeInjector.construct()
  .provideValue(injectToken.simpleValue, 'Hello World!')
  .provideFactory(injectToken.createdValue, {
     deps: [injectToken.simpleValue],
     create: (greeting: string) => `${greeting} Now it's: ${new Date()}`,
  })
  .provideImplementation(Logger, RemoteLogger)
.build();
```

**`See`**

 - [provideValue](TypeInjectorBuilder.md#providevalue)
 - [provideFactory](TypeInjectorBuilder.md#providefactory)
 - [provideImplementation](TypeInjectorBuilder.md#provideimplementation)

## Table of contents

### Constructors

- [constructor](TypeInjectorBuilder.md#constructor)

### Methods

- [build](TypeInjectorBuilder.md#build)
- [provideFactory](TypeInjectorBuilder.md#providefactory)
- [provideImplementation](TypeInjectorBuilder.md#provideimplementation)
- [provideValue](TypeInjectorBuilder.md#providevalue)

## Constructors

### constructor

• **new TypeInjectorBuilder**()

## Methods

### build

▸ **build**(): [`TypeInjector`](TypeInjector.md)

Finish configuration of the TypeInjector

#### Returns

[`TypeInjector`](TypeInjector.md)

#### Defined in

[type-injector.ts:125](https://github.com/e-hein/type-inject/blob/5c37f1b/src/type-injector.ts#L125)

___

### provideFactory

▸ **provideFactory**<`T`\>(`token`, `factory`): [`TypeInjectorBuilder`](TypeInjectorBuilder.md)

Provide a function that lazily creates a value.

The provided function will be called the first time the token is requested.

#### Type parameters

| Name | Description |
| :------ | :------ |
| `T` | Type defined by the token. Has to match the return type of the factory. |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `token` | [`InjectToken`](../README.md#injecttoken)<`T`\> | which will get used to inject the value |
| `factory` | [`InjectFactory`](../interfaces/InjectFactory.md)<`T`\> | that creates something that matches the type of the token |

#### Returns

[`TypeInjectorBuilder`](TypeInjectorBuilder.md)

the Injector itself to allow chaining provides

#### Defined in

[type-injector.ts:80](https://github.com/e-hein/type-inject/blob/5c37f1b/src/type-injector.ts#L80)

___

### provideImplementation

▸ **provideImplementation**<`T`\>(`token`, `impl`): [`TypeInjectorBuilder`](TypeInjectorBuilder.md)

Provide an (alternative) implementation.

This is a shortcut to create a factory for an implementation
that is injectable itself (has no constructor args / static inject config).
Like every factory it's called lazily on the first request of the token.

#### Type parameters

| Name | Description |
| :------ | :------ |
| `T` | Type defined by the token. Has to match the type of the implementation. |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `token` | [`InjectToken`](../README.md#injecttoken)<`T`\> | which will get used to inject the value |
| `impl` | [`ConstructorWithoutArguments`](../README.md#constructorwithoutarguments)<`T`\> \| [`InjectableClass`](../README.md#injectableclass)<`T`\> | to instanciate as soon as it's requested the first time |

#### Returns

[`TypeInjectorBuilder`](TypeInjectorBuilder.md)

the Injector itself to allow chaining provides

#### Defined in

[type-injector.ts:97](https://github.com/e-hein/type-inject/blob/5c37f1b/src/type-injector.ts#L97)

___

### provideValue

▸ **provideValue**<`T`\>(`token`, `value`): [`TypeInjectorBuilder`](TypeInjectorBuilder.md)

Provide an existing value for a given token.

This can be useful to provide an existing instance of a
service class, simple values like flags or configuration objects
from the environment.

#### Type parameters

| Name | Description |
| :------ | :------ |
| `T` | Type defined by the token. Has to match the type of the value. |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `token` | [`InjectToken`](../README.md#injecttoken)<`T`\> | which will get used to inject the value |
| `value` | `T` | that will get returned for the token |

#### Returns

[`TypeInjectorBuilder`](TypeInjectorBuilder.md)

the Injector itself to allow chaining provides

#### Defined in

[type-injector.ts:65](https://github.com/e-hein/type-inject/blob/5c37f1b/src/type-injector.ts#L65)
