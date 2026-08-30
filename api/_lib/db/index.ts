import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url || url.trim() === '' || url.includes('ep-cool-db-123456')) {
    return null;
  }
  try {
    const client = neon(url);
    return drizzle(client, { schema });
  } catch (err) {
    console.warn('Neon DB connection initialization failed:', err);
    return null;
  }
}
