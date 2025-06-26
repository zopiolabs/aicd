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
 * Format a date string for consistent display across the application
 * @param date - The date to format (string or Date object)
 * @returns Formatted date string in ISO format
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }
  return dateObj.toISOString();
}

export * from './types';
