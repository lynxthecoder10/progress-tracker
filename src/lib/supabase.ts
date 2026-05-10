import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Fail gracefully if env vars are missing to avoid the "Invalid URL" crash
if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  console.error('CRITICAL: Supabase URL is missing or invalid. Check your Netlify environment variables.');
}

export const supabase = createClient<any>(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);
