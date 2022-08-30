import { expect } from 'chai';
import { Logger } from './logger';
import { InjectConfig, TypeInjector } from './type-injector';

describe('scopes', () => {
  class BaseService {
    readonly isBaseService = true;
  }
  it('should always return the same instance', () => {
    const injector = new TypeInjector();
    const base1 = injector.get(BaseService);
    const base2 = injector.get(BaseService);

    expect(base1 === base2).to.be.true;
  });

  class CycligService {
    parent: CycligService;
    static readonly injectConfig: InjectConfig = {
      deps: [CycligService],
    }
    constructor(parent: CycligService) {
      this.parent = parent;
    }
  }

  it('should show cyclic errors', () => {
    const injector = new TypeInjector()
      .provideValue(Logger, { error: (..._args) => { /* no not log errors */ } } as Logger)
    ;
    try {
      injector.get(CycligService);
      expect.fail('no error thrown');
    } catch (e) {
      expect(e).to.include({ message: 'dependency cycle: CycligService' })
    }
  });
});
