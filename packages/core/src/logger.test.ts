import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LogLevel, Logger, logger } from './logger';

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Log levels', () => {
    it('should log messages at INFO level by default', () => {
      const log = new Logger();

      log.debug('debug message');
      expect(console.debug).not.toHaveBeenCalled();

      log.info('info message');
      expect(console.info).toHaveBeenCalled();

      log.warn('warn message');
      expect(console.warn).toHaveBeenCalled();

      log.error('error message');
      expect(console.error).toHaveBeenCalled();
    });

    it('should respect custom log level', () => {
      const log = new Logger({ level: LogLevel.WARN });

      log.debug('debug message');
      expect(console.debug).not.toHaveBeenCalled();

      log.info('info message');
      expect(console.info).not.toHaveBeenCalled();

      log.warn('warn message');
      expect(console.warn).toHaveBeenCalled();
    });

    it('should log all levels when set to DEBUG', () => {
      const log = new Logger({ level: LogLevel.DEBUG });

      log.debug('debug message');
      expect(console.debug).toHaveBeenCalled();
    });
  });

  describe('Message formatting', () => {
    it('should include timestamp by default', () => {
      const log = new Logger();
      log.info('test message');

      const call = vi.mocked(console.info).mock.calls[0][0];
      expect(call).toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
    });

    it('should disable timestamp when configured', () => {
      const log = new Logger({ timestamp: false });
      log.info('test message');

      const call = vi.mocked(console.info).mock.calls[0][0];
      expect(call).not.toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
    });

    it('should include custom prefix', () => {
      const log = new Logger({ prefix: '[CustomApp]' });
      log.info('test message');

      const call = vi.mocked(console.info).mock.calls[0][0];
      expect(call).toContain('[CustomApp]');
    });

    it('should format message with level indicator', () => {
      const log = new Logger({ timestamp: false });
      log.info('test message');

      const call = vi.mocked(console.info).mock.calls[0][0];
      expect(call).toBe('[AICD] [INFO] test message');
    });
  });

  describe('Error logging', () => {
    it('should log error objects separately', () => {
      const log = new Logger();
      const error = new Error('Test error');

      log.error('An error occurred', error);

      expect(console.error).toHaveBeenCalledTimes(2);
      expect(vi.mocked(console.error).mock.calls[1][0]).toBe(error);
    });

    it('should handle fatal errors', () => {
      const log = new Logger();
      const error = new Error('Fatal error');

      log.fatal('A fatal error occurred', error);

      expect(console.error).toHaveBeenCalledTimes(2);
      const call = vi.mocked(console.error).mock.calls[0][0];
      expect(call).toContain('[FATAL]');
    });
  });

  describe('Child loggers', () => {
    it('should create child logger with combined prefix', () => {
      const parent = new Logger({ prefix: '[Parent]' });
      const child = parent.createChild('[Child]');

      child.info('test message');

      const call = vi.mocked(console.info).mock.calls[0][0];
      expect(call).toContain('[Parent] [Child]');
    });

    it('should inherit parent configuration', () => {
      const parent = new Logger({ level: LogLevel.WARN, timestamp: false });
      const child = parent.createChild('[Child]');

      child.info('should not log');
      expect(console.info).not.toHaveBeenCalled();

      child.warn('should log');
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('Default logger instance', () => {
    it('should export a default logger instance', () => {
      expect(logger).toBeInstanceOf(Logger);

      logger.info('test message');
      expect(console.info).toHaveBeenCalled();
    });
  });

  describe('Additional arguments', () => {
    it('should pass additional arguments to console methods', () => {
      const log = new Logger();
      const data = { foo: 'bar' };

      log.info('message with data', data);

      expect(console.info).toHaveBeenCalledWith(expect.stringContaining('message with data'), data);
    });
  });
});
