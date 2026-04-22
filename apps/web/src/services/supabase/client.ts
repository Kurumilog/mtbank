/**
 * Supabase client placeholder.
 *
 * The actual `@supabase/supabase-js` integration is intentionally deferred —
 * the services below use a minimal fetch-based interface so we don't pull in
 * an unused dependency until the backend is wired up.
 *
 * To enable:
 *   1. yarn add @supabase/supabase-js
 *   2. Replace `getSupabaseClient` with the real `createClient` call.
 *   3. Populate the VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY env vars.
 */
export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function isSupabaseEnabled(): boolean {
  return getSupabaseConfig() !== null;
}
