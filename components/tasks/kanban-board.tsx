'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableTaskCard } from './draggable-task-card';
import { TaskCard } from './task-card';
import { toast } from 'sonner';

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
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  function findTaskColumn(taskId: string): Task['status'] | null {
    const task = tasks.find((t) => t.id === taskId);
    return task?.status ?? null;
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findTaskColumn(activeId);
    const overColumn = columns.find((c) => c.status === overId)?.status ?? findTaskColumn(overId);

    if (!activeColumn || !overColumn) return;
    if (activeColumn === overColumn) return;

    const task = tasks.find((t) => t.id === activeId);
    if (!task) return;

    onUpdated({ ...task, status: overColumn });

    const res = await fetch(`/api/tasks/${activeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: overColumn }),
    });

    if (res.ok) {
      const updated = await res.json();
      onUpdated(updated);
      toast.success(`Moved to ${overColumn.replace('_', ' ')}`);
    } else {
      onUpdated(task);
      toast.error('Failed to move task');
    }
  }

  function handleDragStart(event: { active: { id: string | number } }) {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.status);
          return (
            <SortableContext
              key={col.status}
              id={col.status}
              items={colTasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div
                id={col.status}
                className={`rounded-lg border border-border border-t-4 ${col.color} ${col.bg} p-4 min-h-[400px]`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">{col.label}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${col.count}`}>
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {colTasks.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-border rounded-lg">
                      Drop tasks here
                    </div>
                  )}
                  {colTasks.map((task) => (
                    <DraggableTaskCard
                      key={task.id}
                      task={task}
                      onUpdated={onUpdated}
                      onDeleted={onDeleted}
                    />
                  ))}
                </div>
              </div>
            </SortableContext>
          );
        })}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="opacity-90 rotate-2 shadow-xl">
            <TaskCard task={activeTask} onUpdated={() => {}} onDeleted={() => {}} compact />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
