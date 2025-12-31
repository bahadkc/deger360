import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dosyaTakipNumarasi, password } = body;

    if (!dosyaTakipNumarasi || !password) {
      return NextResponse.json(
        { error: 'Dosya takip numarası ve şifre gereklidir' },
        { status: 400 }
      );
    }

    // Create admin client with service role key to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Find customer by dosya_takip_numarasi (bypassing RLS with service role)
    const { data: customerData, error: customerError } = await supabaseAdmin
      .from('customers')
      .select('id, email, dosya_takip_numarasi')
      .eq('dosya_takip_numarasi', dosyaTakipNumarasi)
      .single();

    if (customerError || !customerData) {
      return NextResponse.json(
        { error: 'Dosya takip numarası bulunamadı. Lütfen numaranızı kontrol edin.' },
        { status: 404 }
      );
    }

    // Create a regular client for authentication (we'll return session to client)
    const { createClient: createClientSSR } = await import('@supabase/ssr');
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();

    const supabaseClient = createClientSSR(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
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
    const email = (customerData as { email: string }).email;
    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('Login error details:', authError);
      if (authError.message?.includes('Invalid login credentials') || authError.message?.includes('Invalid credentials')) {
        return NextResponse.json(
          { error: 'Şifre hatalı. Lütfen tekrar deneyin.' },
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

    // Ensure user_auth record exists after login
    if (authData.user) {
      const { data: existingAuth, error: checkError } = await supabaseAdmin
        .from('user_auth')
        .select('id')
        .eq('id', authData.user.id)
        .single();

      // If user_auth doesn't exist, create it
      if (checkError || !existingAuth) {
        const { error: insertError } = await supabaseAdmin
          .from('user_auth')
          .insert({
            id: authData.user.id,
            customer_id: (customerData as { id: string }).id,
            role: 'customer',
          });

        if (insertError) {
          console.error('Error creating user_auth record:', insertError);
          // Don't fail login, but log the error
        }
      } else {
        // Update customer_id if it's missing
        const { error: updateError } = await supabaseAdmin
          .from('user_auth')
          .update({ customer_id: (customerData as { id: string }).id })
          .eq('id', authData.user.id);

        if (updateError) {
          console.error('Error updating user_auth record:', updateError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      user: authData.user,
      session: authData.session,
    });
  } catch (error: any) {
    console.error('Error in portal login:', error);
    return NextResponse.json(
      { error: error.message || 'Giriş başarısız. Lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }
}

