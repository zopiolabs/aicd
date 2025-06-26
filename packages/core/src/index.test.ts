import { describe, expect, it } from 'vitest';
import { formatDate, validateInput } from './index';

describe('formatDate', () => {
  it('should format a valid date string', () => {
    const result = formatDate('2024-01-01');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('should format a Date object', () => {
    const date = new Date('2024-01-01');
    const result = formatDate(date);
    expect(result).toBe(date.toISOString());
  });

  it('should throw an error for invalid date', () => {
    expect(() => formatDate('invalid-date')).toThrow('Invalid date provided');
  });
});

describe('validateInput', () => {
  it('should return true for valid input', () => {
    expect(validateInput('test')).toBe(true);
    expect(validateInput('  test  ')).toBe(true);
  });

  it('should return false for empty or invalid input', () => {
    expect(validateInput('')).toBe(false);
    expect(validateInput('   ')).toBe(false);
    expect(validateInput(null as any)).toBe(false);
    expect(validateInput(undefined as any)).toBe(false);
  });
});
