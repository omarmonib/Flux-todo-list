import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createTaskSchema } from '@/lib/validations/task';
import { revalidatePath } from 'next/cache';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const result = createTaskSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      ...result.data,
      dueDate: result.data.dueDate ? new Date(result.data.dueDate) : null,
      userId: session.user.id,
    },
  });

  revalidatePath('/tasks');
  return NextResponse.json(task, { status: 201 });
}
