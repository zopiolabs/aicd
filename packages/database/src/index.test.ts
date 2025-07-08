import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the @aicd/core module before importing Database
vi.mock('@aicd/core', () => {
  const mockLogger = {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };

  return {
    logger: {
      createChild: vi.fn(() => mockLogger),
    },
    errors: {
      validation: vi.fn((message, context) => {
        const error = new Error(message);
        (error as any).code = 'VALIDATION_ERROR';
        (error as any).context = context;
        return error;
      }),
      database: {
        connection: vi.fn((message, cause) => {
          const error = new Error(message);
          (error as any).code = 'DATABASE_CONNECTION_ERROR';
          (error as any).cause = cause;
          return error;
        }),
        query: vi.fn((message, query, cause) => {
          const error = new Error(message);
          (error as any).code = 'DATABASE_QUERY_ERROR';
          (error as any).query = query;
          (error as any).cause = cause;
          return error;
        }),
      },
    },
    // Export mockLogger so we can access it in tests
    __mockLogger: mockLogger,
  };
});

// Import Database after the mock is set up
import { Database } from './index';

describe('Database', () => {
  let mockLogger: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Get the mock logger from the mocked module
    const mockedCore = vi.mocked(await import('@aicd/core')) as any;
    mockLogger = mockedCore.__mockLogger;
  });

  describe('constructor', () => {
    it('should create a database instance with valid config', () => {
      const db = new Database({
        connectionString: 'postgresql://localhost/test',
        poolSize: 20,
      });

      expect(db).toBeDefined();
    });

    it('should throw error when connection string is missing', () => {
      expect(() => {
        new Database({
          connectionString: '',
        });
      }).toThrow('Database connection string is required');
    });

    it('should throw error when pool size is less than 1', () => {
      expect(() => {
        new Database({
          connectionString: 'postgresql://localhost/test',
          poolSize: 0,
        });
      }).toThrow('Database pool size must be at least 1');
    });

    it('should accept undefined pool size', () => {
      const db = new Database({
        connectionString: 'postgresql://localhost/test',
      });

      expect(db).toBeDefined();
    });
  });

  describe('connect', () => {
    it('should connect successfully', async () => {
      const db = new Database({
        connectionString: 'postgresql://localhost/test',
      });

      await db.connect();

      expect(mockLogger.info).toHaveBeenCalledWith('Connecting to database with pool size: 10');
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Connection string: postgresql://localhost/test'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('Database connected successfully');
    });

    it('should mask password in connection string', async () => {
      const db = new Database({
        connectionString: 'postgresql://user:password@localhost/test',
      });

      await db.connect();

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Connection string: postgresql://user:****@localhost/test'
      );
    });

    it('should use custom pool size', async () => {
      const db = new Database({
        connectionString: 'postgresql://localhost/test',
        poolSize: 30,
      });

      await db.connect();

      expect(mockLogger.info).toHaveBeenCalledWith('Connecting to database with pool size: 30');
    });

    it('should warn when already connected', async () => {
      const db = new Database({
        connectionString: 'postgresql://localhost/test',
      });

      await db.connect();
      await db.connect();

      expect(mockLogger.warn).toHaveBeenCalledWith('Database is already connected');
    });

    it('should handle connection errors', async () => {
      const db = new Database({
        connectionString: 'postgresql://localhost/test',
      });

      // Override setTimeout to throw an error
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = vi.fn().mockImplementation(() => {
        throw new Error('Connection failed');
      }) as any;

      await expect(db.connect()).rejects.toThrow('Unable to establish database connection');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to connect to database',
        expect.any(Error)
      );

      global.setTimeout = originalSetTimeout;
    });
  });

  describe('disconnect', () => {
    it('should disconnect successfully', async () => {
      const db = new Database({
        connectionString: 'postgresql://localhost/test',
      });

      await db.connect();
      await db.disconnect();

      expect(mockLogger.info).toHaveBeenCalledWith('Disconnecting from database...');
      expect(mockLogger.info).toHaveBeenCalledWith('Database disconnected successfully');
    });

    it('should warn when not connected', async () => {
      const db = new Database({
        connectionString: 'postgresql://localhost/test',
      });

      await db.disconnect();

      expect(mockLogger.warn).toHaveBeenCalledWith('Database is not connected');
    });

    it('should handle disconnection errors', async () => {
      const db = new Database({
        connectionString: 'postgresql://localhost/test',
      });

      await db.connect();

      // Override setTimeout to throw an error
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = vi.fn().mockImplementation(() => {
        throw new Error('Disconnection failed');
      }) as any;

      await expect(db.disconnect()).rejects.toThrow('Unable to disconnect from database');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to disconnect from database',
        expect.any(Error)
      );

      global.setTimeout = originalSetTimeout;
    });
  });

  describe('query', () => {
    it('should throw error when not connected', async () => {
      const db = new Database({
        connectionString: 'postgresql://localhost/test',
      });

      await expect(db.query('SELECT * FROM users')).rejects.toThrow(
        'Cannot execute query: database not connected'
      );
    });

    it('should handle query errors', async () => {
      const db = new Database({
        connectionString: 'postgresql://localhost/test',
      });

      await db.connect();

      await expect(db.query('SELECT * FROM users')).rejects.toThrow(
        'Failed to execute database query'
      );
      expect(mockLogger.error).toHaveBeenCalledWith('Query execution failed', expect.any(Error));
    });
  });

  describe('maskConnectionString', () => {
    it('should mask various password formats', async () => {
      const testCases = [
        {
          input: 'postgresql://user:password@localhost/test',
          expected: 'postgresql://user:****@localhost/test',
        },
        {
          input: 'mysql://admin:complex!P@ssw0rd@db.example.com/production',
          expected: 'mysql://admin:****@db.example.com/production',
        },
        {
          input: 'postgresql://localhost/test',
          expected: 'postgresql://localhost/test',
        },
      ];

      for (const { input, expected } of testCases) {
        vi.clearAllMocks();
        const db = new Database({ connectionString: input });
        await db.connect();

        expect(mockLogger.debug).toHaveBeenCalledWith(`Connection string: ${expected}`);
      }
    });
  });
});
