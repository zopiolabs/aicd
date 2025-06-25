// Core utilities and shared code
export const VERSION = '0.0.1';

export function log(message: string): void {
  console.log(`[AICD Core]: ${message}`);
}

export * from './types';