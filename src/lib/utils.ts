import { z } from 'zod';
import {
  TASK_TITLE_MAX,
  TASK_DESC_MAX,
  ASSIGNEE_MAX,
  TAG_MAX_LENGTH,
  MAX_TAGS,
} from './constants';

/** Sanitize a string: trim and strip HTML-like angle-bracket content */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/<[^>]*>/g, '') // strip tags
    .replace(/[<>]/g, '');   // strip stray brackets
}

/** Debounce utility */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/** Format relative time */
export function relativeTime(ms: number): string {
  const diff = Date.now() - ms;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/** Generate a short unique ID */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Zod schema for task form validation */
export const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(TASK_TITLE_MAX, `Title must be ≤ ${TASK_TITLE_MAX} chars`)
    .regex(/^[^<>]*$/, 'Title cannot contain < or >'),
  description: z
    .string()
    .max(TASK_DESC_MAX, `Description must be ≤ ${TASK_DESC_MAX} chars`),
  assignee: z
    .string()
    .max(ASSIGNEE_MAX, `Assignee must be ≤ ${ASSIGNEE_MAX} chars`)
    .regex(/^[^<>]*$/, 'Invalid character in assignee'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['todo', 'inprogress', 'review', 'done']),
  tags: z
    .array(z.string().max(TAG_MAX_LENGTH))
    .max(MAX_TAGS, `Max ${MAX_TAGS} tags`),
});

export type TaskFormData = z.infer<typeof taskSchema>;
