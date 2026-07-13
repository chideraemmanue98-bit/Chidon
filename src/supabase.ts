import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Initialize client if env vars are present
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey);
};

export async function checkSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  if (!supabase) {
    return {
      success: false,
      message: "Supabase environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are missing."
    };
  }
  try {
    // Standard lightweight call to check credentials and connectivity
    const { error } = await supabase.auth.getSession();
    if (error) {
      return {
        success: false,
        message: `Supabase API error: ${error.message}`
      };
    }
    return {
      success: true,
      message: "Supabase connection is stable and active."
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Connection failed: ${err.message || err}`
    };
  }
}
