type-inject / [Exports](modules.md)

# Type Injector
Use typescript types to get cdi managed instances of objects.

## Basics
### Inject a simple class
A simple class is a class that has a constructor without arguments (or no constructor at all). This class can get created from the injector without further configuration:
```typescript
  import { TypeInjector } from 'type-injector';

  /**
   * BaseService without constructor arguments
   * */
  class BaseService {
    readonly isBaseService = true;
  }

  it('should be able to inject a type without further configuration', () => {
    const injector = new TypeInjector();
    const baseService = injector.get(BaseService);
    expect(baseService.isBaseService).to.equal(true);
  });
```
### Inject a class that has constructor dependencies
As type information is lost on runtime and I don't like exprimental type decorators (see [Motivation](#Motivation)), it is not possible to create a class that has constructor dependencies without any configuration:
```typescript
  /**
   * NotInjectable with constructor arguments and without config
   * */
  class NotInjectable {
    baseService: BaseService;

    constructor(
      baseService: BaseService
    ) {
      this.baseService = baseService;
    }
  }
``` 
The configuration can be placed right inside the class definition:
```typescript
  /**
   * ComposedService adds an injectConfig to the class with constructor arguments
   * so it gets injectable again
   */
  class ComposedService {
    baseService: BaseService;

    static injectConfig: InjectConfig = {
      deps: [BaseService],
    };
    constructor(
      baseService: BaseService
    ) {
      this.baseService = baseService;
    }
  }
```
The ```injectConfig``` uses the ```BaseService``` as a value, so it's preserved on runtime without decorator meta data.

### Inject Tokens
Every class that provides an empty constructor or an ```InjectConfig``` and ```Symbol```s can get used as inject token directly. If you use symbols, you lose type-safty. Therefore you can create inject tokens for everything that is not directly usable as inject token (like simple values or configuration objects or functions):
```typescript
import { TypeInjector } from 'type-injector';

const givenBooleanValue = false;
const tokenForBoolean = TypeInjector.createToken<boolean>('any unique string');

const injector = new TypeInjector()
  .provideValue(tokenForBoolean, givenBooleanValue)
;
const result = injector.get(tokenForBoolean);

expect(result).to.equal(givenBooleanValue);
```
# Further documentation:
* [Basics](./src/type-injector-0-basics.spec.ts)
* [Inject tokens](./src/type-injector-1-inject-token.spec.ts)
* [Variants of provide](./src/type-injector-2-provide-variants.spec.ts)
* [Scopes](./src/type-injector-3-scopes.spec.ts)
* [Logging](./src/logger.spec.ts)
* [API](./typedoc/classes/TypeInjector.md)

## Motivation
There are plenty of inject libraries out there. Most of them are part of a larger framework so they are only usable in a browser frontend or a server backend.
I'd like to share code between server and client side so I need an **inject library** that is idependant, not part of a large framework and **usable in any context**.  
After I analyzed many of them the best standalone inject libarary seems to be [typed-inject](https://github.com/nicojs/typed-inject) (and in their documentation they lists some other awesome injection libraries). It provides compile time dependency checks which is a very strong point esp. for large projects. But as a trade-off you have to configure all indirect dependencies, even simple injection rules - you can't have one without the other.  
In most of my use-cases I just want to use one default implementation as inject token and have the possibility to replace it with other alternative implementations. So I decided to do the trade-off the other way around: dropped compile time dependency checks and reduced configuration overhead for the simple use-case.

### My Targets
#### 1. Usable anywhere
No dependencies to browser-only or server-only libraries / frameworks.
#### 2. No experimental decorators!
For two reasons:
* The inject mechanism for a project has to be stable. It's unlikely that typescript will change the decorator mechanism in typescript anymore, but as it's still marked as exprimental, it's possible. If I use an inject library that relies on meta data and decorators it might break with future typescript releases and that might cause a rewrite of the whole project.
* I do not want to force every project and/or library to publish meta data and therefore increase the size of the compiled output.
#### 3. As little developing overhead as possible
If I use inject for a class without constructor properties just to ensure it uses a single lazy instance of an object accross the whole project I do not like to write any overhead. I don't like to do something like ```injector.bind('MySimpleService').to(MySimpleService)``` - I just want to use ```injector.get(MySimpleService)``` and the result has to be type-safe. But of course it has to be possible to do something like ```injector.bind(MySimpleService).to(AlternativeSimpleServiceImpl)```.
#### 4. Keeping deployment size as small as possible
I won't create dozens of different annotations to do slightly different things and end up with a huge package for basic inject.
