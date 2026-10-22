import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const results: Record<string, any> = {};

  const modulesToTest: Record<string, () => Promise<any>> = {
    zod: () => import('zod'),
    jsonwebtoken: () => import('jsonwebtoken'),
    bcryptjs: () => import('bcryptjs'),
    drizzleOrm: () => import('drizzle-orm'),
    drizzleNeon: () => import('drizzle-orm/neon-http'),
    neonServerless: () => import('@neondatabase/serverless'),
    authLib: () => import('./_lib/auth'),
    dbLib: () => import('./_lib/db'),
    schemaLib: () => import('./_lib/db/schema'),
  };

  for (const [name, loader] of Object.entries(modulesToTest)) {
    try {
      await loader();
      results[name] = 'OK';
    } catch (err: any) {
      results[name] = { error: err?.message || String(err), stack: err?.stack };
    }
  }

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    results,
    env: {
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('ep-cool-db-123456')),
      hasJwtSecret: Boolean(process.env.JWT_SECRET),
    },
  });
}
