import { expect } from 'chai';
import { TypeInjector } from './type-injector';

describe('scopes', () => {
  describe('using a single scope', () => {
    it('should always return the same instance', () => {
      class BaseService {
        readonly isBaseService = true;
      }

      const injector = new TypeInjector();
      const base1 = injector.get(BaseService);
      const base2 = injector.get(BaseService);

      expect(base1 === base2).to.be.true;
    });
  });
});
