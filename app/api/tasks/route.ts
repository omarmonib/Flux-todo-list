import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createTaskSchema } from '@/lib/validations/task';
import { revalidatePath } from 'next/cache';
import { withAuth, withRateLimit } from '@/lib/api-helpers';

export async function GET() {
  const { error, session } = await withAuth();
  if (error) return error;

  const tasks = await prisma.task.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: 'desc' },
    include: { subtasks: true },
  });

  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const { error: authError, session } = await withAuth();
  if (authError) return authError;

  const { error: rateLimitError } = await withRateLimit(session!.user.id);
  if (rateLimitError) return rateLimitError;

  const body = await req.json();
  const result = createTaskSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      ...result.data,
      dueDate: result.data.dueDate ? new Date(result.data.dueDate) : null,
      userId: session!.user.id,
    },
    include: { subtasks: true },
  });

  revalidatePath('/tasks');
  return NextResponse.json(task, { status: 201 });
}
