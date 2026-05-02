import { useEffect, useRef, useState } from 'react';
import { X, Sparkles, RefreshCw, CheckCircle, AlertTriangle, ArrowRight, Clock, Zap } from 'lucide-react';
import type { Task, StandupSummary } from '../types';
import { generateStandupSummary } from '../lib/gemini';

interface StandupModalProps {
  tasks: Task[];
  onClose: () => void;
}

const CATEGORY_CONFIG = {
  progress: {
    icon: CheckCircle,
    label: 'Progress',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  blockers: {
    icon: AlertTriangle,
    label: 'Blockers',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500',
  },
  upcoming: {
    icon: ArrowRight,
    label: 'Up Next',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
} as const;

export function StandupModal({ tasks, onClose }: StandupModalProps) {
  const [summary, setSummary] = useState<StandupSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setSummary(null);
    try {
      const result = await generateStandupSummary(tasks);
      setSummary(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate on open
  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Focus close button when summary loads
  useEffect(() => {
    if (summary) closeRef.current?.focus();
  }, [summary]);

  // Keyboard handler
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);

  const formattedTime = summary
    ? new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' }).format(summary.generatedAt)
    : '';

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="standup-title"
      aria-live="polite"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="w-full max-w-lg animate-slide-up">
        {/* Glow card */}
        <div className="relative bg-white dark:bg-surface-800 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-700 overflow-hidden">
          {/* Gradient header */}
          <div className="relative px-6 py-5 bg-gradient-to-r from-brand-600 to-violet-600 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15),_transparent)]" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h2 id="standup-title" className="text-lg font-bold text-white">
                    AI Standup Summary
                  </h2>
                  <p className="text-xs text-white/70">
                    Powered by Gemini · {tasks.length} task{tasks.length !== 1 ? 's' : ''} analysed
                  </p>
                </div>
              </div>
              <button
                ref={closeRef}
                onClick={onClose}
                className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/20 transition-all"
                aria-label="Close standup modal"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Loading state */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-10 gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border-4 border-brand-100 dark:border-brand-900" />
                  <div className="absolute inset-0 w-14 h-14 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
                  <Zap size={20} className="absolute inset-0 m-auto text-brand-500" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-surface-700 dark:text-surface-200">
                    Generating your standup…
                  </p>
                  <p className="text-xs text-surface-400 mt-1">Gemini is analysing the board</p>
                </div>
                {/* Shimmer bars */}
                <div className="w-full space-y-3 mt-2">
                  {[90, 75, 85].map((w, i) => (
                    <div
                      key={i}
                      className="h-16 rounded-xl bg-gradient-to-r from-surface-100 via-surface-200 to-surface-100 dark:from-surface-700 dark:via-surface-600 dark:to-surface-700 animate-shimmer bg-[length:200%_100%]"
                      style={{ width: `${w}%` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Error state */}
            {error && !loading && (
              <div className="py-6 text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle size={22} className="text-red-500" />
                </div>
                <p className="text-sm font-semibold text-surface-700 dark:text-surface-200 mb-1">Generation failed</p>
                <p className="text-xs text-surface-400 mb-4">{error}</p>
                <button
                  onClick={generate}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-all"
                >
                  <RefreshCw size={14} />
                  Try again
                </button>
              </div>
            )}

            {/* Summary cards */}
            {summary && !loading && (
              <>
                <div className="space-y-3" role="list" aria-label="Standup summary items">
                  {summary.items.map((item, idx) => {
                    const cfg = CATEGORY_CONFIG[item.category as keyof typeof CATEGORY_CONFIG] ?? CATEGORY_CONFIG.progress;
                    const Icon = cfg.icon;
                    return (
                      <div
                        key={idx}
                        role="listitem"
                        className={`flex gap-3 p-4 rounded-xl border ${cfg.bg} animate-slide-up`}
                        style={{ animationDelay: `${idx * 80}ms` }}
                      >
                        <div className={`mt-0.5 flex-shrink-0 ${cfg.color}`}>
                          <Icon size={17} />
                        </div>
                        <div>
                          <p className={`text-xs font-bold mb-1 uppercase tracking-wide ${cfg.color}`}>
                            {cfg.label}
                          </p>
                          <p className="text-sm text-surface-700 dark:text-surface-200 leading-relaxed">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-100 dark:border-surface-700">
                  <div className="flex items-center gap-1.5 text-xs text-surface-400">
                    <Clock size={12} />
                    <span>Generated at {formattedTime}</span>
                  </div>
                  <button
                    onClick={generate}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                    aria-label="Regenerate standup summary"
                  >
                    <RefreshCw size={12} />
                    Regenerate
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
