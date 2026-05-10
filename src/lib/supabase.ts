import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fail gracefully if env vars are missing to avoid the "Invalid URL" crash
if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  console.error('CRITICAL: VITE_SUPABASE_URL is missing or invalid. Deployment requires this Environment Variable.');
}

export const supabase = createClient<any>(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);
