import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('ep-cool-db-123456')),
      hasJwtSecret: Boolean(process.env.JWT_SECRET),
      hasGithubToken: Boolean(process.env.GITHUB_TOKEN),
    },
  });
}
