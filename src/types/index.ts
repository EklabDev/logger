import { LogLevel } from '../core/LogLevel';

export interface LogEntry<T = any> {
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: T;
  metadata?: Record<string, any>;
}

export interface LogOptions {
  metadata?: Record<string, any>;
  errorHandler?: (error: unknown) => any;
  logStart?: boolean;
  logFinish?: boolean;
  logError?: boolean;
}

export interface ChannelOptions {
  minLevel?: LogLevel;
  maxLevel?: LogLevel;
  filter?: (entry: LogEntry) => boolean;
}
