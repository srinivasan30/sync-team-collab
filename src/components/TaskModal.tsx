import { useEffect, useRef, useState } from 'react';
import { X, Tag, AlertCircle } from 'lucide-react';
import type { Task } from '../types';
import { taskSchema, type TaskFormData } from '../lib/utils';
import { COLUMNS, PRIORITY_CONFIG, TASK_TITLE_MAX, TASK_DESC_MAX, ASSIGNEE_MAX, MAX_TAGS } from '../lib/constants';
import { ZodError } from 'zod';

interface TaskModalProps {
  task?: Task | null;
  defaultStatus?: Task['status'];
  onSave: (data: TaskFormData) => Promise<void>;
  onClose: () => void;
}

const EMPTY_FORM: TaskFormData = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  assignee: '',
  tags: [],
};

export function TaskModal({ task, defaultStatus, onSave, onClose }: TaskModalProps) {
  const [form, setForm] = useState<TaskFormData>(() =>
    task
      ? { title: task.title, description: task.description, status: task.status, priority: task.priority, assignee: task.assignee, tags: task.tags }
      : { ...EMPTY_FORM, status: defaultStatus ?? 'todo' }
  );
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Focus trap & initial focus
  useEffect(() => {
    titleRef.current?.focus();
    // Trap focus
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleField = <K extends keyof TaskFormData>(key: K, value: TaskFormData[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  };

  const addTag = () => {
    const tag = tagInput.trim().replace(/[<>]/g, '').slice(0, 20);
    if (!tag || form.tags.includes(tag) || form.tags.length >= MAX_TAGS) return;
    handleField('tags', [...form.tags, tag]);
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    handleField('tags', form.tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validated = taskSchema.parse(form);
      setSaving(true);
      await onSave(validated);
      onClose();
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) fieldErrors[String(e.path[0])] = e.message;
        });
        setErrors(fieldErrors);
      }
      setSaving(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="w-full max-w-lg bg-white dark:bg-surface-800 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-700 animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-700 sticky top-0 bg-white dark:bg-surface-800 z-10">
          <h2 id="modal-title" className="text-lg font-bold text-surface-900 dark:text-white">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-700 transition-all"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4" noValidate>
          {/* Title */}
          <div>
            <label htmlFor="task-title" className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
              Title <span className="text-red-500" aria-hidden>*</span>
            </label>
            <input
              id="task-title"
              ref={titleRef}
              type="text"
              value={form.title}
              onChange={(e) => handleField('title', e.target.value)}
              maxLength={TASK_TITLE_MAX}
              placeholder="What needs to be done?"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white dark:bg-surface-900 text-surface-900 dark:text-white placeholder-surface-400 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                errors.title ? 'border-red-400 dark:border-red-500' : 'border-surface-200 dark:border-surface-600'
              }`}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'title-error' : undefined}
              required
            />
            {errors.title && (
              <p id="title-error" role="alert" className="flex items-center gap-1 mt-1 text-xs text-red-500">
                <AlertCircle size={11} /> {errors.title}
              </p>
            )}
            <p className="text-xs text-surface-400 mt-1 text-right">{form.title.length}/{TASK_TITLE_MAX}</p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-desc" className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
              Description
            </label>
            <textarea
              id="task-desc"
              value={form.description}
              onChange={(e) => handleField('description', e.target.value)}
              maxLength={TASK_DESC_MAX}
              rows={3}
              placeholder="Add more context..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 text-sm bg-white dark:bg-surface-900 text-surface-900 dark:text-white placeholder-surface-400 resize-none transition-all focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-xs text-surface-400 text-right">{form.description.length}/{TASK_DESC_MAX}</p>
          </div>

          {/* Status & Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="task-status" className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
                Status
              </label>
              <select
                id="task-status"
                value={form.status}
                onChange={(e) => handleField('status', e.target.value as Task['status'])}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 text-sm bg-white dark:bg-surface-900 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {COLUMNS.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="task-priority" className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
                Priority
              </label>
              <select
                id="task-priority"
                value={form.priority}
                onChange={(e) => handleField('priority', e.target.value as Task['priority'])}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 text-sm bg-white dark:bg-surface-900 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label htmlFor="task-assignee" className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
              Assignee
            </label>
            <input
              id="task-assignee"
              type="text"
              value={form.assignee}
              onChange={(e) => handleField('assignee', e.target.value)}
              maxLength={ASSIGNEE_MAX}
              placeholder="Who's responsible?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 text-sm bg-white dark:bg-surface-900 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="task-tags" className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
              Tags <span className="text-surface-400 font-normal">({form.tags.length}/{MAX_TAGS})</span>
            </label>
            <div className="flex gap-2">
              <input
                id="task-tags"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); }}}
                placeholder="Add tag, press Enter"
                maxLength={20}
                disabled={form.tags.length >= MAX_TAGS}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 text-sm bg-white dark:bg-surface-900 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={addTag}
                disabled={form.tags.length >= MAX_TAGS || !tagInput.trim()}
                className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 hover:bg-brand-100 disabled:opacity-40 transition-all"
                aria-label="Add tag"
              >
                <Tag size={16} />
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2" role="list" aria-label="Tags">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    role="listitem"
                    className="flex items-center gap-1 text-xs px-2.5 py-1 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-full font-medium"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-500 transition-colors ml-0.5"
                      aria-label={`Remove tag ${tag}`}
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 text-sm font-semibold text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 text-white text-sm font-semibold hover:from-brand-600 hover:to-brand-800 disabled:opacity-60 transition-all shadow-md hover:shadow-brand-500/30 active:scale-[0.98]"
            >
              {saving ? 'Saving…' : task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
