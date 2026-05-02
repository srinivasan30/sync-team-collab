import { useMemo } from 'react';
import { TrendingUp, AlertOctagon, Target, Clock, BarChart3, ChevronRight } from 'lucide-react';
import type { Task, TaskStatus, Priority } from '../types';
import { computeMetrics } from '../lib/metrics';
import { COLUMNS, PRIORITY_CONFIG } from '../lib/constants';

interface VisibilityPanelProps {
  tasks: Task[];
}

export function VisibilityPanel({ tasks }: VisibilityPanelProps) {
  const metrics = useMemo(() => computeMetrics(tasks), [tasks]);

  const maxStatusCount = Math.max(1, ...Object.values(metrics.byStatus));
  const maxPriorityCount = Math.max(1, ...Object.values(metrics.byPriority));

  const statusColors: Record<TaskStatus, string> = {
    todo: 'bg-slate-400',
    inprogress: 'bg-blue-500',
    review: 'bg-amber-500',
    done: 'bg-emerald-500',
  };

  const priorityOrder: Priority[] = ['urgent', 'high', 'medium', 'low'];

  return (
    <div
      className="w-72 flex-shrink-0 bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm overflow-hidden"
      aria-label="Board visibility metrics"
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-surface-100 dark:border-surface-700 bg-gradient-to-r from-brand-50 to-violet-50 dark:from-brand-950/30 dark:to-violet-950/30">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-brand-500 rounded-xl shadow-sm shadow-brand-500/30">
            <BarChart3 size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-surface-800 dark:text-white">Visibility</h3>
            <p className="text-xs text-surface-500 dark:text-surface-400">{metrics.totalTasks} tasks tracked</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Completion rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Target size={13} className="text-emerald-500" />
              <span className="text-xs font-semibold text-surface-600 dark:text-surface-300">Completion Rate</span>
            </div>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {metrics.completionRate}%
            </span>
          </div>
          <div className="h-2 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden" role="progressbar" aria-valuenow={metrics.completionRate} aria-valuemin={0} aria-valuemax={100} aria-label="Completion rate">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700"
              style={{ width: `${metrics.completionRate}%` }}
            />
          </div>
        </div>

        {/* Bottleneck alert */}
        {metrics.bottleneckColumn && metrics.byStatus[metrics.bottleneckColumn] > 2 && (
          <div className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <AlertOctagon size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400">Bottleneck Detected</p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                {COLUMNS.find((c) => c.id === metrics.bottleneckColumn)?.label} has{' '}
                {metrics.byStatus[metrics.bottleneckColumn]} tasks stacked
              </p>
            </div>
          </div>
        )}

        {/* Tasks by column */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingUp size={13} className="text-brand-500" />
            <span className="text-xs font-semibold text-surface-600 dark:text-surface-300 uppercase tracking-wide">By Column</span>
          </div>
          <div className="space-y-2.5">
            {COLUMNS.map((col) => {
              const count = metrics.byStatus[col.id];
              const pct = Math.round((count / maxStatusCount) * 100);
              return (
                <div key={col.id} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${statusColors[col.id]}`} />
                      <span className="text-xs text-surface-600 dark:text-surface-400 font-medium">{col.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-surface-700 dark:text-surface-200">{count}</span>
                      <ChevronRight size={11} className="text-surface-300 dark:text-surface-600" />
                    </div>
                  </div>
                  <div className="h-1.5 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${statusColors[col.id]} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tasks by priority */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <AlertOctagon size={13} className="text-brand-500" />
            <span className="text-xs font-semibold text-surface-600 dark:text-surface-300 uppercase tracking-wide">By Priority</span>
          </div>
          <div className="space-y-2">
            {priorityOrder.map((p) => {
              const count = metrics.byPriority[p];
              const pct = Math.round((count / maxPriorityCount) * 100);
              const pc = PRIORITY_CONFIG[p];
              return (
                <div key={p} className="flex items-center gap-2.5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pc.color} w-16 text-center flex-shrink-0`}>
                    {pc.label}
                  </span>
                  <div className="flex-1 h-1.5 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${pc.dot} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-surface-600 dark:text-surface-300 w-4 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Avg cycle time */}
        {metrics.avgCycleTime !== null && (
          <div className="flex items-center gap-2.5 p-3 bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 rounded-xl">
            <Clock size={15} className="text-brand-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-brand-700 dark:text-brand-300">Avg Cycle Time</p>
              <p className="text-xs text-brand-600 dark:text-brand-400 mt-0.5">
                {metrics.avgCycleTime < 1
                  ? 'Less than 1 hour'
                  : `${metrics.avgCycleTime}h per task`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
