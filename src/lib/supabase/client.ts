// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

console.log('🔍 Loading Supabase client...');
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials missing!');
  throw new Error('Supabase environment variables are not configured');
}

console.log('✅ Creating Supabase client...');

// Browser/Client-side Supabase client
export const supabase = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

console.log('✅ Supabase client created successfully!');
