import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import type { Task, Column as ColumnType } from '../types';
import { TaskCard } from './TaskCard';

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  onAddTask: (status: ColumnType['id']) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export function Column({ column, tasks, onAddTask, onEditTask, onDeleteTask }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  const accentMap: Record<string, string> = {
    todo: 'from-slate-400 to-slate-500',
    inprogress: 'from-blue-400 to-blue-600',
    review: 'from-amber-400 to-orange-500',
    done: 'from-emerald-400 to-green-600',
  };

  const badgeMap: Record<string, string> = {
    todo: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
    inprogress: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
    review: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
    done: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
  };

  return (
    <div
      className={`flex flex-col min-h-[500px] w-72 flex-shrink-0 rounded-2xl border transition-all duration-200 ${
        isOver
          ? 'border-brand-400 shadow-lg shadow-brand-500/20 scale-[1.01]'
          : 'border-surface-200 dark:border-surface-700'
      } bg-surface-50 dark:bg-surface-900/50`}
      aria-label={`${column.label} column, ${tasks.length} tasks`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2.5">
          {/* Accent indicator */}
          <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${accentMap[column.id]}`} />
          <h2 className="text-sm font-bold text-surface-700 dark:text-surface-200 uppercase tracking-wide">
            {column.label}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeMap[column.id]}`}
            aria-label={`${tasks.length} tasks in ${column.label}`}
          >
            {tasks.length}
          </span>
          <button
            onClick={() => onAddTask(column.id)}
            className="p-1 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-all duration-150"
            aria-label={`Add task to ${column.label}`}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Gradient divider */}
      <div className={`mx-4 h-0.5 rounded-full bg-gradient-to-r ${accentMap[column.id]} opacity-40 mb-3`} />

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className="flex-1 px-3 pb-4 flex flex-col gap-2.5 overflow-y-auto"
        style={{ minHeight: 80 }}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>

        {/* Empty state */}
        {tasks.length === 0 && (
          <div
            className={`flex-1 flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed transition-colors ${
              isOver
                ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20'
                : 'border-surface-200 dark:border-surface-700'
            }`}
          >
            <div className="text-3xl mb-2 opacity-30">
              {column.id === 'todo' ? '📋' : column.id === 'inprogress' ? '🔄' : column.id === 'review' ? '👀' : '✅'}
            </div>
            <p className="text-xs text-surface-400 dark:text-surface-500 text-center">
              {isOver ? 'Drop here' : 'No tasks yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
