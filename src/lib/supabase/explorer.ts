/**
 * Database Explorer Utility
 * 
 * Use this to explore and verify database structure and connectivity
 */

import { supabase } from './client';
import { Database } from './database.types';

type Tables = Database['public']['Tables'];
type TableName = keyof Tables;

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
  const tables: TableName[] = [
    'customers',
    'cases',
    'documents',
    'notifications',
    'user_auth',
    'admin_checklist',
    'case_admins',
  ];

  const stats: Record<string, { count: number; error?: string }> = {};

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        stats[table] = { count: 0, error: error.message };
      } else {
        stats[table] = { count: count || 0 };
      }
    } catch (err) {
      stats[table] = {
        count: 0,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  return stats;
}

/**
 * Get table structure information
 */
export async function getTableStructure(table: TableName) {
  try {
    // Get a sample record to understand the structure
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is fine for structure inspection
      throw error;
    }

    return {
      table,
      sample: data || null,
      columns: data ? Object.keys(data) : [],
    };
  } catch (err) {
    return {
      table,
      sample: null,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Test database connectivity
 */
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('id')
      .limit(1);

    if (error) {
      return {
        connected: false,
        error: error.message,
        code: error.code,
      };
    }

    return {
      connected: true,
      message: 'Database connection successful',
    };
  } catch (err) {
    return {
      connected: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Get all table names
 */
export function getTableNames(): TableName[] {
  return [
    'customers',
    'cases',
    'documents',
    'notifications',
    'user_auth',
    'admin_checklist',
    'case_admins',
  ];
}

/**
 * Get relationships between tables
 */
export function getTableRelationships() {
  return {
    customers: {
      hasMany: ['cases', 'notifications'],
      belongsTo: [],
    },
    cases: {
      hasMany: [
        'documents',
        'notifications',
        'admin_checklist',
        'case_admins',
      ],
      belongsTo: ['customers'],
    },
    documents: {
      hasMany: [],
      belongsTo: ['cases'],
    },
    admin_checklist: {
      hasMany: [],
      belongsTo: ['cases'],
    },
    case_admins: {
      hasMany: [],
      belongsTo: ['cases'],
    },
    notifications: {
      hasMany: [],
      belongsTo: ['customers', 'cases'],
    },
    user_auth: {
      hasMany: [],
      belongsTo: ['customers'],
    },
  };
}

/**
 * Get a comprehensive database overview
 */
export async function getDatabaseOverview() {
  const [stats, connection] = await Promise.all([
    getDatabaseStats(),
    testConnection(),
  ]);

  return {
    connection,
    stats,
    tables: getTableNames(),
    relationships: getTableRelationships(),
    timestamp: new Date().toISOString(),
  };
}
