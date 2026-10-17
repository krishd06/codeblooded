import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Clean up key if prefixed with 'anon=' from dashboard copy-paste
const supabaseAnonKey = rawAnonKey.startsWith('anon=')
  ? rawAnonKey.slice(5)
  : rawAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[API Sentinel] Supabase URL or Anon Key is missing. Please check your .env.local configuration.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
