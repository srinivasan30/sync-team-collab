import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaskCard } from '../components/TaskCard';
import type { Task } from '../types';

// Mock @dnd-kit/sortable
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } },
}));

const mockTask: Task = {
  id: 'task-1',
  title: 'Fix login bug',
  description: 'Users cannot authenticate',
  status: 'inprogress',
  priority: 'high',
  assignee: 'Alice',
  tags: ['backend', 'auth'],
  createdAt: Date.now() - 3600000,
  updatedAt: Date.now(),
};

describe('TaskCard', () => {
  const onEdit = vi.fn();
  const onDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders task title', () => {
    render(<TaskCard task={mockTask} onEdit={onEdit} onDelete={onDelete} />);
    expect(screen.getByText('Fix login bug')).toBeInTheDocument();
  });

  it('renders assignee name', () => {
    render(<TaskCard task={mockTask} onEdit={onEdit} onDelete={onDelete} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('renders priority badge', () => {
    render(<TaskCard task={mockTask} onEdit={onEdit} onDelete={onDelete} />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('renders tags', () => {
    render(<TaskCard task={mockTask} onEdit={onEdit} onDelete={onDelete} />);
    expect(screen.getByText('backend')).toBeInTheDocument();
  });

  it('has correct ARIA label', () => {
    render(<TaskCard task={mockTask} onEdit={onEdit} onDelete={onDelete} />);
    const card = screen.getByRole('button', { name: /Fix login bug/i });
    expect(card).toBeInTheDocument();
  });
});
