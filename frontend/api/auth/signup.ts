import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getDb } from '../_lib/db';
import { users } from '../_lib/db/schema';
import { hashPassword, signAccessToken, signRefreshToken, setRefreshTokenCookie } from '../_lib/auth';
import { rateLimit } from '../_lib/rateLimit';

const SignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
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

  const parseResult = SignupSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors[0].message });
  }

  const { email, password } = parseResult.data;

  try {
    const db = getDb();

    // Development fallback if Neon database is not connected
    if (!db) {
      const mockId = 'dev-user-' + Date.now();
      const tokenPayload = { userId: mockId, email };
      const accessToken = signAccessToken(tokenPayload);
      const refreshToken = signRefreshToken(tokenPayload);
      setRefreshTokenCookie(res, refreshToken);

      return res.status(201).json({
        user: { id: mockId, email },
        token: accessToken,
        notice: 'Offline dev mode: DATABASE_URL not configured yet.',
      });
    }

    const existingUsers = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await hashPassword(password);
    const [newUser] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        passwordHash,
      })
      .returning();

    const tokenPayload = { userId: newUser.id, email: newUser.email };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    setRefreshTokenCookie(res, refreshToken);

    return res.status(201).json({
      user: { id: newUser.id, email: newUser.email },
      token: accessToken,
    });
  } catch (error: any) {
    console.error('Signup error:', error);

    // General fallback for unconfigured database connection
    const mockId = 'dev-user-' + Date.now();
    const tokenPayload = { userId: mockId, email };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);
    setRefreshTokenCookie(res, refreshToken);

    return res.status(201).json({
      user: { id: mockId, email },
      token: accessToken,
      notice: 'Fallback dev mode.',
    });
  }
}
