import { supabase } from './client';
import { supabaseCache } from './cache';
import { Database } from './database.types';

type Tables = Database['public']['Tables'];

/**
 * Optimized API functions with caching and selective queries
 */

// Cache keys
const getCacheKey = (prefix: string, ...args: any[]) => {
  return `${prefix}:${args.join(':')}`;
};

// Cases API - Optimized
export const optimizedCasesApi = {
  /**
   * Get single case by ID - Only fetch required fields
   */
  async getById(caseId: string, options?: { includeRelations?: string[] }): Promise<any> {
    const cacheKey = getCacheKey('case', caseId, JSON.stringify(options));
    const cached = supabaseCache.get<any>(cacheKey);
    if (cached) return cached;

    // Build selective query based on what's needed
    const relations = options?.includeRelations || [];
    let selectQuery = 'id, case_number, customer_id, vehicle_plate, vehicle_brand_model, board_stage, status, value_loss_amount, fault_rate, assigned_lawyer, created_at, updated_at';

    if (relations.includes('customer')) {
      selectQuery += ', customer:customers(id, full_name, email, phone)';
    }
    if (relations.includes('documents')) {
      selectQuery += ', documents(id, name, category, uploaded_at)';
    }
    if (relations.includes('process_steps')) {
      selectQuery += ', process_steps(id, step_name, completed, step_order)';
    }

    const { data, error } = await supabase
      .from('cases')
      .select(selectQuery)
      .eq('id', caseId)
      .single();

    if (error) throw error;
    
    // Cache for 2 minutes
    supabaseCache.set(cacheKey, data, 120000);
    return data;
  },

  /**
   * Get cases for admin board - Uses API route to bypass RLS
   */
  async getForBoard(options?: {
    limit?: number;
    offset?: number;
    stage?: string;
    assignedTo?: string[];
  }): Promise<any[]> {
    const cacheKey = getCacheKey('board_cases', JSON.stringify(options));
    const cached = supabaseCache.get<any[]>(cacheKey);
    if (cached) return cached;

    try {
      // Use API route to bypass RLS
      const response = await fetch('/api/get-cases-board', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch cases');
      }

      const data = await response.json();
      const cases = data.cases || [];

      // Apply additional filters if needed (stage filter)
      let filteredCases = cases;
      if (options?.stage) {
        filteredCases = filteredCases.filter((c: any) => c.board_stage === options.stage);
      }

      // Apply pagination if needed
      if (options?.limit) {
        const offset = options.offset || 0;
        filteredCases = filteredCases.slice(offset, offset + options.limit);
      }

      // Cache for 30 seconds (board updates frequently)
      supabaseCache.set(cacheKey, filteredCases, 30000);
      return filteredCases;
    } catch (error) {
      console.error('Error in getForBoard:', error);
      throw error;
    }
  },

  /**
   * Get cases count - Lightweight query
   */
  async getCount(filters?: { stage?: string; assignedTo?: string[] }): Promise<number> {
    const cacheKey = getCacheKey('cases_count', JSON.stringify(filters));
    const cached = supabaseCache.get<number>(cacheKey);
    if (cached !== null) return cached;

    let query = supabase
      .from('cases')
      .select('id', { count: 'exact', head: true });

    if (filters?.stage) {
      query = query.eq('board_stage', filters.stage);
    }

    const { count, error } = await query;

    if (error) throw error;
    
    // Cache count for 1 minute
    supabaseCache.set(cacheKey, count || 0, 60000);
    return count || 0;
  },
};

