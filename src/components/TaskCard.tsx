import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, User, Clock } from 'lucide-react';
import type { Task } from '../types';
import { PRIORITY_CONFIG } from '../lib/constants';
import { relativeTime, sanitizeString } from '../lib/utils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskCard = memo(function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const pc = PRIORITY_CONFIG[task.priority];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer select-none ${
        isDragging ? 'opacity-50 shadow-2xl scale-105 rotate-1 z-50' : ''
      }`}
      onClick={() => onEdit(task)}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${task.title}. Priority: ${task.priority}. ${task.assignee ? `Assigned to ${task.assignee}.` : ''} Press Enter to edit.`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onEdit(task);
        }
      }}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="absolute top-3 right-3 p-1 rounded opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 transition-all duration-150 cursor-grab active:cursor-grabbing"
        aria-label="Drag to reorder"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <GripVertical size={14} />
      </button>

      <div className="p-4 pr-10">
        {/* Priority badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${pc.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />
            {pc.label}
          </span>
          {task.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-full font-medium"
            >
              {sanitizeString(tag)}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-50 leading-snug mb-1 line-clamp-2">
          {sanitizeString(task.title)}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-surface-500 dark:text-surface-400 line-clamp-2 mb-3">
            {sanitizeString(task.description)}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5">
            {task.assignee && (
              <div className="flex items-center gap-1 text-xs text-surface-500 dark:text-surface-400">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                  <User size={10} className="text-white" />
                </div>
                <span className="font-medium truncate max-w-[80px]">{sanitizeString(task.assignee)}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-surface-400 dark:text-surface-500">
            <Clock size={10} />
            <span>{relativeTime(task.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Delete button */}
      <button
        className="absolute bottom-3 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 text-surface-400 transition-all duration-150"
        aria-label={`Delete task: ${task.title}`}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(task.id);
        }}
        tabIndex={0}
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
});
