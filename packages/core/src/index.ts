// Core utilities and shared code
export const VERSION = '0.0.1';

export function log(message: string): void {
  console.log(`[AICD Core]: ${message}`);
}

/**
 * Test utility function for release pipeline validation
 * @param input - The input string to validate
 * @returns true if the input is valid, false otherwise
 */
export function validateInput(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }
  return input.trim().length > 0;
}

/**
 * Format a message with timestamp for logging
 * @param message - The message to format
 * @returns Formatted message with timestamp
 */
export function formatMessage(message: string): string {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] ${message}`;
}

export * from './types';
