'use client';

import { useState, useMemo } from 'react';
import { TaskCard } from './task-card';
import { CreateTaskForm } from './create-task-form';
import { TaskStats } from './task-stats';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: Date | null;
  createdAt: Date;
};

const statusOrder = { PENDING: 0, IN_PROGRESS: 1, COMPLETED: 2 };

export function TaskList({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'ALL' | Task['status']>('ALL');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | Task['priority']>('ALL');
  const [sortBy, setSortBy] = useState<'createdAt' | 'dueDate' | 'priority'>('createdAt');

  function handleTaskCreated(task: Task) {
    setTasks((prev) => [task, ...prev]);
    setShowForm(false);
  }

  function handleTaskUpdated(updated: Task) {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  function handleTaskDeleted(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  const priorityWeight = { LOW: 0, MEDIUM: 1, HIGH: 2 };

  const filtered = useMemo(() => {
    return tasks
      .filter((t) => filter === 'ALL' || t.status === filter)
      .filter((t) => priorityFilter === 'ALL' || t.priority === priorityFilter)
      .filter((t) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          return priorityWeight[b.priority] - priorityWeight[a.priority];
        }
        if (sortBy === 'dueDate') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [tasks, filter, priorityFilter, search, sortBy]);

  const counts = {
    ALL: tasks.length,
    PENDING: tasks.filter((t) => t.status === 'PENDING').length,
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    COMPLETED: tasks.filter((t) => t.status === 'COMPLETED').length,
  };

  return (
    <div className="space-y-4">
      {/* Live stats */}
      <TaskStats tasks={tasks} />

      {/* Search bar */}
      <Input
        placeholder="🔍 Search tasks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {/* Status filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {(['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filter === s
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {s.replace('_', ' ')} ({counts[s]})
            </button>
          ))}
        </div>
        <Button onClick={() => setShowForm((v) => !v)} size="sm">
          {showForm ? '✕ Cancel' : '+ New Task'}
        </Button>
      </div>

      {/* Priority + Sort */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Priority:</span>
          {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`text-xs px-2 py-1 rounded border transition-colors ${
                priorityFilter === p
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-muted-foreground">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-xs h-7 rounded border border-input bg-background px-2 text-foreground"
          >
            <option value="createdAt">Newest</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      </div>

      {showForm && <CreateTaskForm onTaskCreated={handleTaskCreated} />}

      {search && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''} for &quot;{search}&quot;
        </p>
      )}

      {filtered.length === 0 && !showForm && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">📋</p>
          <p>{search ? 'No tasks match your search.' : 'No tasks found. Create your first one!'}</p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-sm text-primary hover:underline mt-2"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      <div className="grid gap-3">
        {filtered.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onUpdated={handleTaskUpdated}
            onDeleted={handleTaskDeleted}
          />
        ))}
      </div>
    </div>
  );
}
