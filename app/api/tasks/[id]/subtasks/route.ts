import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/api-helpers';
import { z } from 'zod';

const subtaskSchema = z.object({
  title: z.string().min(1).max(100),
});

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { error: authError, session } = await withAuth();
  if (authError) return authError;

  const { id } = await context.params;
  const task = await prisma.task.findUnique({ where: { id } });

  if (!task || task.userId !== session!.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await req.json();
  const result = subtaskSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const subtask = await prisma.subtask.create({
    data: { title: result.data.title, taskId: id },
  });

  return NextResponse.json(subtask, { status: 201 });
}
