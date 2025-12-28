import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('id');

    if (!adminId) {
      return NextResponse.json(
        { success: false, error: 'Admin ID gerekli' },
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

    // Check if admin exists and get role
    const { data: userAuth, error: userAuthError } = await supabaseAdmin
      .from('user_auth')
      .select('id, role')
      .eq('id', adminId)
      .single();

    if (userAuthError || !userAuth) {
      return NextResponse.json(
        { success: false, error: 'Admin bulunamadı' },
        { status: 404 }
      );
    }

    // Prevent deleting superadmin
    if (userAuth.role === 'superadmin') {
      return NextResponse.json(
        { success: false, error: 'Superadmin silinemez' },
        { status: 403 }
      );
    }

    // Delete case_admins assignments first (cascade should handle this, but being explicit)
    const { error: caseAdminsError } = await supabaseAdmin
      .from('case_admins')
      .delete()
      .eq('admin_id', adminId);

    if (caseAdminsError) {
      console.error('Error deleting case_admins:', caseAdminsError);
      // Continue anyway
    }

    // Delete user_auth record
    const { error: userAuthDeleteError } = await supabaseAdmin
      .from('user_auth')
      .delete()
      .eq('id', adminId);

    if (userAuthDeleteError) throw userAuthDeleteError;

    // Delete auth user
    try {
      await supabaseAdmin.auth.admin.deleteUser(adminId);
    } catch (authError) {
      // Log but don't fail - user_auth is already deleted
      console.error('Error deleting auth user:', authError);
    }

    return NextResponse.json({
      success: true,
      message: 'Admin başarıyla silindi',
    });
  } catch (error: any) {
    console.error('Error deleting admin:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}

