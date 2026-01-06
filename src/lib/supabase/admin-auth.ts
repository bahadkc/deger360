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

// Cache for admin status to prevent multiple API calls
let adminStatusCache: { 
  userId: string; 
  status: { isAdmin: boolean; isSuperAdmin: boolean; admin: AdminUser | null }; 
  timestamp: number 
} | null = null;
const ADMIN_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes cache - prevent frequent checks
const ADMIN_CACHE_STALE_DURATION = 30 * 60 * 1000; // 30 minutes - use expired cache if client-side session exists

// Clear admin status cache (called on logout)
export function clearAdminStatusCache() {
  adminStatusCache = null;
  assignedCaseIdsCache = null;
}

/**
 * Check if current user is admin (including superadmin)
 * Uses API route to bypass RLS policies
 * Implements caching to prevent multiple API calls
 */
export async function isAdmin(forceRefresh = false): Promise<boolean> {
  try {
    // 1. Check cache first - use fresh cache if available
    if (!forceRefresh && adminStatusCache) {
      const cacheAge = Date.now() - adminStatusCache.timestamp;
      if (cacheAge < ADMIN_CACHE_DURATION) {
        return adminStatusCache.status.isAdmin;
      }
      
      // 2. Cache expired but still usable - check client-side session first
      const { data: { user } } = await supabase.auth.getUser();
      if (user && adminStatusCache.userId === user.id) {
        // Client-side session exists, use expired cache (stale-while-revalidate pattern)
        // ⚠️ TEMPORARILY DISABLED: Background refresh can cause token race condition
        // Update cache in background (non-blocking) - DISABLED TO PREVENT RACE CONDITION
        // if (cacheAge < ADMIN_CACHE_STALE_DURATION) {
        //   // Silently refresh cache in background
        //   fetch('/api/check-admin-status', {
        //     method: 'GET',
        //     credentials: 'include',
        //     headers: { 'Content-Type': 'application/json' },
        //   })
        //     .then(async (res) => {
        //       if (res.ok) {
        //         const data = await res.json();
        //         const { data: { user: currentUser } } = await supabase.auth.getUser();
        //         if (currentUser && currentUser.id === adminStatusCache?.userId) {
        //           adminStatusCache = {
        //             userId: currentUser.id,
        //             status: {
        //               isAdmin: data.isAdmin === true,
        //               isSuperAdmin: data.isSuperAdmin === true,
        //               admin: data.admin || null,
        //             },
        //             timestamp: Date.now(),
        //           };
        //         }
        //       }
        //     })
        //     .catch(() => {
        //       // Ignore background refresh errors
        //     });
        // }
        
        // Return cached value even if expired (better than causing race condition)
        if (cacheAge < ADMIN_CACHE_STALE_DURATION) {
          return adminStatusCache.status.isAdmin;
        }
      }
    }

    // 3. Cache doesn't exist or too stale, fetch from API
    const response = await fetch('/api/check-admin-status', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // 4. API returned error - check client-side session first
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Client-side session exists but API returned error
        if (response.status === 401) {
          // Retry once after short delay (might be cookie sync issue)
          await new Promise(resolve => setTimeout(resolve, 500));
          const retryResponse = await fetch('/api/check-admin-status', {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            // Update cache and return
            adminStatusCache = {
              userId: user.id,
              status: {
                isAdmin: retryData.isAdmin === true,
                isSuperAdmin: retryData.isSuperAdmin === true,
                admin: retryData.admin || null,
              },
              timestamp: Date.now(),
            };
            return retryData.isAdmin === true;
          }
        }
        
        // Retry failed but client-side session exists - use expired cache if available
        if (adminStatusCache && adminStatusCache.userId === user.id) {
          return adminStatusCache.status.isAdmin;
        }
      }
      
      // No client-side session or no cache - really logged out
      adminStatusCache = null;
      return false;
    }

    const data = await response.json();
    
    // 5. API successful - update cache
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      adminStatusCache = {
        userId: user.id,
        status: {
          isAdmin: data.isAdmin === true,
          isSuperAdmin: data.isSuperAdmin === true,
          admin: data.admin || null,
        },
        timestamp: Date.now(),
      };
    }

    return data.isAdmin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    // Return cached data if available, even if expired
    const { data: { user } } = await supabase.auth.getUser();
    if (user && adminStatusCache && adminStatusCache.userId === user.id) {
      return adminStatusCache.status.isAdmin;
    }
    return false;
  }
}

