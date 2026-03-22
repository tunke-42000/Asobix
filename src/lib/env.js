/**
 * Centralized Environment variables access.
 * Fallbacks or explicit errors should be done here.
 */
export const ENV = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
}

if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
  throw new Error('Supabase environment variables are missing! Please check your .env file or Vercel Environment Variables setting.')
}
