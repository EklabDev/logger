import { LogEntry, LogOptions } from '../types';
import { LogLevel } from './LogLevel';
import { IChannel } from './Channel';

export class Logger {
  private channels: IChannel[] = [];
  private defaultMetadata: Record<string, any> = {};

  constructor(
    private readonly name: string,
    private readonly options: LogOptions = {}
  ) {
    if (options.metadata) {
      this.defaultMetadata = { ...options.metadata };
    }
  }

  public addChannel(channel: IChannel): this {
    this.channels.push(channel);
    return this;
  }

  public removeChannel(channelName: string): this {
    this.channels = this.channels.filter(channel => channel.name !== channelName);
    return this;
  }

  public setMetadata(metadata: Record<string, any>): this {
    this.defaultMetadata = { ...metadata };
    return this;
  }

  public log<T>(level: LogLevel, message: string, data?: T, metadata?: Record<string, any>): void {
    const entry: LogEntry<T> = {
      timestamp: new Date(),
      level,
      message,
      data,
      metadata: {
        ...this.defaultMetadata,
        ...metadata,
      },
    };

    this.channels.forEach(channel => {
      try {
        channel.write(entry);
      } catch (error) {
        console.error(`Error writing to channel ${channel.name}:`, error);
      }
    });
  }

  public debug<T>(message: string, data?: T, metadata?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, data, metadata);
  }

  public info<T>(message: string, data?: T, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, data, metadata);
  }

  public warn<T>(message: string, data?: T, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, data, metadata);
  }

  public error<T>(message: string, data?: T, metadata?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, data, metadata);
  }

  public fatal<T>(message: string, data?: T, metadata?: Record<string, any>): void {
    this.log(LogLevel.FATAL, message, data, metadata);
  }
}
