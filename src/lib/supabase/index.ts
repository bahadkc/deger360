/**
 * Supabase Database Access - Main Export
 * 
 * This is the main entry point for all Supabase database operations.
 * Import from here for easy access to all database utilities.
 */

// Clients
export { supabase } from './client';
export { supabaseAdmin } from './admin';
export { createServerSupabaseClient } from './server';

// Database Types
export type { Database } from './database.types';

// Database Access Utilities
export { DatabaseAccess, db, dbAdmin, getServerDb } from './db';

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
