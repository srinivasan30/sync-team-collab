import { describe, it, expect } from 'vitest';
import { computeMetrics } from '../lib/metrics';
import type { Task } from '../types';

const makeTask = (overrides: Partial<Task>): Task => ({
  id: Math.random().toString(36).slice(2),
  title: 'Test Task',
  description: '',
  status: 'todo',
  priority: 'medium',
  assignee: '',
  tags: [],
  createdAt: Date.now() - 10_000,
  updatedAt: Date.now(),
  ...overrides,
});

describe('computeMetrics', () => {
  it('returns zeros for empty task list', () => {
    const m = computeMetrics([]);
    expect(m.totalTasks).toBe(0);
    expect(m.completionRate).toBe(0);
    expect(m.bottleneckColumn).toBeNull();
    expect(m.avgCycleTime).toBeNull();
  });

  it('correctly counts tasks by status', () => {
    const tasks = [
      makeTask({ status: 'todo' }),
      makeTask({ status: 'todo' }),
      makeTask({ status: 'inprogress' }),
      makeTask({ status: 'done' }),
    ];
    const m = computeMetrics(tasks);
    expect(m.byStatus.todo).toBe(2);
    expect(m.byStatus.inprogress).toBe(1);
    expect(m.byStatus.done).toBe(1);
    expect(m.totalTasks).toBe(4);
  });

  it('calculates completion rate correctly', () => {
    const tasks = [
      makeTask({ status: 'done' }),
      makeTask({ status: 'done' }),
      makeTask({ status: 'todo' }),
      makeTask({ status: 'todo' }),
    ];
    const m = computeMetrics(tasks);
    expect(m.completionRate).toBe(50);
  });

  it('returns 100% completion when all tasks are done', () => {
    const tasks = [makeTask({ status: 'done' }), makeTask({ status: 'done' })];
    const m = computeMetrics(tasks);
    expect(m.completionRate).toBe(100);
  });

  it('identifies bottleneck column correctly', () => {
    const tasks = [
      makeTask({ status: 'review' }),
      makeTask({ status: 'review' }),
      makeTask({ status: 'review' }),
      makeTask({ status: 'inprogress' }),
    ];
    const m = computeMetrics(tasks);
    expect(m.bottleneckColumn).toBe('review');
  });

  it('counts tasks by priority', () => {
    const tasks = [
      makeTask({ priority: 'urgent' }),
      makeTask({ priority: 'urgent' }),
      makeTask({ priority: 'low' }),
    ];
    const m = computeMetrics(tasks);
    expect(m.byPriority.urgent).toBe(2);
    expect(m.byPriority.low).toBe(1);
    expect(m.byPriority.medium).toBe(0);
  });

  it('computes avg cycle time for done tasks', () => {
    const now = Date.now();
    const tasks = [
      makeTask({ status: 'done', createdAt: now - 3_600_000, updatedAt: now }),  // 1h
      makeTask({ status: 'done', createdAt: now - 7_200_000, updatedAt: now }),  // 2h
    ];
    const m = computeMetrics(tasks);
    // avg = 1.5h, rounded = 2 (Math.round)
    expect(m.avgCycleTime).toBe(2);
  });
});
