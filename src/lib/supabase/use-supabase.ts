// src/lib/supabase/use-supabase.ts
'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from './database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

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

/**
 * Custom hook to get Supabase client
 * Ensures client is only created on client-side (in useEffect)
 * This prevents SSR hydration mismatches
 */
export function useSupabase(): SupabaseClient<Database> | null {
  const [client, setClient] = useState<SupabaseClient<Database> | null>(null);

  useEffect(() => {
    // Only create client on client-side
    if (typeof window !== 'undefined') {
      const supabaseClient = createBrowserClient<Database>(
        supabaseUrl as string,
        supabaseAnonKey as string,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
          global: {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          },
        }
      );
      setClient(supabaseClient);
    }
  }, []);

  return client;
}

