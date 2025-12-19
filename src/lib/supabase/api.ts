import { supabase, supabaseAdmin } from './client';
import { Database } from './database.types';

type Tables = Database['public']['Tables'];

// Cases API
export const casesApi = {
  // Get single case by ID
  async getById(caseId: string) {
    const { data, error } = await supabase
      .from('cases')
      .select(`
        *,
        customer:customers(*),
        documents(*),
        process_steps(*),
        customer_tasks(*),
        activities(*),
        payments(*)
      `)
      .eq('id', caseId)
      .single();

    if (error) throw error;
    return data;
  },

  // Get case by case number
  async getByCaseNumber(caseNumber: string) {
    const { data, error } = await supabase
      .from('cases')
      .select(`
        *,
        customer:customers(*),
        documents(*),
        process_steps(*)
      `)
      .eq('case_number', caseNumber)
      .single();

    if (error) throw error;
    return data;
  },

  // Get all cases for a customer
  async getByCustomerId(customerId: string) {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Update case
  async update(caseId: string, updates: Partial<Tables['cases']['Update']>) {
    const { data, error } = await supabase
      .from('cases')
      .update(updates)
      .eq('id', caseId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Documents API
export const documentsApi = {
  // Get all documents for a case
  async getByCaseId(caseId: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('case_id', caseId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Upload document
  async upload(file: File, caseNumber: string, category: string, caseId: string) {
    // Upload to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${caseNumber}/${category}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Create document record
    const { data, error } = await supabase
      .from('documents')
      .insert({
        case_id: caseId,
        name: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        file_type: file.type,
        category,
        uploaded_by: 'customer',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get document URL
  async getUrl(filePath: string) {
    const { data } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    return data?.signedUrl;
  },

  // Delete document
  async delete(documentId: string, filePath: string) {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([filePath]);

    if (storageError) throw storageError;

    // Delete record
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (error) throw error;
  },
};

// Process Steps API
export const processStepsApi = {
  // Get all steps for a case
  async getByCaseId(caseId: string) {
    const { data, error } = await supabase
      .from('process_steps')
      .select('*')
      .eq('case_id', caseId)
      .order('step_order', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Update step
  async update(stepId: string, updates: Partial<Tables['process_steps']['Update']>) {
    const { data, error } = await supabase
      .from('process_steps')
      .update(updates)
      .eq('id', stepId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Customer Tasks API
export const customerTasksApi = {
  // Get all tasks for a case
  async getByCaseId(caseId: string) {
    const { data, error } = await supabase
      .from('customer_tasks')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Update task (complete/uncomplete)
  // Note: Customers can only update 'completed', 'status', and 'completed_at' fields
  // Other fields are protected by application logic
  async update(taskId: string, updates: Partial<Tables['customer_tasks']['Update']>) {
    // Filter updates to only allow safe fields for customers
    const safeUpdates: Partial<Tables['customer_tasks']['Update']> = {
      completed: updates.completed,
      status: updates.status,
      completed_at: updates.completed_at,
    };

    const { data, error } = await supabase
      .from('customer_tasks')
      .update(safeUpdates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mark task as completed
  async complete(taskId: string) {
    return this.update(taskId, {
      status: 'completed',
      completed: true,
      completed_at: new Date().toISOString(),
    });
  },
};

// Activities API
export const activitiesApi = {
  // Get all activities for a case
  async getByCaseId(caseId: string) {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Create new activity
  async create(activity: Tables['activities']['Insert']) {
    const { data, error } = await supabase
      .from('activities')
      .insert(activity)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Notifications API
export const notificationsApi = {
  // Get all notifications for a customer
  async getByCustomerId(customerId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get unread count
  async getUnreadCount(customerId: string) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', customerId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  },

  // Mark as read
  async markAsRead(notificationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Customers API
export const customersApi = {
  // Get customer by ID
  async getById(customerId: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (error) throw error;
    return data;
  },

  // Update customer
  async update(customerId: string, updates: Partial<Tables['customers']['Update']>) {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', customerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Payments API
export const paymentsApi = {
  // Get all payments for a case
  async getByCaseId(caseId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};
