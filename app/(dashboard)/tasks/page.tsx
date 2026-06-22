import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TaskList } from '@/components/tasks/task-list';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Tasks',
};

export default async function TasksPage() {
  const session = await auth();

  const tasks = await prisma.task.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">My Tasks</h2>
        <p className="text-muted-foreground mt-1">Manage and track your work</p>
      </div>
      <TaskList initialTasks={tasks} />
    </div>
  );
}
