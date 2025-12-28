/**
 * Supabase Database Access - Main Export
 * 
 * This is the main entry point for all Supabase database operations.
 * Import from here for easy access to all database utilities.
 */

// Clients
export { supabase } from './client';
export { supabaseAdmin } from './admin';
// Note: createServerSupabaseClient should be imported directly from './server' 
// in Server Components only (it uses next/headers which is not available in Client Components)

// Database Types
export type { Database } from './database.types';

// Database Access Utilities
export { DatabaseAccess, db, dbAdmin } from './db';
// Note: getServerDb should be imported directly from './server-db' in Server Components only
// (it uses createServerSupabaseClient which requires next/headers)

// API Utilities (existing)
export {
  casesApi,
  documentsApi,
  processStepsApi,
  customerTasksApi,
  activitiesApi,
  notificationsApi,
  customersApi,
  paymentsApi,
} from './api';

// React Hooks (existing)
export {
  useCase,
  useDocuments,
  useProcessSteps,
  useCustomerTasks,
  useActivities,
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
