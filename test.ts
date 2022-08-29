import { expect } from 'chai';
import { TypeInjector } from './src'

describe('type inject', () => {
  it('should be able to instanciate an injector', () => {
    const injector = new TypeInjector();
    expect(injector).to.exist;
  });
});
