'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { TaskDetailModal } from './task-detail-modal';

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: Date | null;
  createdAt: Date;
};

const priorityConfig = {
  LOW: { label: 'Low', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  MEDIUM: {
    label: 'Medium',
    class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  },
  HIGH: { label: 'High', class: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
};

const statusConfig = {
  PENDING: {
    label: 'Pending',
    class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    class: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  },
  COMPLETED: {
    label: 'Completed',
    class: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  },
};

export function TaskCard({
  task,
  onUpdated,
  onDeleted,
}: {
  task: Task;
  onUpdated: (task: Task) => void;
  onDeleted: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description ?? '');

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';

  async function updateStatus(status: Task['status']) {
    onUpdated({ ...task, status });
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const data = await res.json();
      onUpdated(data);
      toast.success('Task updated');
    } else {
      onUpdated(task);
      toast.error('Failed to update task');
    }
  }

  async function saveEdit() {
    if (!editTitle.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editTitle,
        description: editDescription || undefined,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      onUpdated(data);
      setEditing(false);
      toast.success('Task saved');
    } else {
      toast.error('Failed to save task');
    }
    setLoading(false);
  }

  async function deleteTask() {
    if (!confirm('Delete this task?')) return;
    setLoading(true);
    onDeleted(task.id);
    const res = await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Task deleted');
    } else {
      onUpdated(task);
      toast.error('Failed to delete task');
      setLoading(false);
    }
  }

  if (editing) {
    return (
      <Card className="border-primary">
        <CardContent className="pt-4 pb-4 space-y-3">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Task title"
            className="font-medium"
            autoFocus
          />
          <Input
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Description (optional)"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={saveEdit} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditing(false);
                setEditTitle(task.title);
                setEditDescription(task.description ?? '');
              }}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card
        className={`transition-all duration-200 hover:shadow-md cursor-pointer ${
          task.status === 'COMPLETED' ? 'opacity-60' : ''
        }`}
        onClick={() => setModalOpen(true)}
      >
        <CardContent className="flex items-start justify-between gap-4 pt-4 pb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3
                className={`font-medium text-foreground ${
                  task.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''
                }`}
              >
                {task.title}
              </h3>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityConfig[task.priority].class}`}
              >
                {priorityConfig[task.priority].label}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[task.status].class}`}
              >
                {statusConfig[task.status].label}
              </span>
            </div>

            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 truncate">{task.description}</p>
            )}

            {task.dueDate && (
              <p
                className={`text-xs mt-1 ${isOverdue ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}
              >
                {isOverdue ? '⚠ Overdue · ' : '📅 '}
                {new Date(task.dueDate).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
            <select
              value={task.status}
              onChange={(e) => updateStatus(e.target.value as Task['status'])}
              disabled={loading}
              className="text-xs h-7 rounded border border-input bg-background px-2 text-foreground cursor-pointer"
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setEditing(true);
              }}
              disabled={loading}
              className="h-7 text-xs"
            >
              ✏️
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                deleteTask();
              }}
              disabled={loading}
              className="h-7 text-xs"
            >
              ✕
            </Button>
          </div>
        </CardContent>
      </Card>

      <TaskDetailModal
        task={task}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onUpdated={onUpdated}
        onDeleted={onDeleted}
      />
    </>
  );
}
