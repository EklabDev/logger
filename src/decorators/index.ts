import { Logger } from '../core/Logger';
import { LogOptions } from '../types';

const loggerMap = new WeakMap<object, Logger>();
const metadataMap = new WeakMap<object, Record<string, any>>();
const LoggerSymbol = Symbol('logger');
const MetadataSymbol = Symbol('logMetadata');

export function LogClass(logger: Logger, metadata?: Record<string, any>) {
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
// Helper function to get logger for an instance
function getLogger(instance: object): Logger | undefined {
  return loggerMap.get(instance);
}

// Helper function to get metadata for an instance
function getMetadata(instance: object): Record<string, any> | undefined {
  return metadataMap.get(instance);
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
