'use client';

import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatedTaskList } from './animated-task-card';
import { CreateTaskForm } from './create-task-form';
import { AnimatedTaskStats } from './animated-stats';
import { KanbanBoard } from './kanban-board';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasks } from '@/lib/hooks/use-tasks';
import { toast } from 'sonner';

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: Date | null;
  tags: string[];
  createdAt: Date;
};

export function TaskList({ initialTasks }: { initialTasks: Task[] }) {
  const { tasks, updateTask, deleteTask } = useTasks(initialTasks);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'ALL' | Task['status']>('ALL');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | Task['priority']>('ALL');
  const [sortBy, setSortBy] = useState<'createdAt' | 'dueDate' | 'priority'>('createdAt');
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const queryClient = useQueryClient();

  function handleTaskCreated(task: Task) {
    setShowForm(false);
  }

  function handleTaskUpdated(updated: Task) {
    updateTask.mutate(updated);
  }

  function handleTaskDeleted(id: string) {
    deleteTask.mutate(id);
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((t) => t.id)));
    }
  }

  async function bulkComplete() {
    if (selected.size === 0) return;
    setBulkLoading(true);
    const ids = Array.from(selected);

    await Promise.all(
      ids.map((id) =>
        fetch(`/api/tasks/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'COMPLETED' }),
        })
      )
    );

    ids.forEach((id) => {
      const task = tasks.find((t) => t.id === id);
      if (task) updateTask.mutate({ ...task, status: 'COMPLETED' });
    });

    setSelected(new Set());
    setBulkLoading(false);
    toast.success(`${ids.length} task${ids.length > 1 ? 's' : ''} completed`);
  }

  async function bulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} task${selected.size > 1 ? 's' : ''}?`)) return;
    setBulkLoading(true);
    const ids = Array.from(selected);

    await Promise.all(ids.map((id) => fetch(`/api/tasks/${id}`, { method: 'DELETE' })));
    queryClient.setQueryData(['tasks'], (old: Task[] = []) =>
      old.filter((t) => !ids.includes(t.id))
    );
    setSelected(new Set());
    setBulkLoading(false);
    toast.success(`${ids.length} task${ids.length > 1 ? 's' : ''} deleted`);
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
      <AnimatedTaskStats tasks={tasks} />

      {/* Search + View Toggle */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="🔍 Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-1 border border-border rounded-lg p-1 ml-auto">
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              view === 'list'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            ☰ List
          </button>
          <button
            onClick={() => setView('kanban')}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              view === 'kanban'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            ⊞ Board
          </button>
        </div>
      </div>

      {/* Filters — list view only */}
      {view === 'list' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
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

          {/* Bulk actions bar */}
          <AnimatePresence>
            {filtered.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 p-2 bg-secondary rounded-lg"
              >
                <input
                  type="checkbox"
                  checked={selected.size === filtered.length && filtered.length > 0}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 cursor-pointer"
                />
                <span className="text-xs text-muted-foreground">
                  {selected.size > 0 ? `${selected.size} selected` : 'Select all'}
                </span>

                <AnimatePresence>
                  {selected.size > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex items-center gap-2 ml-2"
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={bulkComplete}
                        disabled={bulkLoading}
                        className="h-7 text-xs"
                      >
                        ✓ Complete ({selected.size})
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={bulkDelete}
                        disabled={bulkLoading}
                        className="h-7 text-xs"
                      >
                        🗑 Delete ({selected.size})
                      </Button>
                      <button
                        onClick={() => setSelected(new Set())}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Clear
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* New Task button for Kanban */}
      {view === 'kanban' && (
        <div className="flex justify-end">
          <Button onClick={() => setShowForm((v) => !v)} size="sm">
            {showForm ? '✕ Cancel' : '+ New Task'}
          </Button>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CreateTaskForm onTaskCreated={handleTaskCreated} />
          </motion.div>
        )}
      </AnimatePresence>

      {search && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''} for &quot;{search}&quot;
        </p>
      )}

      <AnimatePresence mode="wait">
        {view === 'kanban' ? (
          <motion.div
            key="kanban"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <KanbanBoard
              tasks={search ? filtered : tasks}
              onUpdated={handleTaskUpdated}
              onDeleted={handleTaskDeleted}
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {filtered.length === 0 && !showForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 text-muted-foreground"
              >
                <p className="text-4xl mb-3">📋</p>
                <p>
                  {search
                    ? 'No tasks match your search.'
                    : 'No tasks found. Create your first one!'}
                </p>
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="text-sm text-primary hover:underline mt-2"
                  >
                    Clear search
                  </button>
                )}
              </motion.div>
            )}
            <div className="grid gap-3">
              {filtered.map((task) => (
                <div key={task.id} className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={selected.has(task.id)}
                    onChange={() => toggleSelect(task.id)}
                    className="mt-4 h-4 w-4 cursor-pointer shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <AnimatedTaskList
                      tasks={[task]}
                      onUpdated={handleTaskUpdated}
                      onDeleted={handleTaskDeleted}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
