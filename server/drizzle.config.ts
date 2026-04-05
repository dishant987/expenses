import { defineConfig } from 'drizzle-kit';
import { resolve } from 'path';
import { config } from 'dotenv';

const envPath = resolve(process.cwd(), '.env');
config({ path: envPath });

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
