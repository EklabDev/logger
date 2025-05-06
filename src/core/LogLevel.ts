export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
  RESET = 5,
}

export const LogLevelNames: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.FATAL]: 'FATAL',
  [LogLevel.RESET]: 'RESET',
};

export function getLogLevelName(level: LogLevel): string {
  return LogLevelNames[level] || 'UNKNOWN';
}

export function isValidLogLevel(level: number): boolean {
  return level >= LogLevel.DEBUG && level <= LogLevel.FATAL;
}
