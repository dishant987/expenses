import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { resolve } from 'path';
import { config } from 'dotenv';
import * as schema from './schema.js';

// Absolute path for .env ensure robust loading on Windows
const envPath = resolve(process.cwd(), '.env');
config({ path: envPath });

if (!process.env.DATABASE_URL) {
  throw new Error(`DATABASE_URL is not defined in process.env (Loaded from ${envPath})`);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle(pool, { schema });
export { eq, and, or, desc, asc, sql, count, ilike, gte, lte, isNull, isNotNull, sum, inArray } from 'drizzle-orm';
export * from './schema.js';
