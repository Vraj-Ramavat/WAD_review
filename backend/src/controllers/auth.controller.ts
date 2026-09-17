import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { serializeCookie } from '../utils/cookieUtils.js';
import { z } from 'zod';
import { getDb, schema } from '../db/index.js';
import { eq } from 'drizzle-orm';
import { signJwtToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { inMemoryUsers } from '../services/jobStore.service.js';

const authSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function signup(req: Request, res: Response) {
  try {
    const parseResult = authSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0]?.message || 'Invalid input data' });
    }

    const { email, password } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();
    const db = getDb();

    // Check if user already exists
    if (db) {
      const existing = await db.select().from(schema.users).where(eq(schema.users.email, normalizedEmail)).limit(1);
      if (existing.length > 0) {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const [newUser] = await db
        .insert(schema.users)
        .values({ email: normalizedEmail, passwordHash })
        .returning({ id: schema.users.id, email: schema.users.email, createdAt: schema.users.createdAt });

      const token = signJwtToken({ userId: newUser.id, email: newUser.email });

      res.setHeader(
        'Set-Cookie',
        serializeCookie('codegalaxy_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
        })
      );

      return res.status(201).json({
        user: { id: newUser.id, email: newUser.email, createdAt: newUser.createdAt.toISOString() },
        token,
      });
    } else {
      // In-Memory Fallback
      if (inMemoryUsers.has(normalizedEmail)) {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userId = `user_${Date.now()}`;
      const createdAt = new Date().toISOString();
      const userObj = { id: userId, email: normalizedEmail, passwordHash, createdAt };
      inMemoryUsers.set(normalizedEmail, userObj);

      const token = signJwtToken({ userId, email: normalizedEmail });

      res.setHeader(
        'Set-Cookie',
        serializeCookie('codegalaxy_token', token, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
        })
      );

      return res.status(201).json({
        user: { id: userId, email: normalizedEmail, createdAt },
        token,
      });
    }
  } catch (error: any) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error during registration.' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const parseResult = authSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0]?.message || 'Invalid credentials' });
    }

    const { email, password } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();
    const db = getDb();

    if (db) {
      const usersList = await db.select().from(schema.users).where(eq(schema.users.email, normalizedEmail)).limit(1);
      if (usersList.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const user = usersList[0];
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const token = signJwtToken({ userId: user.id, email: user.email });

      res.setHeader(
        'Set-Cookie',
        serializeCookie('codegalaxy_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
        })
      );

      return res.status(200).json({
        user: { id: user.id, email: user.email, createdAt: user.createdAt.toISOString() },
        token,
      });
    } else {
      // In-Memory Fallback
      const user = inMemoryUsers.get(normalizedEmail);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const token = signJwtToken({ userId: user.id, email: user.email });

      res.setHeader(
        'Set-Cookie',
        serializeCookie('codegalaxy_token', token, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
        })
      );

      return res.status(200).json({
        user: { id: user.id, email: user.email, createdAt: user.createdAt },
        token,
      });
    }
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error during login.' });
  }
}

export async function logout(_req: Request, res: Response) {
  res.setHeader(
    'Set-Cookie',
    serializeCookie('codegalaxy_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })
  );
  return res.status(200).json({ message: 'Successfully logged out.' });
}

export async function me(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ user: null });
  }

  const db = getDb();
  if (db) {
    const usersList = await db.select().from(schema.users).where(eq(schema.users.id, req.user.userId)).limit(1);
    if (usersList.length === 0) {
      return res.status(401).json({ user: null });
    }
    const u = usersList[0];
    return res.status(200).json({
      user: { id: u.id, email: u.email, createdAt: u.createdAt.toISOString() },
    });
  } else {
    return res.status(200).json({
      user: { id: req.user.userId, email: req.user.email, createdAt: new Date().toISOString() },
    });
  }
}
