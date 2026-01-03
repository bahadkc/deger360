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

    // Also get cookies from request headers (for better compatibility)
    const requestCookies = request.cookies.getAll();
    
    // Merge cookies from both sources
    const allCookiesMap = new Map<string, { name: string; value: string }>();
    
    // Add cookies from cookieStore
    cookieStore.getAll().forEach(c => {
      allCookiesMap.set(c.name, { name: c.name, value: c.value });
    });
    
    // Add cookies from request (override if exists)
    requestCookies.forEach(c => {
      allCookiesMap.set(c.name, { name: c.name, value: c.value });
    });
    
    const allCookies = Array.from(allCookiesMap.values());

    // Store cookies to be set
    const cookiesToSet: Array<{ name: string; value: string; options: any }> = [];

    const supabaseClient = createServerClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        getAll() {
          return allCookies;
        },
        setAll(cookiesToSetArray) {
          cookiesToSetArray.forEach(({ name, value, options }) => {
            // Ensure cookies work in production (Vercel)
            const cookieOptions = {
              ...options,
              // Ensure secure cookies in production
              secure: process.env.NODE_ENV === 'production' || process.env.VERCEL === '1',
              // SameSite for cross-site requests
              sameSite: 'lax' as const,
              // Path should be root for all cookies
              path: '/',
              // HttpOnly for security (Supabase auth cookies should be httpOnly)
              httpOnly: options?.httpOnly !== false,
              // Max age from options or default
              maxAge: options?.maxAge || 60 * 60 * 24 * 7, // 7 days default
            };
            cookieStore.set(name, value, cookieOptions);
            // Store cookies to be set in response
            cookiesToSet.push({ name, value, options: cookieOptions });
          });
        },
      },
    });

    // Trim email and normalize
    const normalizedEmail = email.trim().toLowerCase();
    
    // Login with email and password
    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (authError) {
      console.error('Admin login error details:', {
        error: authError,
        email: normalizedEmail,
        errorMessage: authError.message,
        errorCode: authError.status,
      });
      
      // More specific error messages
      if (authError.message?.includes('Invalid login credentials') || 
          authError.message?.includes('Invalid credentials') ||
          authError.message?.includes('Email not confirmed') ||
          authError.status === 400) {
        return NextResponse.json(
          { error: 'E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol edip tekrar deneyin.' },
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
        // Don't sign out - just return error
        // Session might still be valid for other purposes
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
        // Don't sign out - user might want to retry
        return NextResponse.json(
          { error: 'Admin kaydı oluşturulamadı. Lütfen sistem yöneticisine başvurun.' },
          { status: 500 }
        );
      }

      // Create response with cookies
      const successResponse = NextResponse.json(
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

      // Set cookies in response
      cookiesToSet.forEach(({ name, value, options }) => {
        successResponse.cookies.set(name, value, options);
      });

      return successResponse;
    }

    // Verify admin role
    const role = (userAuth as { role: string }).role;
    if (role !== 'superadmin' && role !== 'admin' && role !== 'lawyer' && role !== 'acente') {
      // Don't sign out - just return error
      // User might have valid session for other purposes
      return NextResponse.json(
        { error: 'Bu hesap admin yetkisine sahip değil' },
        { status: 403 }
      );
    }

    // Create response with cookies
    const successResponse = NextResponse.json(
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

    // Set cookies in response
    cookiesToSet.forEach(({ name, value, options }) => {
      successResponse.cookies.set(name, value, options);
    });

    return successResponse;
  } catch (error: any) {
    console.error('Error in admin login:', error);
    return NextResponse.json(
      { error: error.message || 'Giriş başarısız. Lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }
}

