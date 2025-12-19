import { supabase } from './client';

/**
 * Admin Authentication Utilities
 */

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'lawyer';
  customer_id: string | null;
}

/**
 * Check if current user is admin
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
    return data.role === 'admin' || data.role === 'lawyer';
  } catch (error) {
    console.error('Error checking admin status:', error);
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
      .select('role, customer_id')
      .eq('id', user.id)
      .single();

    if (error || !data) return null;

    return {
      id: user.id,
      email: user.email || '',
      role: data.role as 'admin' | 'lawyer',
      customer_id: data.customer_id,
    };
  } catch (error) {
    console.error('Error getting admin user:', error);
    return null;
  }
}

/**
 * Login as admin
 */
export async function loginAsAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Verify admin role
  const admin = await getCurrentAdmin();
  if (!admin || (admin.role !== 'admin' && admin.role !== 'lawyer')) {
    await supabase.auth.signOut();
    throw new Error('Bu hesap admin yetkisine sahip değil');
  }

  return { user: data.user, admin };
}
