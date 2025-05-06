import { AsyncChannel, Logger, LogEntry } from '../src';

// Example of a custom channel that logs to a database
class DatabaseChannel extends AsyncChannel {
  private logs: LogEntry[] = [];

  constructor(name: string = 'DatabaseChannel') {
    super(name);
  }

  protected async writeAsync(entry: LogEntry): Promise<void> {
    // In a real implementation, this would write to a database
    this.logs.push(entry);
    console.log('Writing to database:', {
      timestamp: entry.timestamp,
      level: entry.level,
      message: entry.message,
      data: entry.data,
      metadata: entry.metadata
    });
  }

  // Helper method to get all logs (for demonstration purposes)
  public getLogs(): LogEntry[] {
    return this.logs;
  }
}

// Example of a custom channel that logs to memory with a size limit
class MemoryChannel extends AsyncChannel {
  private logs: LogEntry[] = [];
  private readonly maxSize: number;

  constructor(name: string = 'MemoryChannel', maxSize: number = 1000) {
    super(name);
    this.maxSize = maxSize;
  }

  protected async writeAsync(entry: LogEntry): Promise<void> {
    this.logs.push(entry);
    
    // Remove oldest entries if we exceed the size limit
    if (this.logs.length > this.maxSize) {
      this.logs = this.logs.slice(-this.maxSize);
    }
  }

  // Helper method to get all logs
  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Helper method to clear logs
  public clear(): void {
    this.logs = [];
  }
}

// Usage example
async function main() {
  // Create a logger with multiple custom channels
  const logger = new Logger('AppLogger')
    .addChannel(new DatabaseChannel())
    .addChannel(new MemoryChannel('MemoryChannel', 5));

  // Log some messages
  logger.info('Application started');
  logger.debug('Debug message', { debug: true });
  logger.warn('Warning message', { source: 'system' });
  logger.error('Error occurred', new Error('Something went wrong'));

  // Get the memory channel instance
  const memoryChannel = logger['channels'].find(
    channel => channel.name === 'MemoryChannel'
  ) as MemoryChannel;

  // Display the logs from the memory channel
  console.log('\nMemory Channel Logs:');
  console.log(JSON.stringify(memoryChannel.getLogs(), null, 2));

  // Clear the memory channel
  memoryChannel.clear();
  console.log('\nMemory Channel Logs after clear:');
  console.log(JSON.stringify(memoryChannel.getLogs(), null, 2));
}

main().catch(console.error); 