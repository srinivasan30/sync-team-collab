import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Task, TaskStatus } from '../types';
import type { TaskFormData } from '../lib/utils';
import { sanitizeString } from '../lib/utils';
import { MAX_TASKS } from '../lib/constants';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time listener
  useEffect(() => {
    const q = query(
      collection(db, 'tasks'),
      orderBy('createdAt', 'desc'),
      limit(MAX_TASKS)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Task[];
        setTasks(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Firestore error:', err);
        setError('Failed to connect to database. Check your internet connection.');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  /** Add a new task */
  const addTask = useCallback(async (data: TaskFormData) => {
    const now = Date.now();
    await addDoc(collection(db, 'tasks'), {
      title: sanitizeString(data.title),
      description: sanitizeString(data.description),
      status: data.status,
      priority: data.priority,
      assignee: sanitizeString(data.assignee),
      tags: data.tags.map(sanitizeString),
      createdAt: now,
      updatedAt: now,
      _serverTime: serverTimestamp(),
    });
  }, []);

  /** Update a task (optimistic) */
  const updateTask = useCallback(async (id: string, changes: Partial<Task>) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...changes, updatedAt: Date.now() } : t))
    );
    const ref = doc(db, 'tasks', id);
    await updateDoc(ref, { ...changes, updatedAt: Date.now() });
  }, []);

  /** Move task to a different column (optimistic) */
  const moveTask = useCallback(
    async (taskId: string, newStatus: TaskStatus) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task || task.status === newStatus) return;
      await updateTask(taskId, { status: newStatus });
    },
    [tasks, updateTask]
  );

  /** Delete a task */
  const deleteTask = useCallback(async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await deleteDoc(doc(db, 'tasks', id));
  }, []);

  /** Batch update (e.g. reorder) */
  const batchUpdateStatuses = useCallback(
    async (updates: { id: string; status: TaskStatus }[]) => {
      const batch = writeBatch(db);
      const now = Date.now();
      updates.forEach(({ id, status }) => {
        batch.update(doc(db, 'tasks', id), { status, updatedAt: now });
      });
      await batch.commit();
    },
    []
  );

  const tasksByStatus = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      todo: [],
      inprogress: [],
      review: [],
      done: [],
    };
    tasks.forEach((t) => {
      if (map[t.status]) map[t.status].push(t);
    });
    // Sort each column by createdAt desc
    (Object.keys(map) as TaskStatus[]).forEach((s) => {
      map[s].sort((a, b) => b.createdAt - a.createdAt);
    });
    return map;
  }, [tasks]);

  return {
    tasks,
    tasksByStatus,
    loading,
    error,
    addTask,
    updateTask,
    moveTask,
    deleteTask,
    batchUpdateStatuses,
  };
}
