import { ChannelOptions, LogEntry } from '../types';
import { SyncChannel } from '../core/Channel';
import { getLogLevelName, LogLevel } from '../core/LogLevel';

export interface ConsoleChannelOptions extends ChannelOptions {
  useColors?: boolean;
  format?: (entry: LogEntry) => string;
}

export class ConsoleChannel extends SyncChannel {
  private readonly colors: Record<string, string> = {
    DEBUG: '\x1b[36m', // Cyan
    INFO: '\x1b[32m', // Green
    WARN: '\x1b[33m', // Yellow
    ERROR: '\x1b[31m', // Red
    FATAL: '\x1b[35m', // Magenta
    RESET: '\x1b[0m', // Reset
  };

  constructor(
    name: string = 'ConsoleChannel',
    protected readonly options: ConsoleChannelOptions = {}
  ) {
    super(name);
  }

  protected writeSync(entry: LogEntry): void {
    const formattedMessage = this.formatEntry(entry);
    const levelName = getLogLevelName(entry.level);

    if (this.options.useColors) {
      console.log(`${this.colors[levelName]}${formattedMessage}${this.colors.RESET}`);
    } else {
      console.log(formattedMessage);
    }
  }

  private formatEntry(entry: LogEntry): string {
    if (this.options.format) {
      return this.options.format(entry);
    }

    const timestamp = entry.timestamp.toISOString();
    const levelName = getLogLevelName(entry.level);
    let message = `[${timestamp}] ${levelName}: ${entry.message}`;

    if (entry.data) {
      message += `\nData: ${JSON.stringify(entry.data, null, 2)}`;
    }

    if (entry.metadata) {
      message += `\nMetadata: ${JSON.stringify(entry.metadata, null, 2)}`;
    }

    return message;
  }
}
