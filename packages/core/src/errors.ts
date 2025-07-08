export enum ErrorCode {
  // General errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',

  // Database errors
  DATABASE_CONNECTION_ERROR = 'DATABASE_CONNECTION_ERROR',
  DATABASE_QUERY_ERROR = 'DATABASE_QUERY_ERROR',
  DATABASE_TRANSACTION_ERROR = 'DATABASE_TRANSACTION_ERROR',

  // API errors
  API_RATE_LIMIT = 'API_RATE_LIMIT',
  API_TIMEOUT = 'API_TIMEOUT',
  API_BAD_REQUEST = 'API_BAD_REQUEST',
}

export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  statusCode?: number;
  context?: Record<string, unknown>;
  cause?: Error | unknown;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly context?: Record<string, unknown>;
  public readonly cause?: Error | unknown;
  public readonly timestamp: Date;

  constructor(details: ErrorDetails) {
    super(details.message);
    this.name = 'AppError';
    this.code = details.code;
    this.statusCode = details.statusCode || 500;
    this.context = details.context;
    this.cause = details.cause;
    this.timestamp = new Date();

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

// Error factory functions for common error types
export const errors = {
  internal: (message: string, cause?: unknown) =>
    new AppError({
      code: ErrorCode.INTERNAL_ERROR,
      message,
      statusCode: 500,
      cause,
    }),

  validation: (message: string, context?: Record<string, unknown>) =>
    new AppError({
      code: ErrorCode.VALIDATION_ERROR,
      message,
      statusCode: 400,
      context,
    }),

  notFound: (resource: string, id?: string) =>
    new AppError({
      code: ErrorCode.NOT_FOUND,
      message: `${resource} not found${id ? `: ${id}` : ''}`,
      statusCode: 404,
      context: { resource, id },
    }),

  unauthorized: (message = 'Unauthorized') =>
    new AppError({
      code: ErrorCode.UNAUTHORIZED,
      message,
      statusCode: 401,
    }),

  forbidden: (message = 'Forbidden') =>
    new AppError({
      code: ErrorCode.FORBIDDEN,
      message,
      statusCode: 403,
    }),

  database: {
    connection: (message: string, cause?: unknown) =>
      new AppError({
        code: ErrorCode.DATABASE_CONNECTION_ERROR,
        message,
        statusCode: 503,
        cause,
      }),

    query: (message: string, query?: string, cause?: unknown) =>
      new AppError({
        code: ErrorCode.DATABASE_QUERY_ERROR,
        message,
        statusCode: 500,
        context: { query },
        cause,
      }),

    transaction: (message: string, cause?: unknown) =>
      new AppError({
        code: ErrorCode.DATABASE_TRANSACTION_ERROR,
        message,
        statusCode: 500,
        cause,
      }),
  },

  api: {
    rateLimit: (message = 'Rate limit exceeded') =>
      new AppError({
        code: ErrorCode.API_RATE_LIMIT,
        message,
        statusCode: 429,
      }),

    timeout: (message = 'Request timeout') =>
      new AppError({
        code: ErrorCode.API_TIMEOUT,
        message,
        statusCode: 408,
      }),

    badRequest: (message: string, context?: Record<string, unknown>) =>
      new AppError({
        code: ErrorCode.API_BAD_REQUEST,
        message,
        statusCode: 400,
        context,
      }),
  },
};

// Type guard to check if an error is an AppError
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

// Error handler utility
export function handleError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return errors.internal(error.message, error);
  }

  return errors.internal('An unknown error occurred', error);
}
