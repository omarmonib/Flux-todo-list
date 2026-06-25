const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function checkRateLimit(identifier: string) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 30;

  const current = rateLimitMap.get(identifier);

  if (!current || now > current.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: maxRequests - 1 };
  }

  if (current.count >= maxRequests) {
    return { success: false, remaining: 0 };
  }

  current.count++;
  return { success: true, remaining: maxRequests - current.count };
}
