import { Request, Response, NextFunction } from 'express';

const ipRequestMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(limit: number = 30, windowSeconds: number = 60) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();

    const record = ipRequestMap.get(ip);
    if (!record || now > record.resetTime) {
      ipRequestMap.set(ip, { count: 1, resetTime: now + windowSeconds * 1000 });
      return next();
    }

    if (record.count >= limit) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());
      return res.status(429).json({
        error: `Rate limit exceeded. Maximum ${limit} requests per ${windowSeconds}s. Try again in ${retryAfter} seconds.`,
      });
    }

    record.count++;
    next();
  };
}
