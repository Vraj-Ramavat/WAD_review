import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { parseCookie } from '../utils/cookieUtils.js';

export interface AuthUserPayload {
  userId: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export function getJwtSecret(): string {
  return process.env.JWT_SECRET || 'codegalaxy_super_secret_jwt_key_3d_cosmic_2026';
}

export function signJwtToken(payload: AuthUserPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export function verifyJwtToken(token: string): AuthUserPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as AuthUserPayload;
  } catch {
    return null;
  }
}

export function extractAuthUser(req: Request): AuthUserPayload | null {
  // 1. Check Authorization header: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const decoded = verifyJwtToken(token);
    if (decoded) return decoded;
  }

  // 2. Check HTTP-only cookie 'codegalaxy_token'
  if (req.headers.cookie) {
    const cookies = parseCookie(req.headers.cookie);
    const token = cookies.codegalaxy_token;
    if (token) {
      const decoded = verifyJwtToken(token);
      if (decoded) return decoded;
    }
  }

  return null;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const user = extractAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
  }
  req.user = user;
  next();
}

export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const user = extractAuthUser(req);
  if (user) {
    req.user = user;
  }
  next();
}