/**
 * Check if current user is superadmin
 * Uses API route to bypass RLS policies
 * Implements caching to prevent multiple API calls
 */
export async function isSuperAdmin(forceRefresh = false): Promise<boolean> {
  try {
    // 1. Check cache first - use fresh cache if available
    if (!forceRefresh && adminStatusCache) {
      const cacheAge = Date.now() - adminStatusCache.timestamp;
      if (cacheAge < ADMIN_CACHE_DURATION) {
        return adminStatusCache.status.isSuperAdmin;
      }
      
      // 2. Cache expired but still usable - check client-side session first
      const { data: { user } } = await supabase.auth.getUser();
      if (user && adminStatusCache.userId === user.id) {
        // Client-side session exists, use expired cache
        if (cacheAge < ADMIN_CACHE_STALE_DURATION) {
          return adminStatusCache.status.isSuperAdmin;
        }
      }
    }

    // 3. Cache doesn't exist or too stale, fetch from API
    const response = await fetch('/api/check-admin-status', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // 4. API returned error - check client-side session first
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        if (response.status === 401) {
          // Retry once after short delay
          await new Promise(resolve => setTimeout(resolve, 500));
          const retryResponse = await fetch('/api/check-admin-status', {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            adminStatusCache = {
              userId: user.id,
              status: {
                isAdmin: retryData.isAdmin === true,
                isSuperAdmin: retryData.isSuperAdmin === true,
                admin: retryData.admin || null,
              },
              timestamp: Date.now(),
            };
            return retryData.isSuperAdmin === true;
          }
        }
        
        // Retry failed but client-side session exists - use expired cache if available
        if (adminStatusCache && adminStatusCache.userId === user.id) {
          return adminStatusCache.status.isSuperAdmin;
        }
      }
      
      // No client-side session or no cache - really logged out
      adminStatusCache = null;
      return false;
    }

    const data = await response.json();
    
    // 5. API successful - update cache
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      adminStatusCache = {
        userId: user.id,
        status: {
          isAdmin: data.isAdmin === true,
          isSuperAdmin: data.isSuperAdmin === true,
          admin: data.admin || null,
        },
        timestamp: Date.now(),
      };
    }

    return data.isSuperAdmin === true;
  } catch (error) {
    console.error('Error checking superadmin status:', error);
    // Return cached data if available, even if expired
    const { data: { user } } = await supabase.auth.getUser();
    if (user && adminStatusCache && adminStatusCache.userId === user.id) {
      return adminStatusCache.status.isSuperAdmin;
    }
    return false;
  }
}

/**
 * Get current admin user info
 * Uses API route to bypass RLS policies
 * Implements caching to prevent multiple API calls
 */
export async function getCurrentAdmin(forceRefresh = false): Promise<AdminUser | null> {
  try {
    // 1. Check cache first - use fresh cache if available
    if (!forceRefresh && adminStatusCache) {
      const cacheAge = Date.now() - adminStatusCache.timestamp;
      if (cacheAge < ADMIN_CACHE_DURATION) {
        return adminStatusCache.status.admin;
      }
      
      // 2. Cache expired but still usable - check client-side session first
      const { data: { user } } = await supabase.auth.getUser();
      if (user && adminStatusCache.userId === user.id) {
        // Client-side session exists, use expired cache
        if (cacheAge < ADMIN_CACHE_STALE_DURATION) {
          return adminStatusCache.status.admin;
        }
      }
    }

    // 3. Cache doesn't exist or too stale, fetch from API
    const response = await fetch('/api/check-admin-status', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // 4. API returned error - check client-side session first
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        if (response.status === 401) {
          // Retry once after short delay
          await new Promise(resolve => setTimeout(resolve, 500));
          const retryResponse = await fetch('/api/check-admin-status', {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            adminStatusCache = {
              userId: user.id,
              status: {
                isAdmin: retryData.isAdmin === true,
                isSuperAdmin: retryData.isSuperAdmin === true,
                admin: retryData.admin || null,
              },
              timestamp: Date.now(),
            };
            return retryData.admin || null;
          }
        }
        
        // Retry failed but client-side session exists - use expired cache if available
        if (adminStatusCache && adminStatusCache.userId === user.id) {
          return adminStatusCache.status.admin;
        }
      }
      
      // No client-side session or no cache - really logged out
      adminStatusCache = null;
      return null;
    }

    const data = await response.json();
    
    // 5. API successful - update cache
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      adminStatusCache = {
        userId: user.id,
        status: {
          isAdmin: data.isAdmin === true,
          isSuperAdmin: data.isSuperAdmin === true,
          admin: data.admin || null,
        },
        timestamp: Date.now(),
      };
    }

    return data.admin || null;
  } catch (error) {
    console.error('Error getting admin user:', error);
    // Return cached data if available, even if expired
    const { data: { user } } = await supabase.auth.getUser();
    if (user && adminStatusCache && adminStatusCache.userId === user.id) {
      return adminStatusCache.status.admin;
    }
    return null;
  }
}

