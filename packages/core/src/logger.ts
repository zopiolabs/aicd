export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LoggerConfig {
  level?: LogLevel;
  prefix?: string;
  timestamp?: boolean;
}

export class Logger {
  private level: LogLevel;
  private prefix: string;
  private timestamp: boolean;

  constructor(config: LoggerConfig = {}) {
    this.level = config.level ?? LogLevel.INFO;
    this.prefix = config.prefix ?? '[AICD]';
    this.timestamp = config.timestamp ?? true;
  }

  private formatMessage(level: string, message: string): string {
    const parts: string[] = [];

    if (this.timestamp) {
      parts.push(`[${new Date().toISOString()}]`);
    }

    parts.push(this.prefix);
    parts.push(`[${level}]`);
    parts.push(message);

    return parts.join(' ');
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage('DEBUG', message), ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage('INFO', message), ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message), ...args);
    }
  }

  error(message: string, error?: Error | unknown): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('ERROR', message));
      if (error) {
        console.error(error);
      }
    }
  }

  fatal(message: string, error?: Error | unknown): void {
    if (this.shouldLog(LogLevel.FATAL)) {
      console.error(this.formatMessage('FATAL', message));
      if (error) {
        console.error(error);
      }
    }
  }

  createChild(prefix: string): Logger {
    return new Logger({
      level: this.level,
      prefix: `${this.prefix} ${prefix}`,
      timestamp: this.timestamp,
    });
  }
}

// Default logger instance
export const logger = new Logger();
