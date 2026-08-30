import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getDb } from '../_lib/db';
import { users } from '../_lib/db/schema';
import { comparePassword, signAccessToken, signRefreshToken, setRefreshTokenCookie } from '../_lib/auth';
import { rateLimit } from '../_lib/rateLimit';

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const isAllowed = await rateLimit(req, res, 20, 60);
  if (!isAllowed) return;

  const parseResult = LoginSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors[0].message });
  }

  const { email, password } = parseResult.data;

  try {
    const db = getDb();

    // Dev mode fallback if DB not configured
    if (!db) {
      const mockId = 'dev-user-login';
      const tokenPayload = { userId: mockId, email };
      const accessToken = signAccessToken(tokenPayload);
      const refreshToken = signRefreshToken(tokenPayload);
      setRefreshTokenCookie(res, refreshToken);

      return res.status(200).json({
        user: { id: mockId, email },
        token: accessToken,
        notice: 'Offline dev mode: DATABASE_URL not configured.',
      });
    }

    const existingUsers = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    
    if (existingUsers.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = existingUsers[0];
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const tokenPayload = { userId: user.id, email: user.email };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      user: { id: user.id, email: user.email },
      token: accessToken,
    });
  } catch (error: any) {
    console.error('Login error:', error);

    const mockId = 'dev-user-login';
    const tokenPayload = { userId: mockId, email };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);
    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      user: { id: mockId, email },
      token: accessToken,
      notice: 'Fallback dev mode.',
    });
  }
}
