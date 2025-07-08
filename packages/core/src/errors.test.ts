import { describe, expect, it } from 'vitest';
import { AppError, ErrorCode, errors, handleError, isAppError } from './errors';

describe('AppError', () => {
  it('should create an error with all properties', () => {
    const error = new AppError({
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Test error',
      statusCode: 400,
      context: { field: 'email' },
      cause: new Error('Original error'),
    });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.name).toBe('AppError');
    expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.context).toEqual({ field: 'email' });
    expect(error.cause).toBeInstanceOf(Error);
    expect(error.timestamp).toBeInstanceOf(Date);
  });

  it('should default to 500 status code', () => {
    const error = new AppError({
      code: ErrorCode.INTERNAL_ERROR,
      message: 'Test error',
    });

    expect(error.statusCode).toBe(500);
  });

  it('should serialize to JSON correctly', () => {
    const error = new AppError({
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Test error',
      statusCode: 400,
      context: { field: 'email' },
    });

    const json = error.toJSON();
    expect(json).toMatchObject({
      name: 'AppError',
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Test error',
      statusCode: 400,
      context: { field: 'email' },
    });
    expect(json.timestamp).toBeDefined();
    expect(json.stack).toBeDefined();
  });
});

describe('Error factory functions', () => {
  describe('internal', () => {
    it('should create internal error', () => {
      const error = errors.internal('Internal server error');

      expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(error.message).toBe('Internal server error');
      expect(error.statusCode).toBe(500);
    });

    it('should include cause if provided', () => {
      const cause = new Error('Original error');
      const error = errors.internal('Internal server error', cause);

      expect(error.cause).toBe(cause);
    });
  });

  describe('validation', () => {
    it('should create validation error', () => {
      const error = errors.validation('Invalid email format');

      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.message).toBe('Invalid email format');
      expect(error.statusCode).toBe(400);
    });

    it('should include context if provided', () => {
      const error = errors.validation('Invalid email format', { field: 'email' });

      expect(error.context).toEqual({ field: 'email' });
    });
  });

  describe('notFound', () => {
    it('should create not found error without id', () => {
      const error = errors.notFound('User');

      expect(error.code).toBe(ErrorCode.NOT_FOUND);
      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
      expect(error.context).toEqual({ resource: 'User', id: undefined });
    });

    it('should create not found error with id', () => {
      const error = errors.notFound('User', '123');

      expect(error.message).toBe('User not found: 123');
      expect(error.context).toEqual({ resource: 'User', id: '123' });
    });
  });

  describe('unauthorized', () => {
    it('should create unauthorized error with default message', () => {
      const error = errors.unauthorized();

      expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
      expect(error.message).toBe('Unauthorized');
      expect(error.statusCode).toBe(401);
    });

    it('should create unauthorized error with custom message', () => {
      const error = errors.unauthorized('Invalid token');

      expect(error.message).toBe('Invalid token');
    });
  });

  describe('forbidden', () => {
    it('should create forbidden error with default message', () => {
      const error = errors.forbidden();

      expect(error.code).toBe(ErrorCode.FORBIDDEN);
      expect(error.message).toBe('Forbidden');
      expect(error.statusCode).toBe(403);
    });

    it('should create forbidden error with custom message', () => {
      const error = errors.forbidden('Access denied');

      expect(error.message).toBe('Access denied');
    });
  });

  describe('database errors', () => {
    it('should create database connection error', () => {
      const error = errors.database.connection('Failed to connect');

      expect(error.code).toBe(ErrorCode.DATABASE_CONNECTION_ERROR);
      expect(error.message).toBe('Failed to connect');
      expect(error.statusCode).toBe(503);
    });

    it('should create database query error', () => {
      const error = errors.database.query('Query failed', 'SELECT * FROM users');

      expect(error.code).toBe(ErrorCode.DATABASE_QUERY_ERROR);
      expect(error.message).toBe('Query failed');
      expect(error.statusCode).toBe(500);
      expect(error.context).toEqual({ query: 'SELECT * FROM users' });
    });

    it('should create database transaction error', () => {
      const error = errors.database.transaction('Transaction failed');

      expect(error.code).toBe(ErrorCode.DATABASE_TRANSACTION_ERROR);
      expect(error.message).toBe('Transaction failed');
      expect(error.statusCode).toBe(500);
    });
  });

  describe('API errors', () => {
    it('should create rate limit error', () => {
      const error = errors.api.rateLimit();

      expect(error.code).toBe(ErrorCode.API_RATE_LIMIT);
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.statusCode).toBe(429);
    });

    it('should create timeout error', () => {
      const error = errors.api.timeout();

      expect(error.code).toBe(ErrorCode.API_TIMEOUT);
      expect(error.message).toBe('Request timeout');
      expect(error.statusCode).toBe(408);
    });

    it('should create bad request error', () => {
      const error = errors.api.badRequest('Invalid request body', { body: {} });

      expect(error.code).toBe(ErrorCode.API_BAD_REQUEST);
      expect(error.message).toBe('Invalid request body');
      expect(error.statusCode).toBe(400);
      expect(error.context).toEqual({ body: {} });
    });
  });
});

describe('isAppError', () => {
  it('should return true for AppError instances', () => {
    const error = new AppError({
      code: ErrorCode.INTERNAL_ERROR,
      message: 'Test',
    });

    expect(isAppError(error)).toBe(true);
  });

  it('should return false for regular Error instances', () => {
    const error = new Error('Test');
    expect(isAppError(error)).toBe(false);
  });

  it('should return false for non-error values', () => {
    expect(isAppError('error')).toBe(false);
    expect(isAppError(123)).toBe(false);
    expect(isAppError(null)).toBe(false);
    expect(isAppError(undefined)).toBe(false);
  });
});

describe('handleError', () => {
  it('should return AppError as-is', () => {
    const appError = new AppError({
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Test',
    });

    const result = handleError(appError);
    expect(result).toBe(appError);
  });

  it('should convert Error to AppError', () => {
    const error = new Error('Test error');
    const result = handleError(error);

    expect(result).toBeInstanceOf(AppError);
    expect(result.code).toBe(ErrorCode.INTERNAL_ERROR);
    expect(result.message).toBe('Test error');
    expect(result.cause).toBe(error);
  });

  it('should handle unknown error types', () => {
    const result = handleError('string error');

    expect(result).toBeInstanceOf(AppError);
    expect(result.code).toBe(ErrorCode.INTERNAL_ERROR);
    expect(result.message).toBe('An unknown error occurred');
    expect(result.cause).toBe('string error');
  });
});
