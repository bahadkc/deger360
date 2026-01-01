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

// Get current user's cases with customer data
export async function getCurrentUserCases(): Promise<{ data: any[] | null; error: Error | null }> {
  try {
    // 1. Current user'ı al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('getCurrentUserCases: No user found', userError);
      return { data: null, error: userError || new Error('Not authenticated') };
    }

    console.log('getCurrentUserCases: User found:', user.id);

    // 2. user_auth'dan customer_id ve role al
    const { data: userAuth, error: userAuthError } = await supabase
      .from('user_auth')
      .select('customer_id, role, name')
      .eq('id', user.id)
      .maybeSingle();

    if (userAuthError) {
      console.error('getCurrentUserCases: Error fetching user_auth:', userAuthError);
      return { data: null, error: userAuthError };
    }

    if (!userAuth) {
      console.error('getCurrentUserCases: No user_auth record found');
      return { data: null, error: new Error('User auth not found') };
    }

    // 3. Role'e göre işlem yap
    if (userAuth.role === 'customer') {
      // Customer_id kontrolü
      if (!userAuth.customer_id) {
        console.error('getCurrentUserCases: No customer_id found for user');
        return { 
          data: null, 
          error: new Error('Hesabınız henüz müşteri kaydına bağlanmamış. Lütfen destek ekibiyle iletişime geçin.') 
        };
      }

      // Cases'i çek
      const { data: cases, error: casesError } = await supabase
        .from('cases')
        .select(`
          *,
          customers (*)
        `)
        .eq('customer_id', userAuth.customer_id)
        .order('created_at', { ascending: false });

      if (casesError) {
        console.error('getCurrentUserCases: Error fetching cases:', casesError);
        return { data: null, error: casesError };
      }

      return { data: cases || [], error: null };
    }

    // Admin/Avukat/Acente için farklı logic
    if (userAuth.role === 'superadmin' || userAuth.role === 'admin' || userAuth.role === 'lawyer' || userAuth.role === 'acente') {
      // Bu roller için tüm dosyaları veya sadece kendilerine atananları getir
      const { data: cases, error: casesError } = await supabase
        .from('cases')
        .select(`
          *,
          customers (*)
        `)
        .order('created_at', { ascending: false });

      if (casesError) {
        console.error('getCurrentUserCases: Error fetching cases:', casesError);
        return { data: null, error: casesError };
      }

      return { data: cases || [], error: null };
    }

    // Geçersiz role
    return { data: null, error: new Error('Invalid user role') };

  } catch (error) {
    console.error('getCurrentUserCases: Unexpected error:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unexpected error occurred') 
    };
  }
}
