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

    // Get authenticated user from session
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
    
    const supabaseClient = createServerClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        getAll() {
          return allCookies;
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get current user's role
    const { data: currentUserAuth, error: currentUserAuthError } = await supabaseAdmin
      .from('user_auth')
      .select('role')
      .eq('id', user.id)
      .single();

    if (currentUserAuthError || !currentUserAuth) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const currentUserRole = (currentUserAuth as { role: string }).role;

    // Only superadmin can delete admins
    if (currentUserRole !== 'superadmin') {
      return NextResponse.json(
        { success: false, error: 'Sadece superadmin admin silebilir' },
        { status: 403 }
      );
    }

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

    // Prevent deleting superadmin - ABSOLUTE PROTECTION
    if (userAuth.role === 'superadmin') {
      return NextResponse.json(
        { success: false, error: 'Superadmin hesabı asla silinemez' },
        { status: 403 }
      );
    }

    // Prevent deleting admin accounts that are not superadmin (extra protection)
    // Only allow deletion of admin, lawyer, acente roles
    const allowedRolesToDelete = ['admin', 'lawyer', 'acente'];
    if (!allowedRolesToDelete.includes(userAuth.role)) {
      return NextResponse.json(
        { success: false, error: 'Bu hesap silinemez' },
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

