import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/autoapply'),
  NEXTAUTH_SECRET: z.string().default('dev-only-secret-change-me'),
  OPENAI_BASE_URL: z.string().url().default('https://api.openai.com/v1'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  ENABLE_AUTOMATION: z.enum(['true', 'false']).default('false'),
  DEMO_MODE: z.enum(['true', 'false']).default('true')
});

export const env = schema.parse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
  ENABLE_AUTOMATION: process.env.ENABLE_AUTOMATION,
  DEMO_MODE: process.env.DEMO_MODE
});

export function assertProductionEnv() {
  if (env.NODE_ENV !== 'production') return;

  const missing: string[] = [];
  if (!process.env.OPENAI_API_KEY) missing.push('OPENAI_API_KEY');
  if (!process.env.NEXTAUTH_SECRET) missing.push('NEXTAUTH_SECRET');

  if (missing.length) {
    throw new Error(`Missing required production environment variables: ${missing.join(', ')}.`);
  }
}

export function isDemoMode(): boolean {
  return env.DEMO_MODE === 'true';
}
