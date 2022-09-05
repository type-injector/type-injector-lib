[type-inject - v1.0.0-alpha](../README.md) / InjectorConfig

# Interface: InjectorConfig

## Table of contents

### Properties

- [factories](InjectorConfig.md#factories)
- [instances](InjectorConfig.md#instances)

## Properties

### factories

• `Optional` **factories**: `Map`<[`InjectToken`](../README.md#injecttoken)<`any`\>, [`InjectFactory`](InjectFactory.md)<`any`\>\> \| { `[key: DeclaredInjectToken<any>]`: [`InjectFactory`](InjectFactory.md)<`any`\>;  }

#### Defined in

[basic-type-injector.ts:154](https://github.com/e-hein/type-inject/blob/cdff06c/src/basic-type-injector.ts#L154)

___

### instances

• `Optional` **instances**: `Map`<[`InjectToken`](../README.md#injecttoken)<`any`\>, `any`\> \| { `[key: DeclaredInjectToken<any>]`: `any`;  }

#### Defined in

[basic-type-injector.ts:153](https://github.com/e-hein/type-inject/blob/cdff06c/src/basic-type-injector.ts#L153)
