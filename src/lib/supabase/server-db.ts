/**
 * Server-side Database Access Utility
 * 
 * This file provides server-side database operations using Server Components.
 * Use this ONLY in Server Components and API routes.
 * 
 * DO NOT import this in Client Components!
 */

import { createServerSupabaseClient } from './server';
import { Database } from './database.types';

type Tables = Database['public']['Tables'];

/**
 * Server-side database operations
 * Use this in Server Components and API routes only
 */
export function getServerDb() {
  const supabase = createServerSupabaseClient();
  
  return {
    customers: {
      getAll: async () => {
        const { data, error } = await supabase.from('customers').select('*');
        if (error) throw error;
        return data as Tables['customers']['Row'][];
      },
      getById: async (id: string) => {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        return data as Tables['customers']['Row'];
      },
      // Add more methods as needed...
    },
    // Add other tables as needed...
  };
}

