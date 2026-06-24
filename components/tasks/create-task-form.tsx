'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTasks } from '@/lib/hooks/use-tasks';

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: Date | null;
  createdAt: Date;
};

export function CreateTaskForm({ onTaskCreated }: { onTaskCreated: (task: Task) => void }) {
  const { createTask } = useTasks([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createTask.mutate(
      {
        title: formData.get('title') as string,
        description: (formData.get('description') as string) || undefined,
        priority: formData.get('priority') as Task['priority'],
        dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate') as string) : null,
      },
      {
        onSuccess: (data) => {
          onTaskCreated(data);
          (e.target as HTMLFormElement).reset();
        },
      }
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Task</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" name="title" placeholder="Task title" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" placeholder="Optional description" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                name="priority"
                defaultValue="MEDIUM"
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" name="dueDate" type="date" />
            </div>
          </div>
          <Button type="submit" disabled={createTask.isPending} className="w-full">
            {createTask.isPending ? 'Creating...' : 'Create Task'}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
