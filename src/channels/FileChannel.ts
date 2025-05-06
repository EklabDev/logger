import { promises as fs } from 'fs';
import { ChannelOptions, LogEntry } from '../types';
import { AsyncChannel } from '../core/Channel';
import { getLogLevelName } from '../core/LogLevel';

export interface FileChannelOptions extends ChannelOptions {
  format?: (entry: LogEntry) => string;
  append?: boolean;
  encoding?: BufferEncoding;
}

export class FileChannel extends AsyncChannel {
  private fileHandle: fs.FileHandle | null = null;

  constructor(
    private readonly filePath: string,
    name: string = 'FileChannel',
    protected readonly options: FileChannelOptions = {}
  ) {
    super(name);
  }

  public async initialize(): Promise<void> {
    if (!this.fileHandle) {
      const flags = this.options.append ? 'a' : 'w';
      this.fileHandle = await fs.open(this.filePath, flags);
    }
  }

  public async close(): Promise<void> {
    if (this.fileHandle) {
      await this.fileHandle.close();
      this.fileHandle = null;
    }
  }

  protected async writeAsync(entry: LogEntry): Promise<void> {
    if (!this.fileHandle) {
      await this.initialize();
    }

    const formattedMessage = this.formatEntry(entry);
    const buffer = Buffer.from(formattedMessage + '\n', this.options.encoding || 'utf8');

    await this.fileHandle!.write(buffer);
  }

  private formatEntry(entry: LogEntry): string {
    if (this.options.format) {
      return this.options.format(entry);
    }

    const timestamp = entry.timestamp.toISOString();
    const levelName = getLogLevelName(entry.level);
    let message = `[${timestamp}] ${levelName}: ${entry.message}`;

    if (entry.data) {
      message += `\nData: ${JSON.stringify(entry.data)}`;
    }

    if (entry.metadata) {
      message += `\nMetadata: ${JSON.stringify(entry.metadata)}`;
    }

    return message;
  }
}
