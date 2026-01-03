import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const dynamic = 'force-dynamic';

/**
 * Create superadmin user
 * This is a utility route to create/update superadmin
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

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

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return NextResponse.json(
        { error: 'Kullanıcılar listelenemedi' },
        { status: 500 }
      );
    }

    let user = users.users.find((u) => u.email?.toLowerCase() === normalizedEmail);
    let userId: string;

    if (user) {
      // User exists, update password and ensure email is confirmed
      userId = user.id;
      const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: password,
        email_confirm: true,
      });

      if (updateError) {
        console.error('Password update error:', updateError);
        return NextResponse.json(
          { error: `Şifre güncellenemedi: ${updateError.message}` },
          { status: 500 }
        );
      }
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password: password,
        email_confirm: true,
      });

      if (createError) {
        console.error('Error creating user:', createError);
        return NextResponse.json(
          { error: `Kullanıcı oluşturulamadı: ${createError.message}` },
          { status: 500 }
        );
      }

      if (!newUser.user) {
        return NextResponse.json(
          { error: 'Kullanıcı oluşturulamadı' },
          { status: 500 }
        );
      }

      userId = newUser.user.id;
    }

    // Check if user_auth record exists
    const { data: userAuth, error: userAuthError } = await supabaseAdmin
      .from('user_auth')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (userAuthError && userAuthError.code !== 'PGRST116') {
      console.error('Error checking user_auth:', userAuthError);
      return NextResponse.json(
        { error: 'user_auth kontrolü başarısız' },
        { status: 500 }
      );
    }

    if (userAuth) {
      // Update existing user_auth to superadmin
      const { error: updateAuthError } = await supabaseAdmin
        .from('user_auth')
        .update({
          role: 'superadmin',
          customer_id: null,
          name: name || email.split('@')[0],
        })
        .eq('id', userId);

      if (updateAuthError) {
        console.error('Error updating user_auth:', updateAuthError);
        return NextResponse.json(
          { error: `user_auth güncellenemedi: ${updateAuthError.message}` },
          { status: 500 }
        );
      }
    } else {
      // Create new user_auth record
      const { error: insertError } = await supabaseAdmin
        .from('user_auth')
        .insert({
          id: userId,
          customer_id: null,
          role: 'superadmin',
          name: name || email.split('@')[0],
        });

      if (insertError) {
        console.error('Error creating user_auth:', insertError);
        return NextResponse.json(
          { error: `user_auth oluşturulamadı: ${insertError.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Superadmin hesabı başarıyla oluşturuldu/güncellendi',
      userId: userId,
      email: normalizedEmail,
      role: 'superadmin',
    });
  } catch (error: any) {
    console.error('Error creating superadmin:', error);
    return NextResponse.json(
      { error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}

