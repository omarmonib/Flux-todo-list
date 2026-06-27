'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { SubtaskList } from './subtask-list';


type Subtask = {
  id: string;
  title: string;
  completed: boolean;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: Date | null;
  tags: string[];
  subtasks: Subtask[];
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

export function TaskDetailModal({
  task,
  open,
  onClose,
  onUpdated,
  onDeleted,
}: {
  task: Task;
  open: boolean;
  onClose: () => void;
  onUpdated: (task: Task) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [priority, setPriority] = useState(task.priority);
  const [status, setStatus] = useState(task.status);
  const [dueDate, setDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  );

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';

  async function handleSave() {
    if (!title.trim()) return;
    setLoading(true);

    const res = await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description: description || undefined,
        priority,
        status,
        dueDate: dueDate || undefined,
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

  async function handleDelete() {
    if (!confirm('Delete this task?')) return;
    setLoading(true);
    const res = await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Task deleted');
      onDeleted(task.id);
      onClose();
    } else {
      toast.error('Failed to delete task');
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            {editing ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-semibold"
                autoFocus
              />
            ) : (
              <span
                className={task.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''}
              >
                {task.title}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Badges */}
          {!editing && (
            <div className="flex gap-2 flex-wrap">
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
              {isOverdue && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                  ⚠ Overdue
                </span>
              )}
            </div>
          )}

          {/* Description */}
          <div className="space-y-1">
            <Label>Description</Label>
            {editing ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            ) : (
              <p className="text-sm text-muted-foreground min-h-8">
                {task.description || 'No description'}
              </p>
            )}
          </div>

          {/* Priority + Status */}
          {editing && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Priority</Label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Task['priority'])}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Task['status'])}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>
          )}

          {/* Due Date */}
          <div className="space-y-1">
            <Label>Due Date</Label>
            {editing ? (
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            ) : (
              <p
                className={`text-sm ${isOverdue ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}
              >
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
              </p>
            )}
          </div>

          {/* Subtasks */}
          <div className="space-y-1 border-t border-border pt-3">
            <SubtaskList taskId={task.id} initialSubtasks={task.subtasks} />
          </div>

          {/* Created at */}
          <p className="text-xs text-muted-foreground">
            Created {new Date(task.createdAt).toLocaleDateString()}
          </p>

          {/* Actions */}
          <div className="flex justify-between pt-2">
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
              Delete Task
            </Button>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={() => setEditing(true)}>
                  Edit Task
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
