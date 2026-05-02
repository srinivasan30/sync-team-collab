import type { Task, BoardMetrics, TaskStatus, Priority } from '../types';
import { COLUMNS } from './constants';

/** Compute board-wide visibility metrics */
export function computeMetrics(tasks: Task[]): BoardMetrics {
  const allStatuses = COLUMNS.map((c) => c.id) as TaskStatus[];
  const allPriorities: Priority[] = ['low', 'medium', 'high', 'urgent'];

  const byStatus = Object.fromEntries(
    allStatuses.map((s) => [s, tasks.filter((t) => t.status === s).length])
  ) as Record<TaskStatus, number>;

  const byPriority = Object.fromEntries(
    allPriorities.map((p) => [p, tasks.filter((t) => t.priority === p).length])
  ) as Record<Priority, number>;

  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((byStatus.done / totalTasks) * 100) : 0;

  // Bottleneck: column with most tasks (excluding done)
  const active = allStatuses.filter((s) => s !== 'done');
  const bottleneckColumn = active.reduce(
    (max, s) => (byStatus[s] > byStatus[max] ? s : max),
    active[0]
  ) as TaskStatus | null;

  // Avg cycle time: for done tasks, time from created to updated
  const doneTasks = tasks.filter((t) => t.status === 'done' && t.updatedAt > t.createdAt);
  const avgCycleTime =
    doneTasks.length > 0
      ? Math.round(
          doneTasks.reduce((sum, t) => sum + (t.updatedAt - t.createdAt), 0) /
            doneTasks.length /
            3_600_000
        )
      : null;

  return {
    totalTasks,
    byStatus,
    byPriority,
    completionRate,
    bottleneckColumn: byStatus[bottleneckColumn!] > 0 ? bottleneckColumn : null,
    avgCycleTime,
  };
}
