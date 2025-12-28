/**
 * Comprehensive Database Access Utility
 * 
 * This file provides easy access to all database tables and operations.
 * Use this for direct database queries and operations.
 */

import { supabase } from './client';
import { supabaseAdmin } from './admin';
import { Database } from './database.types';

type Tables = Database['public']['Tables'];
type TableName = keyof Tables;

/**
 * Generic database operations for any table
 */
export class DatabaseAccess {
  /**
   * Get all records from a table
   */
  static async getAll<T extends TableName>(
    table: T,
    options?: {
      orderBy?: keyof Tables[T]['Row'];
      ascending?: boolean;
      limit?: number;
      select?: string;
    }
  ): Promise<Tables[T]['Row'][]> {
    let query = supabase.from(table).select(options?.select || '*');

    if (options?.orderBy) {
      query = query.order(options.orderBy as string, {
        ascending: options.ascending ?? true,
      });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as any;
  }

  /**
   * Get a single record by ID
   */
  static async getById<T extends TableName>(
    table: T,
    id: string | number,
    select?: string
  ): Promise<Tables[T]['Row']> {
    const { data, error } = await supabase
      .from(table)
      .select(select || '*')
      .eq('id', id as any)
      .single();

    if (error) throw error;
    return data as any;
  }

  /**
   * Get records by a field value
   */
  static async getByField<T extends TableName>(
    table: T,
    field: keyof Tables[T]['Row'],
    value: any,
    options?: {
      select?: string;
      orderBy?: keyof Tables[T]['Row'];
      ascending?: boolean;
    }
  ): Promise<Tables[T]['Row'][]> {
    let query = supabase
      .from(table)
      .select(options?.select || '*')
      .eq(field as string, value);

    if (options?.orderBy) {
      query = query.order(options.orderBy as string, {
        ascending: options.ascending ?? true,
      });
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as any;
  }

  /**
   * Insert a new record
   */
  static async insert<T extends TableName>(
    table: T,
    data: Tables[T]['Insert']
  ): Promise<Tables[T]['Row']> {
    const { data: inserted, error } = await supabase
      .from(table)
      .insert(data as any)
      .select()
      .single();

    if (error) throw error;
    return inserted as any;
  }

  /**
   * Insert multiple records
   */
  static async insertMany<T extends TableName>(
    table: T,
    data: any[]
  ): Promise<any[]> {
    const { data: inserted, error } = await supabase
      .from(table)
      .insert(data as any)
      .select();

    if (error) throw error;
    return inserted as any;
  }

  /**
   * Update a record by ID
   */
  static async update<T extends TableName>(
    table: T,
    id: string | number,
    updates: Tables[T]['Update']
  ): Promise<any> {
    const { data, error } = await supabase
      .from(table)
      .update(updates as any)
      .eq('id', id as any)
      .select()
      .single();

    if (error) throw error;
    return data as any;
  }

  /**
   * Update records by field
   */
  static async updateByField<T extends TableName>(
    table: T,
    field: keyof Tables[T]['Row'],
    value: any,
    updates: Tables[T]['Update']
  ): Promise<any[]> {
    const { data, error } = await supabase
      .from(table)
      .update(updates as any)
      .eq(field as string, value)
      .select();

    if (error) throw error;
    return data as any;
  }

  /**
   * Delete a record by ID
   */
  static async delete<T extends TableName>(
    table: T,
    id: string
  ): Promise<void> {
    const { error } = await supabase.from(table).delete().eq('id', id as any);

    if (error) throw error;
  }

  /**
   * Delete records by field
   */
  static async deleteByField<T extends TableName>(
    table: T,
    field: keyof Tables[T]['Row'],
    value: any
  ): Promise<void> {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq(field as string, value as any);

    if (error) throw error;
  }

  /**
   * Count records in a table
   */
  static async count<T extends TableName>(
    table: T,
    filter?: {
      field: keyof Tables[T]['Row'];
      value: any;
    }
  ): Promise<number> {
    let query = supabase.from(table).select('*', { count: 'exact', head: true });

    if (filter) {
      query = query.eq(filter.field as string, filter.value as any);
    }

    const { count, error } = await query;

    if (error) throw error;
    return count || 0;
  }

  /**
   * Check if a record exists
   */
  static async exists<T extends TableName>(
    table: T,
    id: string | number
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from(table)
      .select('id')
      .eq('id', id as any)
      .single();

    return !error && !!data;
  }
}

/**
 * Table-specific database operations
 */
export const db = {
  // Customers
  customers: {
    getAll: () => DatabaseAccess.getAll('customers'),
    getById: (id: string | number) => DatabaseAccess.getById('customers', id as any),
    getByEmail: (email: string) =>
      DatabaseAccess.getByField('customers', 'email', email),
    getByTrackingNumber: (trackingNumber: string) =>
      DatabaseAccess.getByField('customers', 'dosya_takip_numarasi', trackingNumber),
    insert: (data: Tables['customers']['Insert']) =>
      DatabaseAccess.insert('customers', data),
    update: (id: string | number, updates: Tables['customers']['Update']) =>
      DatabaseAccess.update('customers', id as any, updates as any),
    delete: (id: string | number) => DatabaseAccess.delete('customers', id as any),
    count: () => DatabaseAccess.count('customers'),
  },

  // Cases
  cases: {
    getAll: (options?: { orderBy?: keyof Tables['cases']['Row']; ascending?: boolean; limit?: number }) =>
      DatabaseAccess.getAll('cases', options),
    getById: (id: string | number) => DatabaseAccess.getById('cases', id as any),
    getByCaseNumber: (caseNumber: string) =>
      DatabaseAccess.getByField('cases', 'case_number', caseNumber),
    getByCustomerId: (customerId: string) =>
      DatabaseAccess.getByField('cases', 'customer_id', customerId, {
        orderBy: 'created_at',
        ascending: false,
      }),
    getByStatus: (status: string) =>
      DatabaseAccess.getByField('cases', 'status', status),
    getByStage: (stage: string) =>
      DatabaseAccess.getByField('cases', 'current_stage', stage),
    insert: (data: Tables['cases']['Insert']) =>
      DatabaseAccess.insert('cases', data),
    update: (id: string, updates: Tables['cases']['Update']) =>
      DatabaseAccess.update('cases', id, updates),
    delete: (id: string) => DatabaseAccess.delete('cases', id),
    count: () => DatabaseAccess.count('cases'),
    countByStatus: (status: string) =>
      DatabaseAccess.count('cases', { field: 'status', value: status }),
  },

  // Documents
  documents: {
    getAll: () => DatabaseAccess.getAll('documents'),
    getById: (id: string) => DatabaseAccess.getById('documents', id),
    getByCaseId: (caseId: string) =>
      DatabaseAccess.getByField('documents', 'case_id', caseId, {
        orderBy: 'uploaded_at',
        ascending: false,
      }),
    getByCategory: (category: string) =>
      DatabaseAccess.getByField('documents', 'category', category),
    getByStatus: (status: string) =>
      DatabaseAccess.getByField('documents', 'status', status),
    insert: (data: Tables['documents']['Insert']) =>
      DatabaseAccess.insert('documents', data),
    update: (id: string, updates: Tables['documents']['Update']) =>
      DatabaseAccess.update('documents', id, updates),
    delete: (id: string) => DatabaseAccess.delete('documents', id),
    count: () => DatabaseAccess.count('documents'),
    countByCaseId: (caseId: string) =>
      DatabaseAccess.count('documents', { field: 'case_id', value: caseId }),
  },

  // Process Steps
  processSteps: {
    getAll: () => DatabaseAccess.getAll('process_steps'),
    getById: (id: string) => DatabaseAccess.getById('process_steps', id),
    getByCaseId: (caseId: string) =>
      DatabaseAccess.getByField('process_steps', 'case_id', caseId, {
        orderBy: 'step_order',
        ascending: true,
      }),
    getByStatus: (status: string) =>
      DatabaseAccess.getByField('process_steps', 'status', status),
    insert: (data: Tables['process_steps']['Insert']) =>
      DatabaseAccess.insert('process_steps', data),
    insertMany: (data: Tables['process_steps']['Insert'][]) =>
      DatabaseAccess.insertMany('process_steps', data),
    update: (id: string, updates: Tables['process_steps']['Update']) =>
      DatabaseAccess.update('process_steps', id, updates),
    delete: (id: string) => DatabaseAccess.delete('process_steps', id),
    count: () => DatabaseAccess.count('process_steps'),
  },

  // Customer Tasks
  customerTasks: {
    getAll: () => DatabaseAccess.getAll('customer_tasks'),
    getById: (id: string) => DatabaseAccess.getById('customer_tasks', id),
    getByCaseId: (caseId: string) =>
      DatabaseAccess.getByField('customer_tasks', 'case_id', caseId, {
        orderBy: 'created_at',
        ascending: false,
      }),
    getByStatus: (status: string) =>
      DatabaseAccess.getByField('customer_tasks', 'status', status),
    getPending: () =>
      DatabaseAccess.getByField('customer_tasks', 'status', 'pending'),
    getCompleted: () =>
      DatabaseAccess.getByField('customer_tasks', 'status', 'completed'),
    insert: (data: Tables['customer_tasks']['Insert']) =>
      DatabaseAccess.insert('customer_tasks', data),
    update: (id: string, updates: Tables['customer_tasks']['Update']) =>
      DatabaseAccess.update('customer_tasks', id, updates),
    delete: (id: string) => DatabaseAccess.delete('customer_tasks', id),
    count: () => DatabaseAccess.count('customer_tasks'),
    countByStatus: (status: string) =>
      DatabaseAccess.count('customer_tasks', { field: 'status', value: status }),
  },

  // Activities
  activities: {
    getAll: () => DatabaseAccess.getAll('activities'),
    getById: (id: string) => DatabaseAccess.getById('activities', id),
    getByCaseId: (caseId: string) =>
      DatabaseAccess.getByField('activities', 'case_id', caseId, {
        orderBy: 'created_at',
        ascending: false,
      }),
    getByType: (type: string) =>
      DatabaseAccess.getByField('activities', 'type', type),
    insert: (data: Tables['activities']['Insert']) =>
      DatabaseAccess.insert('activities', data),
    update: (id: string, updates: Tables['activities']['Update']) =>
      DatabaseAccess.update('activities', id, updates),
    delete: (id: string) => DatabaseAccess.delete('activities', id),
    count: () => DatabaseAccess.count('activities'),
  },

  // Payments
  payments: {
    getAll: () => DatabaseAccess.getAll('payments'),
    getById: (id: string) => DatabaseAccess.getById('payments', id),
    getByCaseId: (caseId: string) =>
      DatabaseAccess.getByField('payments', 'case_id', caseId, {
        orderBy: 'created_at',
        ascending: false,
      }),
    getByStatus: (status: string) =>
      DatabaseAccess.getByField('payments', 'status', status),
    getByType: (paymentType: string) =>
      DatabaseAccess.getByField('payments', 'payment_type', paymentType),
    insert: (data: Tables['payments']['Insert']) =>
      DatabaseAccess.insert('payments', data),
    update: (id: string, updates: Tables['payments']['Update']) =>
      DatabaseAccess.update('payments', id, updates),
    delete: (id: string) => DatabaseAccess.delete('payments', id),
    count: () => DatabaseAccess.count('payments'),
    getTotalAmount: async (caseId?: string): Promise<number> => {
      const payments = caseId
        ? await DatabaseAccess.getByField('payments', 'case_id', caseId)
        : await DatabaseAccess.getAll('payments');
      return payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    },
  },

  // Notifications
  notifications: {
    getAll: () => DatabaseAccess.getAll('notifications'),
    getById: (id: string) => DatabaseAccess.getById('notifications', id),
    getByCustomerId: (customerId: string) =>
      DatabaseAccess.getByField('notifications', 'customer_id', customerId, {
        orderBy: 'created_at',
        ascending: false,
      }),
    getByCaseId: (caseId: string) =>
      DatabaseAccess.getByField('notifications', 'case_id', caseId),
    getUnread: (customerId: string) =>
      DatabaseAccess.getByField('notifications', 'customer_id', customerId).then(
        (notifications) => notifications.filter((n) => !n.read)
      ),
    insert: (data: Tables['notifications']['Insert']) =>
      DatabaseAccess.insert('notifications', data),
    update: (id: string, updates: Tables['notifications']['Update']) =>
      DatabaseAccess.update('notifications', id, updates),
    markAsRead: (id: string) =>
      DatabaseAccess.update('notifications', id, {
        read: true,
        read_at: new Date().toISOString(),
      }),
    delete: (id: string) => DatabaseAccess.delete('notifications', id),
    count: () => DatabaseAccess.count('notifications'),
    getUnreadCount: async (customerId: string): Promise<number> => {
      const unread = await DatabaseAccess.getByField(
        'notifications',
        'customer_id',
        customerId
      );
      return unread.filter((n) => !n.read).length;
    },
  },

  // User Auth
  userAuth: {
    getAll: () => DatabaseAccess.getAll('user_auth'),
    getById: (id: string) => DatabaseAccess.getById('user_auth', id),
    getByCustomerId: (customerId: string) =>
      DatabaseAccess.getByField('user_auth', 'customer_id', customerId),
    getByRole: (role: string) =>
      DatabaseAccess.getByField('user_auth', 'role', role),
    insert: (data: Tables['user_auth']['Insert']) =>
      DatabaseAccess.insert('user_auth', data),
    update: (id: string, updates: Tables['user_auth']['Update']) =>
      DatabaseAccess.update('user_auth', id, updates),
    delete: (id: string) => DatabaseAccess.delete('user_auth', id),
    count: () => DatabaseAccess.count('user_auth'),
  },
};

/**
 * Admin database operations (uses service role key)
 * Use with caution - bypasses RLS policies
 */
export const dbAdmin = {
  // Same methods as db but using admin client
  customers: {
    getAll: async () => {
      const { data, error } = await supabaseAdmin.from('customers').select('*');
      if (error) throw error;
      return data as Tables['customers']['Row'][];
    },
    getById: async (id: string | number) => {
      const { data, error } = await supabaseAdmin
        .from('customers')
        .select('*')
        .eq('id', id as any)
        .single();
      if (error) throw error;
      return data as never;
    },
    insert: async (data: Tables['customers']['Insert']) => {
      const { data: inserted, error } = await supabaseAdmin
        .from('customers')
        .insert(data as never)
        .select()
        .single();
      if (error) throw error;
      return inserted as never;
    },
    update: async (id: string | number, updates: Tables['customers']['Update']) => {
      const { data, error } = await supabaseAdmin
        .from('customers')
        .update(updates as never)
        .eq('id', id as any)
        .select()
        .single();
      if (error) throw error;
      return data as never;
    },
    delete: async (id: string | number) => {
      const { error } = await supabaseAdmin
        .from('customers')
        .delete()
        .eq('id', id as any);
      if (error) throw error;
    },
  },
  // Add other tables as needed...
};

/**
 * Export the Supabase clients for direct use if needed
 * Note: createServerSupabaseClient should be imported directly from './server' in Server Components only
 * Note: getServerDb should be imported from './db-server' in Server Components only
 */
export { supabase, supabaseAdmin };
