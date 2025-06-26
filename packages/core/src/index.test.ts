import { describe, expect, it } from 'vitest';
import { formatMessage, validateInput } from './index';

describe('Core', () => {
  it('should validate input correctly', () => {
    expect(validateInput('test')).toBe(true);
    expect(validateInput('')).toBe(false);
    expect(validateInput('  ')).toBe(false);
  });

  it('should format message with timestamp', () => {
    const message = 'Test message';
    const formatted = formatMessage(message);
    expect(formatted).toContain(message);
    expect(formatted).toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
  });
});
