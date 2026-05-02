import type { Column, Priority } from '../types';

export const COLUMNS: Column[] = [
  {
    id: 'todo',
    label: 'To Do',
    color: 'bg-slate-100 dark:bg-slate-800/50',
    accent: 'border-slate-300 dark:border-slate-600',
  },
  {
    id: 'inprogress',
    label: 'In Progress',
    color: 'bg-blue-50 dark:bg-blue-950/30',
    accent: 'border-blue-400 dark:border-blue-500',
  },
  {
    id: 'review',
    label: 'In Review',
    color: 'bg-amber-50 dark:bg-amber-950/30',
    accent: 'border-amber-400 dark:border-amber-500',
  },
  {
    id: 'done',
    label: 'Done',
    color: 'bg-emerald-50 dark:bg-emerald-950/30',
    accent: 'border-emerald-400 dark:border-emerald-500',
  },
];

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; dot: string }> = {
  low: {
    label: 'Low',
    color: 'text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400',
    dot: 'bg-slate-400',
  },
  medium: {
    label: 'Medium',
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  high: {
    label: 'High',
    color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/50 dark:text-orange-400',
    dot: 'bg-orange-500',
  },
  urgent: {
    label: 'Urgent',
    color: 'text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-400',
    dot: 'bg-red-500',
  },
};

export const GEMINI_RATE_LIMIT = 5; // calls per minute
export const MAX_TASKS = 100;
export const TASK_TITLE_MAX = 80;
export const TASK_DESC_MAX = 500;
export const ASSIGNEE_MAX = 40;
export const TAG_MAX_LENGTH = 20;
export const MAX_TAGS = 5;
