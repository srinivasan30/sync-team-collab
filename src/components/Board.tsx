import { useCallback, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import type { Task, TaskStatus } from '../types';
import { COLUMNS } from '../lib/constants';
import type { TaskFormData } from '../lib/utils';

interface BoardProps {
  tasksByStatus: Record<TaskStatus, Task[]>;
  allTasks: Task[];
  onAdd: (data: TaskFormData) => Promise<void>;
  onUpdate: (id: string, changes: Partial<Task>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onMove: (taskId: string, newStatus: TaskStatus) => Promise<void>;
}

export function Board({ tasksByStatus, allTasks, onAdd, onUpdate, onDelete, onMove }: BoardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo');
  const [activeTask, setActiveTask] = useState<Task | null>(null);


  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleAddTask = useCallback((status: TaskStatus) => {
    setEditingTask(null);
    setDefaultStatus(status);
    setModalOpen(true);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  }, []);

  const handleSave = useCallback(async (data: TaskFormData) => {
    if (editingTask) {
      await onUpdate(editingTask.id, data);
    } else {
      await onAdd(data);
    }
  }, [editingTask, onAdd, onUpdate]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = allTasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }, [allTasks]);


  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Determine target column
    const targetColumn = COLUMNS.find((c) => c.id === overId);
    if (targetColumn) {
      await onMove(taskId, targetColumn.id);
      return;
    }

    // Dropped over a task — find its column
    const targetTask = allTasks.find((t) => t.id === overId);
    if (targetTask) {
      await onMove(taskId, targetTask.status);
    }
  }, [allTasks, onMove]);


  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          id="main-content"
          className="flex gap-5 overflow-x-auto pb-6 px-6"
          style={{ scrollbarWidth: 'thin' }}
          role="region"
          aria-label="Kanban board"
        >
          {COLUMNS.map((column) => (
            <Column
              key={column.id}
              column={column}
              tasks={tasksByStatus[column.id] ?? []}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              onDeleteTask={onDelete}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
          {activeTask ? (
            <div className="rotate-2 opacity-90">
              <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {modalOpen && (
        <TaskModal
          task={editingTask}
          defaultStatus={defaultStatus}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditingTask(null); }}
        />
      )}
    </>
  );
}
