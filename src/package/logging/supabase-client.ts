import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { warn } from '@/package/console-logger';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    warn('Logger', 'Supabase credentials not configured. Logging disabled.');
    return null;
  }

  supabaseClient = createClient(url, key, {
    auth: { persistSession: false },
  });

  return supabaseClient;
}
