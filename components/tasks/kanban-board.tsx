'use client';

import { TaskCard } from './task-card';

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: Date | null;
  createdAt: Date;
};

const columns = [
  {
    status: 'PENDING' as const,
    label: 'Pending',
    color: 'border-t-gray-400',
    bg: 'bg-gray-50 dark:bg-gray-900/30',
    count: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  },
  {
    status: 'IN_PROGRESS' as const,
    label: 'In Progress',
    color: 'border-t-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-900/10',
    count: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  },
  {
    status: 'COMPLETED' as const,
    label: 'Completed',
    color: 'border-t-green-500',
    bg: 'bg-green-50 dark:bg-green-900/10',
    count: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  },
];

export function KanbanBoard({
  tasks,
  onUpdated,
  onDeleted,
}: {
  tasks: Task[];
  onUpdated: (task: Task) => void;
  onDeleted: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.status);
        return (
          <div
            key={col.status}
            className={`rounded-lg border border-border border-t-4 ${col.color} ${col.bg} p-4 min-h-100`}
          >
            {/* Column header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">{col.label}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${col.count}`}>
                {colTasks.length}
              </span>
            </div>

            {/* Tasks */}
            <div className="space-y-3">
              {colTasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">No tasks here</div>
              )}
              {colTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdated={onUpdated}
                  onDeleted={onDeleted}
                  compact
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
