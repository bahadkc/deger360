/**
 * Supabase Database Access - Main Export
 * 
 * This is the main entry point for all Supabase database operations.
 * Import from here for easy access to all database utilities.
 */

// Clients
export { supabase } from './client';
export { supabaseAdmin } from './admin';
// Note: createServerSupabaseClient is not exported here to avoid client-side import issues
// Import it directly from '@/lib/supabase/server' in Server Components only

// Database Types
export type { Database } from './database.types';

// Database Access Utilities (Client-side)
export { DatabaseAccess, db, dbAdmin } from './db';
// Server-side database utilities - import directly from '@/lib/supabase/db-server' in Server Components

// API Utilities (existing)
export {
  casesApi,
  documentsApi,
  notificationsApi,
  customersApi,
} from './api';

// React Hooks (existing)
export {
  useCase,
  useDocuments,
  useNotifications,
} from './hooks';

// Database Explorer
export {
  getDatabaseStats,
  getTableStructure,
  testConnection,
  getTableNames,
  getTableRelationships,
  getDatabaseOverview,
} from './explorer';

// Auth Utilities
export {
  loginWithCaseNumber,
  logout,
  getCurrentUser,
  getCurrentCustomer,
  getCurrentUserCases,
} from './auth';
