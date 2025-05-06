import { Logger, ConsoleChannel, LogClass, LogSync, LogAsync, LogLevel } from '../src';

describe('Logging Decorators', () => {
  let logger: Logger;
  let consoleChannel: ConsoleChannel;
  let syncInstance: Object;
  let asyncInstance: Object;
  beforeEach(() => {
    consoleChannel = new ConsoleChannel('TestChannel');
    logger = new Logger('TestLogger').addChannel(consoleChannel);
    // Sync test class
    @LogClass(logger)
    class SyncTestClass {
      @LogSync({
        logStart: true,
        logFinish: true,
        metadata: { operation: 'test' },
      })
      testMethod(arg: string) {
        return `Hello ${arg}`;
      }

      @LogSync({
        logError: true,
        errorHandler: error => ({ errorCode: (error as Error).message }),
      })
      errorMethod() {
        throw new Error('Test error');
      }
    }
    // Async test class
    @LogClass(logger)
    class AsyncTestClass {
      @LogAsync({
        logStart: true,
        logFinish: true,
        metadata: { operation: 'test' },
      })
      async testMethod(arg: string): Promise<string> {
        await new Promise(resolve => setTimeout(resolve, 100));
        return `Hello ${arg}`;
      }

      @LogAsync({
        logError: true,
        errorHandler: error => ({ errorCode: (error as Error).message }),
      })
      async errorMethod(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 100));
        throw new Error('Test error');
      }
    }

    syncInstance = new SyncTestClass();
    asyncInstance = new AsyncTestClass();
  });

  describe('@LogClass', () => {
    it('should attach logger to class', () => {
      @LogClass(logger)
      class TestClass {}

      const instance = new TestClass();
      expect(instance['_logger']).toBe(logger);
    });

    it('should set metadata on logger', () => {
      const metadata = { service: 'test' };

      @LogClass(logger, metadata)
      class TestClass {}

      const instance = new TestClass();
      expect(instance['_metadata']).toEqual(metadata);
    });
  });

  describe('@LogSync', () => {
    it('should log method start and finish', () => {
      const spy = jest.spyOn(consoleChannel, 'write');
      const instance = syncInstance;

      //@ts-expect-error typing error
      instance.testMethod('World');

      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          message: 'Starting SyncTestClass.testMethod',
          metadata: expect.objectContaining({ operation: 'test' }),
        })
      );
      expect(spy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          message: 'Finished SyncTestClass.testMethod',
          metadata: expect.objectContaining({ operation: 'test' }),
        })
      );
    });

    it('should log errors with custom handler', () => {
      const spy = jest.spyOn(consoleChannel, 'write');
      const instance = syncInstance;

      //@ts-expect-error typing error
      expect(() => instance.errorMethod()).toThrow('Test error');

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error in SyncTestClass.errorMethod',
          data: { errorCode: 'Test error' },
        })
      );
    });
  });

  describe('@LogAsync', () => {
    it('should log async method start and finish', async () => {
      const spy = jest.spyOn(consoleChannel, 'write');
      const instance = asyncInstance;
      console.log(instance);

      //@ts-expect-error typing error
      await instance.testMethod('World');

      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          message: 'Starting AsyncTestClass.testMethod',
          metadata: expect.objectContaining({ operation: 'test' }),
        })
      );
      expect(spy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          message: 'Finished AsyncTestClass.testMethod',
          metadata: expect.objectContaining({ operation: 'test' }),
        })
      );
    });

    it('should log async errors with custom handler', async () => {
      const spy = jest.spyOn(consoleChannel, 'write');
      const instance = asyncInstance;

      //@ts-expect-error typing error
      await expect(instance.errorMethod()).rejects.toThrow('Test error');

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error in AsyncTestClass.errorMethod',
          data: { errorCode: 'Test error' },
        })
      );
    });
  });
});
