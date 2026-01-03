import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const adminId = searchParams.get('adminId');

    if (!adminId) {
      return NextResponse.json(
        { error: 'Admin ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated user from session
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

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create admin client with service role key to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get user_auth to check role (must be superadmin to view other admins' assignments)
    const { data: userAuth, error: authError } = await supabaseAdmin
      .from('user_auth')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (authError || !userAuth) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const role = (userAuth as { role: string }).role;
    const isSuperAdmin = role === 'superadmin';

    // Only superadmin can view other admins' assignments
    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: 'Only superadmin can view admin assignments' },
        { status: 403 }
      );
    }

    // Get assigned cases for this admin
    const { data: caseAdmins, error: caseAdminsError } = await supabaseAdmin
      .from('case_admins')
      .select('case_id')
      .eq('admin_id', adminId);

    if (caseAdminsError) {
      console.error('Error fetching case_admins:', caseAdminsError);
      return NextResponse.json(
        { error: 'Failed to fetch admin assignments' },
        { status: 500 }
      );
    }

    if (!caseAdmins || caseAdmins.length === 0) {
      return NextResponse.json({ customers: [] });
    }

    const caseIds = caseAdmins.map((ca: { case_id: string }) => ca.case_id);

    // Get cases with customer data
    const { data: cases, error: casesError } = await supabaseAdmin
      .from('cases')
      .select(`
        id,
        case_number,
        vehicle_plate,
        status,
        customers!inner(
          id,
          full_name,
          email,
          phone,
          dosya_takip_numarasi
        )
      `)
      .in('id', caseIds);

    if (casesError) {
      console.error('Error fetching cases:', casesError);
      return NextResponse.json(
        { error: 'Failed to fetch cases' },
        { status: 500 }
      );
    }

    // Transform data to match expected format
    const customers = (cases || []).map((caseItem: any) => ({
      id: caseItem.customers?.id || '',
      full_name: caseItem.customers?.full_name || '',
      email: caseItem.customers?.email || '',
      phone: caseItem.customers?.phone || '',
      dosya_takip_numarasi: caseItem.customers?.dosya_takip_numarasi || '',
      case_id: caseItem.id,
      case_number: caseItem.case_number || '',
      vehicle_plate: caseItem.vehicle_plate || '',
      status: caseItem.status || 'active',
    }));

    return NextResponse.json({ customers });
  } catch (error: any) {
    console.error('Error in get-admin-assigned-customers API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