// Cache for assigned case IDs
let assignedCaseIdsCache: { adminId: string; caseIds: string[]; timestamp: number } | null = null;
const ASSIGNED_CASE_IDS_CACHE_DURATION = 60000; // 60 seconds cache

/**
 * Get case IDs assigned to current admin
 * Returns empty array for superadmin (they see all cases)
 * Admin, lawyer, and acente only see their assigned cases
 * Uses cache to prevent multiple queries
 */
export async function getAssignedCaseIds(forceRefresh = false): Promise<string[]> {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return [];

    // Superadmin sees all cases
    if (admin.role === 'superadmin') {
      return []; // Empty array means "all cases"
    }

    // Check cache first
    if (!forceRefresh && assignedCaseIdsCache && assignedCaseIdsCache.adminId === admin.id) {
      const cacheAge = Date.now() - assignedCaseIdsCache.timestamp;
      if (cacheAge < ASSIGNED_CASE_IDS_CACHE_DURATION) {
        return assignedCaseIdsCache.caseIds;
      }
    }

    // Admin, lawyer, and acente only see their assigned cases
    const { data, error } = await supabase
      .from('case_admins')
      .select('case_id')
      .eq('admin_id', admin.id);

    if (error) {
      console.error('Error getting assigned cases:', error);
      // Return cached data if available, even if expired
      if (assignedCaseIdsCache && assignedCaseIdsCache.adminId === admin.id) {
        return assignedCaseIdsCache.caseIds;
      }
      return [];
    }

    const caseIds = (data || []).map((item: { case_id: string }) => item.case_id);
    
    // Update cache
    assignedCaseIdsCache = {
      adminId: admin.id,
      caseIds,
      timestamp: Date.now(),
    };

    return caseIds;
  } catch (error) {
    console.error('Error getting assigned case IDs:', error);
    // Return cached data if available, even if expired
    if (assignedCaseIdsCache) {
      return assignedCaseIdsCache.caseIds;
    }
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
export async function getAllAdmins(): Promise<Array<{ id: string; name: string; email: string; role: string; assignedCaseCount?: number }>> {
  try {
    const response = await fetch('/api/get-admins', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
      credentials: 'include',
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
 * Uses API route to handle RLS bypass and user_auth creation
 */
export async function loginAsAdmin(email: string, password: string) {
  try {
    // Only run on client-side
    if (typeof window === 'undefined') {
      throw new Error('Login can only be performed on client-side');
    }

    // Clear cache on login
    clearAdminStatusCache();

    const response = await fetch('/api/login-admin', {
      method: 'POST',
      credentials: 'include', // Important: Include cookies
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Giriş başarısız. Lütfen tekrar deneyin.');
    }

    // Set session on client side if provided
    // Only set if supabase client is available
    if (data.session && supabase && typeof supabase.auth !== 'undefined') {
      try {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        if (sessionError) {
          console.error('Error setting session:', sessionError);
          // Don't throw, session might already be set via cookies
        }
      } catch (sessionErr) {
        console.error('Error in setSession:', sessionErr);
        // Don't throw, session might already be set via cookies
      }
    }

    // Wait for cookies to be set
    await new Promise(resolve => setTimeout(resolve, 500));

    // Cache'i manuel set et (force refresh yerine)
    if (data.admin) {
      adminStatusCache = {
        userId: data.admin.id,
        status: {
          isAdmin: true,
          isSuperAdmin: data.admin.role === 'superadmin',
          admin: data.admin,
        },
        timestamp: Date.now(),
      };
      return { user: data.user, admin: data.admin };
    }

    // Eğer admin bilgisi yoksa, retry dene (cache kullanarak)
    let retries = 3;
    while (retries > 0) {
      const statusData = await getCurrentAdmin(false); // Cache kullan
      if (statusData) {
        return { user: data.user, admin: statusData };
      }
      retries--;
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    throw new Error('Admin yetkisi doğrulanamadı. Lütfen sayfayı yenileyin.');
  } catch (error: any) {
    console.error('Admin login error:', error);
    throw error;
  }
}
