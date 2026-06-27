'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Subtask = {
  id: string;
  title: string;
  completed: boolean;
};

export function SubtaskList({
  taskId,
  initialSubtasks,
}: {
  taskId: string;
  initialSubtasks: Subtask[];
}) {
  const [subtasks, setSubtasks] = useState<Subtask[]>(initialSubtasks);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const completed = subtasks.filter((s) => s.completed).length;

  async function addSubtask() {
    if (!newTitle.trim()) return;
    setLoading(true);

    const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle }),
    });

    if (res.ok) {
      const subtask = await res.json();
      setSubtasks((prev) => [...prev, subtask]);
      setNewTitle('');
      toast.success('Subtask added');
    } else {
      toast.error('Failed to add subtask');
    }
    setLoading(false);
  }

  async function toggleSubtask(id: string, completed: boolean) {
    setSubtasks((prev) => prev.map((s) => (s.id === id ? { ...s, completed } : s)));

    const res = await fetch(`/api/subtasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });

    if (!res.ok) {
      setSubtasks((prev) => prev.map((s) => (s.id === id ? { ...s, completed: !completed } : s)));
      toast.error('Failed to update subtask');
    }
  }

  async function deleteSubtask(id: string) {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));

    const res = await fetch(`/api/subtasks/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      toast.error('Failed to delete subtask');
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Subtasks</span>
        {subtasks.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {completed}/{subtasks.length} completed
          </span>
        )}
      </div>

      {/* Progress bar */}
      {subtasks.length > 0 && (
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${(completed / subtasks.length) * 100}%` }}
          />
        </div>
      )}

      {/* Subtask items */}
      <div className="space-y-2">
        {subtasks.map((subtask) => (
          <div key={subtask.id} className="flex items-center gap-2 group">
            <input
              type="checkbox"
              checked={subtask.completed}
              onChange={(e) => toggleSubtask(subtask.id, e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded"
            />
            <span
              className={`text-sm flex-1 ${
                subtask.completed ? 'line-through text-muted-foreground' : 'text-foreground'
              }`}
            >
              {subtask.title}
            </span>
            <button
              onClick={() => deleteSubtask(subtask.id)}
              className="opacity-0 group-hover:opacity-100 text-xs text-muted-foreground hover:text-red-500 transition-opacity"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Add subtask */}
      <div className="flex gap-2">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
          placeholder="Add a subtask..."
          className="h-8 text-sm"
        />
        <Button
          size="sm"
          onClick={addSubtask}
          disabled={loading || !newTitle.trim()}
          className="h-8 shrink-0"
        >
          Add
        </Button>
      </div>
    </div>
  );
}
