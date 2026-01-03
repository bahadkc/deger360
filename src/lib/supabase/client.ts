// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Supabase credentials missing!');
    console.error('URL:', supabaseUrl);
    console.error('Key exists:', !!supabaseAnonKey);
  }
  throw new Error('Supabase environment variables are not configured');
}

// Lazy initialization - only create client on client-side to avoid SSR hydration issues
let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Get or create Supabase browser client
 * Only creates client on client-side to avoid SSR hydration issues
 * This ensures browser APIs are only accessed in useEffect hooks
 */
function getSupabaseClient() {
  // Only create client on client-side (in browser)
  if (typeof window === 'undefined') {
    // During SSR, return null - components should handle this
    return null;
  }

  // TypeScript assertion: we know these are strings because of the check above
  const url = supabaseUrl as string;
  const key = supabaseAnonKey as string;

  // Create client only once (singleton pattern)
  if (!supabaseClient) {
    supabaseClient = createBrowserClient<Database>(
      url,
      key,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce', // ✅ Secure flow type
        },
        global: {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        },
      }
    );
  }

  return supabaseClient;
}

// Export client getter - components should use this in useEffect
export function getClient() {
  return getSupabaseClient();
}

// Export client for backward compatibility
// IMPORTANT: Only use this inside useEffect hooks or client-side code
// During SSR, this will be a no-op object, so always check for window before using
export const supabase = (() => {
  // During SSR, return a no-op object that won't cause errors
  if (typeof window === 'undefined') {
    return {} as ReturnType<typeof createBrowserClient<Database>>;
  }
  
  // On client-side, return the actual client (lazy initialization)
  return getSupabaseClient()!;
})();
