import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-posta ve şifre gereklidir' },
        { status: 400 }
      );
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Create a regular client for authentication
    const { createServerClient } = await import('@supabase/ssr');
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();

    const supabaseClient = createServerClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    });

    // Login with email and password
    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      console.error('Admin login error details:', authError);
      if (authError.message?.includes('Invalid login credentials') || authError.message?.includes('Invalid credentials')) {
        return NextResponse.json(
          { error: 'E-posta veya şifre hatalı. Lütfen tekrar deneyin.' },
          { status: 401 }
        );
      }
      if (authError.message?.includes('No API key found')) {
        return NextResponse.json(
          { error: 'Sistem hatası: API anahtarı bulunamadı. Lütfen sayfayı yenileyin ve tekrar deneyin.' },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: authError.message || 'Giriş başarısız. Lütfen tekrar deneyin.' },
        { status: 401 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Giriş başarısız. Lütfen tekrar deneyin.' },
        { status: 401 }
      );
    }

    // Check if user_auth record exists
    const { data: userAuth, error: userAuthError } = await supabaseAdmin
      .from('user_auth')
      .select('role, customer_id, name')
      .eq('id', authData.user.id)
      .single();

    // If user_auth doesn't exist, check if this email belongs to an admin
    // We'll create user_auth record only if email matches admin pattern or if explicitly an admin
    if (userAuthError || !userAuth) {
      // Check if user exists in auth.users (they just logged in successfully)
      // For security, we'll only auto-create admin records if email domain matches admin pattern
      // Otherwise, return error asking to create admin record manually
      const emailDomain = email.split('@')[1]?.toLowerCase();
      const isAdminEmail = emailDomain === 'deger360.net' || emailDomain === 'deger360.com' || email.includes('admin');

      if (!isAdminEmail) {
        await supabaseClient.auth.signOut();
        return NextResponse.json(
          { error: 'Bu hesap admin yetkisine sahip değil. Lütfen admin panelinden admin hesabı oluşturun.' },
          { status: 403 }
        );
      }

      // Auto-create admin user_auth record
      const { error: insertError } = await supabaseAdmin
        .from('user_auth')
        .insert({
          id: authData.user.id,
          customer_id: null,
          role: 'admin', // Default to admin, can be changed later
          name: email.split('@')[0], // Use email prefix as name
        });

      if (insertError) {
        console.error('Error creating user_auth record:', insertError);
        await supabaseClient.auth.signOut();
        return NextResponse.json(
          { error: 'Admin kaydı oluşturulamadı. Lütfen sistem yöneticisine başvurun.' },
          { status: 500 }
        );
      }

      // Supabase SSR automatically sets cookies via setAll callback
      // Just return the response - cookies are already set by createServerClient
      return NextResponse.json(
        {
          success: true,
          user: authData.user,
          session: authData.session,
          admin: {
            id: authData.user.id,
            email: authData.user.email || '',
            role: 'admin',
            customer_id: null,
            name: email.split('@')[0],
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Verify admin role
    const role = (userAuth as { role: string }).role;
    if (role !== 'superadmin' && role !== 'admin' && role !== 'lawyer' && role !== 'acente') {
      await supabaseClient.auth.signOut();
      return NextResponse.json(
        { error: 'Bu hesap admin yetkisine sahip değil' },
        { status: 403 }
      );
    }

    // Supabase SSR automatically sets cookies via setAll callback
    // Just return the response - cookies are already set by createServerClient
    return NextResponse.json(
      {
        success: true,
        user: authData.user,
        session: authData.session,
        admin: {
          id: authData.user.id,
          email: authData.user.email || '',
          role: role as 'superadmin' | 'admin' | 'lawyer' | 'acente',
          customer_id: (userAuth as { customer_id: string | null }).customer_id,
          name: (userAuth as { name: string | null }).name || null,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in admin login:', error);
    return NextResponse.json(
      { error: error.message || 'Giriş başarısız. Lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }
}

