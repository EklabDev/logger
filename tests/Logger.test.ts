import { Logger, ConsoleChannel, LogLevel } from '../src';

describe('Logger', () => {
  let logger: Logger;
  let consoleChannel: ConsoleChannel;

  beforeEach(() => {
    consoleChannel = new ConsoleChannel('TestChannel');
    logger = new Logger('TestLogger').addChannel(consoleChannel);
  });

  it('should create a logger with the correct name', () => {
    expect(logger['name']).toBe('TestLogger');
  });

  it('should add a channel', () => {
    const newChannel = new ConsoleChannel('NewChannel');
    logger.addChannel(newChannel);
    expect(logger['channels']).toContain(newChannel);
  });

  it('should remove a channel', () => {
    logger.removeChannel('TestChannel');
    expect(logger['channels']).not.toContain(consoleChannel);
  });

  it('should set metadata', () => {
    const metadata = { service: 'test' };
    logger.setMetadata(metadata);
    expect(logger['defaultMetadata']).toEqual(metadata);
  });

  it('should log with different levels', () => {
    const spy = jest.spyOn(consoleChannel, 'write');
    
    logger.debug('Debug message');
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({
      level: LogLevel.DEBUG,
      message: 'Debug message'
    }));

    logger.info('Info message');
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({
      level: LogLevel.INFO,
      message: 'Info message'
    }));

    logger.warn('Warning message');
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({
      level: LogLevel.WARN,
      message: 'Warning message'
    }));

    logger.error('Error message');
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({
      level: LogLevel.ERROR,
      message: 'Error message'
    }));

    logger.fatal('Fatal message');
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({
      level: LogLevel.FATAL,
      message: 'Fatal message'
    }));
  });

  it('should log with data and metadata', () => {
    const spy = jest.spyOn(consoleChannel, 'write');
    const data = { userId: '123' };
    const metadata = { sessionId: 'abc' };

    logger.info('User logged in', data, metadata);
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({
      level: LogLevel.INFO,
      message: 'User logged in',
      data,
      metadata: expect.objectContaining(metadata)
    }));
  });

  it('should handle errors in channel write', () => {
    const errorChannel = new ConsoleChannel('ErrorChannel');
    const errorSpy = jest.spyOn(console, 'error');
    
    jest.spyOn(errorChannel, 'write').mockImplementation(() => {
      throw new Error('Channel error');
    });

    logger.addChannel(errorChannel);
    logger.info('Test message');

    expect(errorSpy).toHaveBeenCalledWith(
      'Error writing to channel ErrorChannel:',
      expect.any(Error)
    );
  });
}); 