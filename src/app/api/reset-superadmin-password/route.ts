import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const dynamic = 'force-dynamic';

/**
 * Reset superadmin password
 * This is a utility route to reset the superadmin password
 * Should be removed or secured in production
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre gereklidir' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır' },
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

    // Find user by email
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return NextResponse.json(
        { error: 'Kullanıcılar listelenemedi' },
        { status: 500 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = users.users.find((u) => u.email?.toLowerCase() === normalizedEmail);

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı. Önce Supabase Authentication\'da kullanıcı oluşturun.' },
        { status: 404 }
      );
    }

    // Check if user is superadmin in user_auth
    const { data: userAuth, error: userAuthError } = await supabaseAdmin
      .from('user_auth')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userAuthError || !userAuth) {
      return NextResponse.json(
        { error: 'Kullanıcı user_auth tablosunda bulunamadı veya superadmin değil.' },
        { status: 404 }
      );
    }

    if (userAuth.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Bu kullanıcı superadmin değil.' },
        { status: 403 }
      );
    }

    // Update password
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: password,
      email_confirm: true, // Ensure email is confirmed
    });

    if (updateError) {
      console.error('Password update error:', updateError);
      return NextResponse.json(
        { error: `Şifre güncellenemedi: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Superadmin şifresi başarıyla güncellendi',
      userId: user.id,
      email: user.email,
    });
  } catch (error: any) {
    console.error('Error resetting superadmin password:', error);
    return NextResponse.json(
      { error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}

