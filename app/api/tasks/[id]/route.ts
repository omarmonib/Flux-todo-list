import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateTaskSchema } from '@/lib/validations/task';
import { revalidatePath } from 'next/cache';
import { withAuth, withRateLimit } from '@/lib/api-helpers';

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { error: authError, session } = await withAuth();
  if (authError) return authError;

  const { error: rateLimitError } = await withRateLimit(session!.user.id);
  if (rateLimitError) return rateLimitError;

  const { id } = await context.params;
  const body = await req.json();
  const result = updateTaskSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  const task = await prisma.task.findUnique({ where: { id } });

  if (!task || task.userId !== session!.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const updated = await prisma.task.update({
    where: { id },
    data: {
      ...result.data,
      dueDate: result.data.dueDate ? new Date(result.data.dueDate) : undefined,
    },
  });

  revalidatePath('/tasks');
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { error: authError, session } = await withAuth();
  if (authError) return authError;

  const { error: rateLimitError } = await withRateLimit(session!.user.id);
  if (rateLimitError) return rateLimitError;

  const { id } = await context.params;
  const task = await prisma.task.findUnique({ where: { id } });

  if (!task || task.userId !== session!.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.task.delete({ where: { id } });

  revalidatePath('/tasks');
  return NextResponse.json({ success: true });
}
