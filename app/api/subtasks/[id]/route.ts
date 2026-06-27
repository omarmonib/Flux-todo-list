import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/api-helpers';

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { error: authError, session } = await withAuth();
  if (authError) return authError;

  const { id } = await context.params;
  const subtask = await prisma.subtask.findUnique({
    where: { id },
    include: { task: true },
  });

  if (!subtask || subtask.task.userId !== session!.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await req.json();
  const updated = await prisma.subtask.update({
    where: { id },
    data: { completed: body.completed },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { error: authError, session } = await withAuth();
  if (authError) return authError;

  const { id } = await context.params;
  const subtask = await prisma.subtask.findUnique({
    where: { id },
    include: { task: true },
  });

  if (!subtask || subtask.task.userId !== session!.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.subtask.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
