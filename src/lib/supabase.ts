import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Keep the app buildable even when env vars are not configured yet.
const resolvedUrl = supabaseUrl || 'http://127.0.0.1:54321';
const resolvedAnonKey = supabaseAnonKey || 'public-anon-key';

export const supabase = createClient(resolvedUrl, resolvedAnonKey);
