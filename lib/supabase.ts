import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Browser client (respects RLS, used for auth)
let browserClient: SupabaseClient | null = null;

export function supabaseBrowser(): SupabaseClient | null {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.warn('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY — auth disabled');
    return null;
  }

  browserClient = createClient(url, anonKey);
  return browserClient;
}

// Admin client (bypasses RLS, used in API routes)
let adminClient: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  adminClient = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return adminClient;
}
