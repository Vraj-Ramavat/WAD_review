import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

function parseCookies(header: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;
  const pairs = header.split(';');
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx < 0) continue;
    const key = pair.substring(0, idx).trim();
    const val = pair.substring(idx + 1).trim();
    cookies[key] = decodeURIComponent(val);
  }
  return cookies;
}

function serializeCookie(
  name: string,
  val: string,
  options: { maxAge?: number; path?: string; httpOnly?: boolean; sameSite?: string; secure?: boolean } = {}
): string {
  let str = `${name}=${encodeURIComponent(val)}`;
  if (options.maxAge !== undefined) str += `; Max-Age=${options.maxAge}`;
  if (options.path) str += `; Path=${options.path}`;
  if (options.httpOnly) str += `; HttpOnly`;
  if (options.sameSite) str += `; SameSite=${options.sameSite}`;
  if (options.secure) str += `; Secure`;
  return str;
}

const JWT_SECRET = process.env.JWT_SECRET || 'codegalaxy-default-jwt-secret-key-change-me';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'codegalaxy-default-refresh-secret-key-change-me';

export interface TokenPayload {
  userId: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function setRefreshTokenCookie(res: VercelResponse, token: string): void {
  const cookieHeader = serializeCookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
  res.setHeader('Set-Cookie', cookieHeader);
}

export function clearRefreshTokenCookie(res: VercelResponse): void {
  const cookieHeader = serializeCookie('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  res.setHeader('Set-Cookie', cookieHeader);
}

export function getRefreshTokenFromCookie(req: VercelRequest): string | null {
  const cookies = parseCookies(req.headers.cookie || '');
  return cookies.refreshToken || null;
}

export function extractAuthUser(req: VercelRequest): TokenPayload | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const user = verifyAccessToken(token);
    if (user) return user;
  }

  // Fallback to refresh token if access token missing or expired
  const refreshToken = getRefreshTokenFromCookie(req);
  if (refreshToken) {
    return verifyRefreshToken(refreshToken);
  }

  return null;
}

// Wrapper for protected Vercel serverless handlers
export type AuthenticatedHandler = (
  req: VercelRequest,
  res: VercelResponse,
  user: TokenPayload
) => Promise<void> | void;

export function withAuth(handler: AuthenticatedHandler) {
  return async (req: VercelRequest, res: VercelResponse) => {
    // CORS headers for serverless
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const user = extractAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }

    return handler(req, res, user);
  };
}
