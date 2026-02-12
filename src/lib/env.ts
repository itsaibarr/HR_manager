import { z } from 'zod';

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // Direct Postgres connection (used by debug-auth route)
  DATABASE_URL: z.string().min(1).optional(),

  // Gemini AI
  GEMINI_API_KEY: z.string().min(1).optional(),

  // App URL
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // Resend Email
  RESEND_API_KEY: z.string().min(1).optional(),

  // Google OAuth (optional — configured in Supabase Dashboard)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

/**
 * Validates environment variables at runtime. Call in server entrypoints.
 * Use getEnv() for optional validation (returns env as-is when already validated).
 */
export function validateEnv(): Env {
  if (_env) return _env;
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const message = result.error.issues
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join('; ');
    throw new Error(`Invalid environment: ${message}`);
  }
  _env = result.data;
  return _env;
}

/**
 * Returns validated env. Throws if validateEnv() has not been called in server context.
 */
export function getEnv(): Env {
  if (!_env) return validateEnv();
  return _env;
}
