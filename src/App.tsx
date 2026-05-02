import { useState } from 'react';
import { Header } from './components/Header';
import { Board } from './components/Board';
import { VisibilityPanel } from './components/VisibilityPanel';
import { StandupModal } from './components/StandupModal';
import { useDarkMode } from './hooks/useDarkMode';
import { useTasks } from './hooks/useTasks';

export default function App() {
  const { theme, toggleTheme } = useDarkMode();
  const {
    tasks,
    tasksByStatus,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
  } = useTasks();

  const [standupOpen, setStandupOpen] = useState(false);

  const isConnected = !loading && !error;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 transition-colors duration-300">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenStandup={() => setStandupOpen(true)}
        isConnected={isConnected}
        taskCount={tasks.length}
      />

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="mx-6 mt-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 flex items-center gap-2"
        >
          <span className="text-base">⚠️</span>
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="flex gap-5 px-6 pt-6 overflow-x-hidden" aria-busy="true" aria-label="Loading board">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-72 flex-shrink-0 h-96 rounded-2xl bg-gradient-to-b from-surface-100 to-surface-50 dark:from-surface-800 dark:to-surface-900 animate-pulse border border-surface-200 dark:border-surface-700"
            />
          ))}
        </div>
      )}

      {/* Main layout */}
      {!loading && (
        <div className="flex gap-5 px-6 pt-6 overflow-x-auto pb-6" style={{ minHeight: 'calc(100vh - 64px)' }}>
          {/* Kanban board */}
          <div className="flex-1 min-w-0">
            <Board
              tasksByStatus={tasksByStatus}
              allTasks={tasks}
              onAdd={addTask}
              onUpdate={updateTask}
              onDelete={deleteTask}
              onMove={moveTask}
            />
          </div>

          {/* Visibility sidebar */}
          <div className="flex-shrink-0 self-start sticky top-[80px]">
            <VisibilityPanel tasks={tasks} />
          </div>
        </div>
      )}

      {/* AI standup modal */}
      {standupOpen && (
        <StandupModal
          tasks={tasks}
          onClose={() => setStandupOpen(false)}
        />
      )}
    </div>
  );
}
