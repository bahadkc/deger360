import { supabase } from './client';

/**
 * Admin Authentication Utilities
 */

export interface AdminUser {
  id: string;
  email: string;
  role: 'superadmin' | 'admin' | 'lawyer' | 'acente';
  customer_id: string | null;
  name?: string | null;
}

/**
 * Check if current user is admin (including superadmin)
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('user_auth')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error || !data) return false;
    const role = (data as { role: string }).role;
    return role === 'superadmin' || role === 'admin' || role === 'lawyer' || role === 'acente';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Check if current user is superadmin
 */
export async function isSuperAdmin(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('user_auth')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error || !data) return false;
    return (data as { role: string }).role === 'superadmin';
  } catch (error) {
    console.error('Error checking superadmin status:', error);
    return false;
  }
}

/**
 * Get current admin user info
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_auth')
      .select('role, customer_id, name')
      .eq('id', user.id)
      .single();

    if (error || !data) return null;

    const authData = data as { role: string; customer_id: string | null; name: string | null };
    return {
      id: user.id,
      email: user.email || '',
      role: authData.role as 'superadmin' | 'admin' | 'lawyer' | 'acente',
      customer_id: authData.customer_id,
      name: authData.name || null,
    };
  } catch (error) {
    console.error('Error getting admin user:', error);
    return null;
  }
}

/**
 * Get case IDs assigned to current admin
 * Returns empty array for superadmin (they see all cases)
 * Admin, lawyer, and acente only see their assigned cases
 */
export async function getAssignedCaseIds(): Promise<string[]> {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return [];

    // Superadmin sees all cases
    if (admin.role === 'superadmin') {
      return []; // Empty array means "all cases"
    }

    // Admin, lawyer, and acente only see their assigned cases
    const { data, error } = await supabase
      .from('case_admins')
      .select('case_id')
      .eq('admin_id', admin.id);

    if (error) {
      console.error('Error getting assigned cases:', error);
      return [];
    }

    return (data || []).map((item: { case_id: string }) => item.case_id);
  } catch (error) {
    console.error('Error getting assigned case IDs:', error);
    return [];
  }
}

/**
 * Check if current admin can edit (superadmin, admin, lawyer can edit; acente cannot)
 */
export async function canEdit(): Promise<boolean> {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return false;
    return admin.role === 'superadmin' || admin.role === 'admin' || admin.role === 'lawyer';
  } catch (error) {
    console.error('Error checking edit permission:', error);
    return false;
  }
}

/**
 * Check if current admin can assign admins (only superadmin can)
 */
export async function canAssignAdmins(): Promise<boolean> {
  try {
    return await isSuperAdmin();
  } catch (error) {
    console.error('Error checking admin assignment permission:', error);
    return false;
  }
}

/**
 * Get all admin users (for admin assignment dropdown)
 * Uses API route since auth.admin is server-side only
 */
export async function getAllAdmins(): Promise<Array<{ id: string; name: string; email: string; role: string }>> {
  try {
    const response = await fetch('/api/get-admins', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    if (!response.ok) {
      console.error('Failed to get admins');
      return [];
    }
    const data = await response.json();
    return data.admins || [];
  } catch (error) {
    console.error('Error getting all admins:', error);
    return [];
  }
}

/**
 * Login as admin
 */
export async function loginAsAdmin(email: string, password: string) {
  // Ensure Supabase client is properly initialized
  if (!supabase) {
    throw new Error('Supabase client başlatılamadı. Lütfen sayfayı yenileyin.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Admin login error details:', error);
    if (error.message?.includes('Invalid login credentials') || error.message?.includes('Invalid credentials')) {
      throw new Error('E-posta veya şifre hatalı. Lütfen tekrar deneyin.');
    }
    if (error.message?.includes('No API key found')) {
      throw new Error('Sistem hatası: API anahtarı bulunamadı. Lütfen sayfayı yenileyin ve tekrar deneyin.');
    }
    throw new Error(error.message || 'Giriş başarısız. Lütfen tekrar deneyin.');
  }

  // Verify admin role
  const admin = await getCurrentAdmin();
  if (!admin || (admin.role !== 'superadmin' && admin.role !== 'admin' && admin.role !== 'lawyer' && admin.role !== 'acente')) {
    await supabase.auth.signOut();
    throw new Error('Bu hesap admin yetkisine sahip değil');
  }

  return { user: data.user, admin };
}
