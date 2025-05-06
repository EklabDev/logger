import { Logger } from '../core/Logger';
import { LogOptions } from '../types';

export function LogClass(logger: Logger, metadata?: Record<string, any>) {
  // @ts-expect-error function is not typed
  return function <T extends { new (...args: any[]): object }>(
    target: T,
    context: ClassDecoratorContext
  ) {
    if (context.kind === 'class') {
      return class extends target {
        constructor(...args: any[]) {
          super(...args);
        }
        _logger = logger;
        _originalClass = target;
        _metadata = metadata;
      };
    }
  };
}

export function LogSync(options: LogOptions = {}) {
  return function (originalMethod: any, context: ClassMethodDecoratorContext) {
    const methodName = context.name.toString();

    return function (this: any, ...args: any[]) {
      const logger: Logger | undefined = this._logger;
      if (!logger) {
        console.log('no logger');
        return originalMethod.call(this, ...args);
      }
      const classMetadata = this._metadata || {};

      const metadata = {
        ...classMetadata,
        ...options.metadata,
        method: `${this._originalClass.name}.${methodName}`,
        args,
      };

      if (options.logStart) {
        logger.debug(`Starting ${this._originalClass.name}.${methodName}`, { args }, metadata);
      }

      try {
        const result = originalMethod.call(this, ...args);

        if (options.logFinish) {
          logger.debug(`Finished ${this._originalClass.name}.${methodName}`, { result }, metadata);
        }

        return result;
      } catch (error) {
        if (options.logError) {
          const errorData = options.errorHandler ? options.errorHandler(error) : error;
          logger.error(`Error in ${this._originalClass.name}.${methodName}`, errorData, metadata);
        }
        throw error;
      }
    };
  };
}

export function LogAsync(options: LogOptions = {}) {
  return function (originalMethod: any, context: ClassMethodDecoratorContext) {
    const methodName = context.name.toString();

    return async function (this: any, ...args: any[]) {
      const logger: Logger | undefined = this._logger;
      if (!logger) {
        console.log('no logger');
        return await originalMethod.call(this, ...args);
      }

      const classMetadata = this._metadata || {};

      const metadata = {
        ...classMetadata,
        ...options.metadata,
        method: `${this._originalClass.name}.${methodName}`,
        args,
      };

      if (options.logStart) {
        logger.debug(`Starting ${this._originalClass.name}.${methodName}`, { args }, metadata);
      }

      try {
        const result = await originalMethod.call(this, ...args);

        if (options.logFinish) {
          logger.debug(`Finished ${this._originalClass.name}.${methodName}`, { result }, metadata);
        }

        return result;
      } catch (error) {
        if (options.logError) {
          const errorData = options.errorHandler ? options.errorHandler(error) : error;
          logger.error(`Error in ${this._originalClass.name}.${methodName}`, errorData, metadata);
        }
        throw error;
      }
    };
  };
}
