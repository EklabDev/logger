import { LogEntry, ChannelOptions } from '../types';

export interface IChannel {
  readonly name: string;
  write(entry: LogEntry): void | Promise<void>;
  shouldLog(entry: LogEntry): boolean;
}

export abstract class BaseChannel implements IChannel {
  constructor(
    public readonly name: string,
    protected readonly options: ChannelOptions = {}
  ) {}

  public shouldLog(entry: LogEntry): boolean {
    const { minLevel, maxLevel, filter } = this.options;

    if (minLevel !== undefined && entry.level < minLevel) {
      return false;
    }

    if (maxLevel !== undefined && entry.level > maxLevel) {
      return false;
    }

    if (filter && !filter(entry)) {
      return false;
    }

    return true;
  }

  public abstract write(entry: LogEntry): void | Promise<void>;
}

export abstract class SyncChannel extends BaseChannel {
  public write(entry: LogEntry): void {
    if (this.shouldLog(entry)) {
      this.writeSync(entry);
    }
  }

  protected abstract writeSync(entry: LogEntry): void;
}

export abstract class AsyncChannel extends BaseChannel {
  public async write(entry: LogEntry): Promise<void> {
    if (this.shouldLog(entry)) {
      await this.writeAsync(entry);
    }
  }

  protected abstract writeAsync(entry: LogEntry): Promise<void>;
}
