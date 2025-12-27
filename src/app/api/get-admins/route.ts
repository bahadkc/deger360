import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get all admin users from user_auth
    const { data: userAuthData, error: userAuthError } = await supabaseAdmin
      .from('user_auth')
      .select('id, role, name')
      .in('role', ['superadmin', 'admin', 'lawyer', 'acente']);

    if (userAuthError) {
      console.error('Error getting user_auth:', userAuthError);
      return NextResponse.json({ error: 'Failed to get admins' }, { status: 500 });
    }

    // Get emails from auth.users using admin client
    const adminIds = (userAuthData || []).map((item) => item.id);
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      console.error('Error getting auth users:', authError);
      return NextResponse.json({ error: 'Failed to get admin emails' }, { status: 500 });
    }

    // Map admin IDs to emails and names
    const admins = (userAuthData || []).map((admin) => {
      const authUser = authUsers?.users.find((u) => u.id === admin.id);
      return {
        id: admin.id,
        name: admin.name || authUser?.email || 'Unknown',
        email: authUser?.email || 'Unknown',
        role: admin.role,
      };
    });

    return NextResponse.json({ admins });
  } catch (error: any) {
    console.error('Error in get-admins API:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
