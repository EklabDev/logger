# @eklabdev/logger

A modular and extensible TypeScript logging library with support for multiple channels, log levels, and method decorators.

## Features

- Multiple log levels (DEBUG, INFO, WARN, ERROR, FATAL)
- Support for both synchronous and asynchronous logging channels
- Built-in console and file channels
- TypeScript decorators for automatic method logging
- Extensible channel system for custom logging destinations
- Metadata support for contextual logging
- TypeScript 5 compatible

## Installation

```bash
npm install @eklabdev/logger
```

## Basic Usage

```typescript
import { Logger, ConsoleChannel, LogLevel } from '@eklabdev/logger';

// Create a logger with a console channel
const logger = new Logger('AppLogger')
  .addChannel(new ConsoleChannel());

// Basic logging
logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message', { source: 'system' });
logger.error('Error occurred', new Error('Something went wrong'));

// Logging with metadata
logger.info('User logged in', { userId: '123' }, { sessionId: 'abc' });
```

## Using File Channel

```typescript
import { Logger, FileChannel } from '@eklabdev/logger';

const logger = new Logger('AppLogger')
  .addChannel(new FileChannel('/path/to/logs/app.log', 'FileChannel', {
    append: true,
    encoding: 'utf8'
  }));

// Logs will be written to the file
logger.info('Application started');
```

## Using Decorators

```typescript
import { Logger, ConsoleChannel, LogClass, LogSync, LogAsync } from '@eklabdev/logger';

const logger = new Logger('UserService')
  .addChannel(new ConsoleChannel());

@LogClass(logger, { service: 'UserService' })
class UserService {
  @LogSync({
    logStart: true,
    logFinish: true,
    metadata: { operation: 'getUser' }
  })
  getUser(id: string) {
    return { id, name: 'John Doe' };
  }

  @LogAsync({
    logStart: true,
    logFinish: true,
    logError: true,
    errorHandler: (error) => ({ errorCode: (error as Error).message })
  })
  async updateUser(id: string, data: any): Promise<void> {
    // Async method implementation
    return Promise.resolve();
  }
}
```

## Creating Custom Channels

```typescript
import { AsyncChannel, LogEntry } from '@eklabdev/logger';

class DatabaseChannel extends AsyncChannel {
  constructor(private dbConnection: any) {
    super('DatabaseChannel');
  }

  protected async writeAsync(entry: LogEntry): Promise<void> {
    await this.dbConnection.logs.insert({
      timestamp: entry.timestamp,
      level: entry.level,
      message: entry.message,
      data: entry.data,
      metadata: entry.metadata
    });
  }
}

// Usage
const logger = new Logger('AppLogger')
  .addChannel(new DatabaseChannel(dbConnection));
```

## API Reference

### Logger

The main logger class that manages channels and logging operations.

```typescript
class Logger {
  constructor(name: string, options?: LogOptions);
  addChannel(channel: IChannel): this;
  removeChannel(channelName: string): this;
  setMetadata(metadata: Record<string, any>): this;
  log<T>(level: LogLevel, message: string, data?: T, metadata?: Record<string, any>): void;
  debug<T>(message: string, data?: T, metadata?: Record<string, any>): void;
  info<T>(message: string, data?: T, metadata?: Record<string, any>): void;
  warn<T>(message: string, data?: T, metadata?: Record<string, any>): void;
  error<T>(message: string, data?: T, metadata?: Record<string, any>): void;
  fatal<T>(message: string, data?: T, metadata?: Record<string, any>): void;
}
```

### Channels

#### ConsoleChannel

Synchronous channel that writes logs to the console.

```typescript
class ConsoleChannel extends SyncChannel {
  constructor(name?: string, options?: ConsoleChannelOptions);
}
```

#### FileChannel

Asynchronous channel that writes logs to a file.

```typescript
class FileChannel extends AsyncChannel {
  constructor(filePath: string, name?: string, options?: FileChannelOptions);
  initialize(): Promise<void>;
  close(): Promise<void>;
}
```

### Decorators

#### @LogClass

Class decorator that attaches a logger instance to the class.

```typescript
function LogClass(logger: Logger, metadata?: Record<string, any>);
```

#### @LogSync

Method decorator for synchronous methods.

```typescript
function LogSync(options?: LogOptions);
```

#### @LogAsync

Method decorator for asynchronous methods.

```typescript
function LogAsync(options?: LogOptions);
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT 