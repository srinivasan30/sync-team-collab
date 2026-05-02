import { describe, it, expect } from 'vitest';
import { sanitizeString, taskSchema } from '../lib/utils';

describe('sanitizeString', () => {
  it('strips HTML tags', () => {
    expect(sanitizeString('<script>alert("xss")</script>')).toBe('alert("xss")');
  });

  it('removes stray angle brackets', () => {
    expect(sanitizeString('Hello < world >')).toBe('Hello  world ');
  });

  it('trims whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
  });

  it('passes clean strings through unchanged', () => {
    expect(sanitizeString('Fix login bug')).toBe('Fix login bug');
  });
});

describe('taskSchema', () => {
  const valid = {
    title: 'Fix login bug',
    description: 'Users cannot log in',
    status: 'todo' as const,
    priority: 'high' as const,
    assignee: 'Alice',
    tags: ['backend'],
  };

  it('accepts valid task data', () => {
    expect(() => taskSchema.parse(valid)).not.toThrow();
  });

  it('rejects empty title', () => {
    expect(() => taskSchema.parse({ ...valid, title: '' })).toThrow();
  });

  it('rejects title with HTML injection', () => {
    expect(() => taskSchema.parse({ ...valid, title: '<b>hack</b>' })).toThrow();
  });

  it('rejects invalid status', () => {
    expect(() => taskSchema.parse({ ...valid, status: 'invalid' })).toThrow();
  });

  it('rejects invalid priority', () => {
    expect(() => taskSchema.parse({ ...valid, priority: 'critical' })).toThrow();
  });

  it('rejects too many tags', () => {
    expect(() =>
      taskSchema.parse({ ...valid, tags: ['a', 'b', 'c', 'd', 'e', 'f'] })
    ).toThrow();
  });
});
