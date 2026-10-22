import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory fallback map for dev/testing when Upstash is not configured
const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(
  req: VercelRequest,
  res: VercelResponse,
  limit: number = 20,
  windowSeconds: number = 60
): Promise<boolean> {
  try {
    const rawIp =
      (req.headers?.['x-forwarded-for'] as string) ||
      (req.headers?.['x-real-ip'] as string) ||
      req.socket?.remoteAddress ||
      'anonymous';
    const ip = rawIp.split(',')[0].trim();
    const key = `ratelimit:${ip}`;
    const now = Date.now();

    const current = inMemoryStore.get(key);
    if (!current || now > current.resetAt) {
      inMemoryStore.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
      return true;
    }

    if (current.count >= limit) {
      res.setHeader('Retry-After', Math.ceil((current.resetAt - now) / 1000));
      res.status(429).json({ error: 'Rate limit exceeded. Please try again shortly.' });
      return false;
    }

    current.count += 1;
    return true;
  } catch (err) {
    console.warn('Rate limiter error, passing request through:', err);
    return true; // Never crash the request due to rate limiting
  }
}
