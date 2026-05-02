import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Cliente Supabase (REST/Auth/Realtime). Null si faltan variables de entorno. */
export const supabase =
  url && anonKey ? createClient(url, anonKey) : null;

export function getSupabase() {
  if (!supabase) {
    throw new Error(
      'Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en frontend/.env'
    );
  }
  return supabase;
}
