import type { VercelRequest, VercelResponse } from '@vercel/node';
import { extractAuthUser, signAccessToken } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userPayload = extractAuthUser(req);
  if (!userPayload) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Issue a fresh access token
  const token = signAccessToken({ userId: userPayload.userId, email: userPayload.email });

  return res.status(200).json({
    user: { id: userPayload.userId, email: userPayload.email },
    token,
  });
}
