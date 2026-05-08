import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
export const RESOURCE_BUCKET = "resource-files";

const hasPlaceholder =
  !supabaseUrl ||
  !supabaseKey ||
  supabaseUrl.includes("your-project") ||
  supabaseKey.includes("your-");

export const isSupabaseConfigured = Boolean(!hasPlaceholder);
export const isDemoModeAvailable = import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEMO_DATA === "true";

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;
