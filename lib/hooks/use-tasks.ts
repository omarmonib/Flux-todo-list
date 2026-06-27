import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  subtasks: Subtask[];
};

type CreateTaskInput = {
  title: string;
  description?: string | null;
  priority?: Task['priority'];
  dueDate?: Date | null;
  tags?: string[];
  subtasks?: string[];
};


type Subtask = {
  id: string;
  title: string;
  completed: boolean;
};


export function useTasks(initialTasks: Task[]) {
  const qc = useQueryClient();

  const { data: tasks = initialTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json() as Promise<Task[]>;
    },
    initialData: initialTasks,
  });

  const createTask = useMutation({
    mutationFn: async (data: CreateTaskInput) => {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create task');
      return res.json();
    },
    onSuccess: (newTask) => {
      qc.setQueryData(['tasks'], (old: Task[] = []) => [newTask, ...old]);
      toast.success('Task created!');
    },
    onError: () => toast.error('Failed to create task'),
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Task> & { id: string }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update task');
      return res.json();
    },
    onMutate: async ({ id, ...data }) => {
      await qc.cancelQueries({ queryKey: ['tasks'] });
      const previous = qc.getQueryData<Task[]>(['tasks']);
      qc.setQueryData(['tasks'], (old: Task[] = []) =>
        old.map((t) => (t.id === id ? { ...t, ...data } : t))
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(['tasks'], ctx.previous);
      toast.error('Failed to update task');
    },
    onSuccess: (updated) => {
      qc.setQueryData(['tasks'], (old: Task[] = []) =>
        old.map((t) => (t.id === updated.id ? updated : t))
      );
      toast.success('Task updated');
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete task');
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['tasks'] });
      const previous = qc.getQueryData<Task[]>(['tasks']);
      qc.setQueryData(['tasks'], (old: Task[] = []) => old.filter((t) => t.id !== id));
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(['tasks'], ctx.previous);
      toast.error('Failed to delete task');
    },
    onSuccess: () => toast.success('Task deleted'),
  });

  return { tasks, createTask, updateTask, deleteTask };
}
