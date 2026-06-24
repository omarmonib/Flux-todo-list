import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { NextResponse } from 'next/server';

export async function withAuth() {
  const session = await auth();
  if (!session) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      session: null,
    };
  }
  return { error: null, session };
}

export async function withRateLimit(identifier: string) {
  const { success, remaining } = await checkRateLimit(identifier);
  if (!success) {
    return {
      error: NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        {
          status: 429,
          headers: { 'X-RateLimit-Remaining': remaining.toString() },
        }
      ),
    };
  }
  return { error: null };
}
