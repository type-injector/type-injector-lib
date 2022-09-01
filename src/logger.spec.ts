import { expect } from 'chai';
import { InjectConfig, Logger, TypeInjector } from './index';

/**
 * Logger and its replacement.
 *
 * This small interface is used to send log messages from the Injector.
 * The implementation can get replaced like every other injected value.
 * You might replace it to:
 * - get a more verbose logging
 * - connect it to a central logging system instead of using console
 * - to prevent all (even error) log outputs
 */
describe('logger', () => {
  describe('default implementation', () => {
    const calls = spyOnConsole();
    const givenErrorMessage = 'test error message';

    /**
     * In its default configuration, the logger will only log errors to the console (stderr)
     */
    it('should log errors to console', () => {
      const injector = TypeInjector.build();
      const logger = injector.get(Logger);

      logger.error(givenErrorMessage);

      expect(calls.console.error[0][0]).to.equal(givenErrorMessage);
    });

    it('will not log warnings nor info', () => {
      const injector = TypeInjector.build();
      const logger = injector.get(Logger);

      logger.warn?.(givenErrorMessage);
      logger.info?.(givenErrorMessage);

      expect(calls.console.warn.length).to.equal(0);
      expect(calls.console.log.length).to.equal(0);
    });
  });

  describe('custom implementation', () => {
    it('should be configurable to log info to any target', () => {
      const infoMsgs = [] as string[];
      class VerboseLogger extends Logger {
        info = (message: string, ..._details: any[]) => infoMsgs.push(message);
      }
      const injectToken = { baseUrl: TypeInjector.createToken('base url') };
      const injector = TypeInjector.create()
        .provideImplementation(Logger, VerboseLogger)
        .provideFactory(injectToken.baseUrl, { deps: [], create: () => 'https://base.url/' })
        .build()
      ;

      injector.get(injectToken.baseUrl);
      // console.log(JSON.stringify(infoMsgs));
      expect(infoMsgs[0]).to.equal('finished creation of Logger');
      expect(infoMsgs[1]).to.match(/^top level injector starts creation of \n -> TypeInjectorToken: base url/);
      expect(infoMsgs[2]).to.equal('finished creation of TypeInjectorToken: base url');
    });
  });

  /**
   * Injector tries to use a provided Logger to log error messages.
   * Unfortunately it might cause a dependency error to inject the
   * Logger to log the error... -> ∞-Loop.
   * So it won't log info messages or warnings before the logger
   * is created successfully. Errors that occur during the instantiation of the logger will get
   * logged to console (stderr)
   */
   it('should show cyclic errors during the creation of Logger (at least on console)', () => {
    class HttpService {
      static injectConfig: InjectConfig = { deps: [HttpService] };
      constructor( public self: HttpService ) {}
    }
    class BuggyLogger extends Logger {
      static injectConfig: InjectConfig = { deps: [HttpService] };
      constructor( public httpService: HttpService ) { super(); }
    }
    class BusinessService {
      static injectConfig: InjectConfig = { deps: [Logger] };
      constructor( public logger: Logger ) {}
    }

    const injector = TypeInjector.create()
      .provideImplementation(Logger, BuggyLogger)
      .build()
    ;

    const origError = console.error;
    let msg: string | false = false;
    console.error = (error) => msg = String(error);
    try {
      injector.get(BusinessService);
      expect.fail('no error thrown');
    } catch (e) {
      expect((e as { message: string }).message).to.include('dependency cycle detected');
      expect(msg).to.include('dependency cycle detected');
    } finally {
      console.error = origError;
    }
  });
});

function spyOnConsole() {
  const calls = {
    console: {
      log: [] as Parameters<(typeof console)['log']>[],
      warn: [] as Parameters<(typeof console)['warn']>[],
      error: [] as Parameters<(typeof console)['error']>[],
    }
  };
  const orig = {
    console: {
      log: console.log,
      warn: console.warn,
      error: console.error,
    }
  };
  beforeEach(() => {
    calls.console = { log: [], warn: [], error: [] };
    console.log = (...args) => calls.console.log.push(args);
    console.warn = (...args) => calls.console.warn.push(args);
    console.error = (...args) => calls.console.error.push(args);
  });
  afterEach(() => {
    Object.assign(console, orig.console);
  });
  return calls;
}
