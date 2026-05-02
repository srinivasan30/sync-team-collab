// Task status columns
export type TaskStatus = 'todo' | 'inprogress' | 'review' | 'done';

// Priority levels
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// Task model (matches Firestore document)
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assignee: string;
  tags: string[];
  createdAt: number; // unix ms
  updatedAt: number;
}

// Column definition
export interface Column {
  id: TaskStatus;
  label: string;
  color: string;
  accent: string;
}

// Standup summary item
export interface StandupItem {
  category: 'progress' | 'blockers' | 'upcoming';
  text: string;
}

export interface StandupSummary {
  items: StandupItem[];
  generatedAt: number;
  taskCount: number;
}

// Theme
export type Theme = 'light' | 'dark';

// Visibility metrics
export interface BoardMetrics {
  totalTasks: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<Priority, number>;
  completionRate: number;
  bottleneckColumn: TaskStatus | null;
  avgCycleTime: number | null;
}