// Customers API - Optimized
export const optimizedCustomersApi = {
  /**
   * Get customers list - Optimized with pagination and selective fields
   * Uses API route to bypass RLS policies
   */
  async getList(options?: {
    limit?: number;
    offset?: number;
    search?: string;
    assignedCaseIds?: string[];
  }): Promise<any[]> {
    const cacheKey = getCacheKey('customers_list', JSON.stringify(options));
    const cached = supabaseCache.get<any[]>(cacheKey);
    if (cached) return cached;

    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (options?.search) {
        params.append('search', options.search);
      }
      if (options?.limit) {
        params.append('limit', options.limit.toString());
      }

      // Use API route to bypass RLS
      const response = await fetch(`/api/get-customers?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error fetching customers from API:', errorData.error || response.statusText);
        throw new Error(errorData.error || 'Failed to fetch customers');
      }

      const data = await response.json();
      const customers = data.customers || [];

      console.log('Fetched customers from API:', customers.length);

      // Cache for 1 minute
      supabaseCache.set(cacheKey, customers, 60000);
      return customers;
    } catch (error) {
      console.error('Error in getList:', error);
      throw error;
    }
  },

  /**
   * Get customer by ID - Selective fields
   */
  async getById(customerId: string): Promise<any> {
    const cacheKey = getCacheKey('customer', customerId);
    const cached = supabaseCache.get<any>(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('customers')
      .select('id, full_name, email, phone, dosya_takip_numarasi, address, tc_kimlik, iban, created_at')
      .eq('id', customerId)
      .single();

    if (error) throw error;
    
    // Cache for 5 minutes (customer data changes infrequently)
    supabaseCache.set(cacheKey, data, 300000);
    return data;
  },
};

// Documents API - Optimized
export const optimizedDocumentsApi = {
  /**
   * Get documents for case - Only metadata, not file content
   */
  async getByCaseId(caseId: string): Promise<any[]> {
    const cacheKey = getCacheKey('documents', caseId);
    const cached = supabaseCache.get<any[]>(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('documents')
      .select('id, name, category, file_path, file_size, file_type, uploaded_at, uploaded_by')
      .eq('case_id', caseId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    
    // Cache for 2 minutes
    supabaseCache.set(cacheKey, data, 120000);
    return data;
  },
};

// Activities API - Optimized with pagination
export const optimizedActivitiesApi = {
  /**
   * Get activities for case - Paginated
   */
  async getByCaseId(caseId: string, options?: { limit?: number; offset?: number }): Promise<any[]> {
    const cacheKey = getCacheKey('activities', caseId, JSON.stringify(options));
    const cached = supabaseCache.get<any[]>(cacheKey);
    if (cached) return cached;

    let query = supabase
      .from('activities')
      .select('id, activity_type, description, created_at, created_by')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    // Cache for 30 seconds (activities update frequently)
    supabaseCache.set(cacheKey, data, 30000);
    return data;
  },
};

// Notifications API - Optimized
export const optimizedNotificationsApi = {
  /**
   * Get unread count - Lightweight query
   */
  async getUnreadCount(customerId: string): Promise<number> {
    const cacheKey = getCacheKey('notifications_count', customerId);
    const cached = supabaseCache.get<number>(cacheKey);
    if (cached !== null) return cached;

    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', customerId)
      .eq('read', false);

    if (error) throw error;
    
    // Cache for 30 seconds
    supabaseCache.set(cacheKey, count || 0, 30000);
    return count || 0;
  },

  /**
   * Get notifications - Paginated
   */
  async getByCustomerId(customerId: string, options?: { limit?: number; offset?: number }): Promise<any[]> {
    const cacheKey = getCacheKey('notifications', customerId, JSON.stringify(options));
    const cached = supabaseCache.get<any[]>(cacheKey);
    if (cached) return cached;

    let query = supabase
      .from('notifications')
      .select('id, title, message, read, created_at')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    // Cache for 30 seconds
    supabaseCache.set(cacheKey, data, 30000);
    return data;
  },
};

// Invalidate cache helpers
export const cacheInvalidation = {
  invalidateCase: (caseId: string) => {
    supabaseCache.invalidate(`case:${caseId}`);
    supabaseCache.invalidate('board_cases');
  },
  invalidateCustomer: (customerId: string) => {
    supabaseCache.invalidate(`customer:${customerId}`);
    supabaseCache.invalidate('customers_list');
  },
  invalidateBoard: () => {
    supabaseCache.invalidate('board_cases');
    supabaseCache.invalidate('cases_count');
  },
};

