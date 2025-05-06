import { Logger, ConsoleChannel, FileChannel, LogClass, LogSync, LogAsync } from '../src';

// Create a logger with both console and file channels
const logger = new Logger('AppLogger')
  .addChannel(new ConsoleChannel('ConsoleChannel', { useColors: true }))
  .addChannel(new FileChannel('logs/app.log', 'FileChannel', { append: true }));

// Basic logging examples
logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message', { source: 'system' });
logger.error('Error occurred', new Error('Something went wrong'));

// Logging with metadata
logger.info('User logged in', { userId: '123' }, { sessionId: 'abc' });

// Example class using decorators
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
    // Simulate an async operation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simulate an error
    if (id === 'error') {
      throw new Error('User not found');
    }
    
    return Promise.resolve();
  }
}

// Usage example
async function main() {
  const userService = new UserService();
  
  // Test synchronous method
  const user = userService.getUser('123');
  console.log('User:', user);
  
  // Test asynchronous method
  try {
    await userService.updateUser('123', { name: 'Jane Doe' });
    console.log('User updated successfully');
  } catch (error) {
    console.error('Failed to update user:', error);
  }
  
  // Test error case
  try {
    await userService.updateUser('error', { name: 'Error User' });
  } catch (error) {
    console.error('Expected error:', error);
  }
}

main().catch(console.error); 