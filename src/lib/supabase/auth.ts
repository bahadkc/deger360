import { supabase } from './client';

// Login with file tracking number (dosya takip numarası) and password
export async function loginWithCaseNumber(fileTrackingNumber: string, password: string) {
  // Dosya takip numarası ile müşteriyi bul
  const { data: customerData, error: customerError } = await supabase
    .from('customers')
    .select('id, email, dosya_takip_numarasi')
    .eq('dosya_takip_numarasi', fileTrackingNumber)
    .single();

  if (customerError || !customerData) {
    throw new Error('Dosya takip numarası bulunamadı. Lütfen numaranızı kontrol edin.');
  }

  // Email ile giriş yap (Supabase Auth hala email kullanıyor arka planda)
  const email = (customerData as { email: string }).email;
  
  // Ensure Supabase client is properly initialized
  if (!supabase) {
    throw new Error('Supabase client başlatılamadı. Lütfen sayfayı yenileyin.');
  }
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Login error details:', error);
    if (error.message?.includes('Invalid login credentials') || error.message?.includes('Invalid credentials')) {
      throw new Error('Şifre hatalı. Lütfen tekrar deneyin.');
    }
    if (error.message?.includes('No API key found')) {
      throw new Error('Sistem hatası: API anahtarı bulunamadı. Lütfen sayfayı yenileyin ve tekrar deneyin.');
    }
    throw new Error(error.message || 'Giriş başarısız. Lütfen tekrar deneyin.');
  }

  // Ensure user_auth record exists after login
  if (data.user) {
    const { data: existingAuth, error: checkError } = await (supabase as any)
      .from('user_auth')
      .select('id')
      .eq('id', data.user.id)
      .single();

    // If user_auth doesn't exist, create it
    if (checkError || !existingAuth) {
      const { error: insertError } = await (supabase as any)
        .from('user_auth')
        .insert({
          id: data.user.id,
          customer_id: (customerData as { id: string }).id,
          role: 'customer',
        });

      if (insertError) {
        console.error('Error creating user_auth record:', insertError);
        // Don't throw error, login was successful
      }
    } else {
      // Update customer_id if it's missing
      const { error: updateError } = await (supabase as any)
        .from('user_auth')
        .update({ customer_id: (customerData as { id: string }).id })
        .eq('id', data.user.id);

      if (updateError) {
        console.error('Error updating user_auth record:', updateError);
      }
    }
  }
  
  return data;
}

// Logout
export async function logout() {
  clearCasesCache(); // Clear cache on logout
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get current user
export async function getCurrentUser(): Promise<any> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

// Get current customer
export async function getCurrentCustomer(): Promise<any> {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await (supabase as any)
    .from('user_auth')
    .select('customer_id, customers(*)')
    .eq('id', user.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Cache for user cases to prevent multiple API calls
let casesCache: { userId: string; cases: any[]; timestamp: number } | null = null;
const CACHE_DURATION = 5000; // 5 seconds cache (reduced for real-time updates)

// Clear cache (called on logout)
export function clearCasesCache() {
  casesCache = null;
}

// Get current user's cases with customer data
// Uses API route to bypass RLS policies
// Implements caching to prevent multiple API calls
export async function getCurrentUserCases(forceRefresh = false): Promise<any[]> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log('getCurrentUserCases: No user found');
      return [];
    }

    // Check cache first
    if (!forceRefresh && casesCache && casesCache.userId === user.id) {
      const cacheAge = Date.now() - casesCache.timestamp;
      if (cacheAge < CACHE_DURATION) {
        console.log('getCurrentUserCases: Returning cached data');
        return casesCache.cases;
      }
    }

    console.log('getCurrentUserCases: Fetching from API, User:', user.id);

    // Use API route to bypass RLS
    const response = await fetch('/api/get-user-cases', {
      method: 'GET',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('getCurrentUserCases: API error:', errorData.error || response.statusText);
      // Return cached data if available, even if expired
      if (casesCache && casesCache.userId === user.id) {
        console.log('getCurrentUserCases: API error, returning stale cache');
        return casesCache.cases;
      }
      return [];
    }

    const data = await response.json();
    const cases = data.cases || [];

    // Update cache
    casesCache = {
      userId: user.id,
      cases,
      timestamp: Date.now(),
    };

    console.log('getCurrentUserCases: Cases found:', cases.length);
    return cases;
  } catch (error) {
    console.error('getCurrentUserCases: Unexpected error:', error);
    // Return cached data if available, even if expired
    try {
      const user = await getCurrentUser();
      if (casesCache && user && casesCache.userId === user.id) {
        console.log('getCurrentUserCases: Error, returning stale cache');
        return casesCache.cases;
      }
    } catch {
      // Ignore error in error handler
    }
    return [];
  }
}
