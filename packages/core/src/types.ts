// Core type definitions
export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Config {
  apiUrl: string;
  environment: 'development' | 'production' | 'test';
  debug: boolean;
}

export type AsyncResult<T> = Promise<{ data: T } | { error: Error }>;
