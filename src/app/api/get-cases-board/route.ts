import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from session
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

    // Get user_auth to check role
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

    // Get assigned case IDs if not superadmin
    let assignedCaseIds: string[] | undefined = undefined;
    if (!isSuperAdmin) {
      const { data: caseAdmins, error: caseAdminsError } = await supabaseAdmin
        .from('case_admins')
        .select('case_id')
        .eq('admin_id', user.id);

      if (!caseAdminsError && caseAdmins && caseAdmins.length > 0) {
        assignedCaseIds = caseAdmins.map((ca: { case_id: string }) => ca.case_id);
      } else {
        // No assigned cases, return empty array
        return NextResponse.json({ cases: [] });
      }
    }

    // Build query - Every customer has a case, so we use inner join
    let query = supabaseAdmin
      .from('cases')
      .select(`
        id,
        case_number,
        board_stage,
        status,
        vehicle_plate,
        vehicle_brand_model,
        value_loss_amount,
        fault_rate,
        assigned_lawyer,
        created_at,
        customer:customers!inner(
          id,
          full_name,
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    // Filter by assigned cases if not superadmin
    if (!isSuperAdmin && assignedCaseIds && assignedCaseIds.length > 0) {
      query = query.in('id', assignedCaseIds);
    }
    // Superadmin: no filter needed, will see all cases

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching cases for board:', error);
      return NextResponse.json(
        { error: 'Failed to fetch cases' },
        { status: 500 }
      );
    }

    // Transform data to match expected format
    const transformed = (data || []).map((caseItem: any) => ({
      id: caseItem.id,
      case_number: caseItem.case_number,
      board_stage: caseItem.board_stage || 'basvuru_alindi',
      status: caseItem.status,
      vehicle_plate: caseItem.vehicle_plate,
      vehicle_brand_model: caseItem.vehicle_brand_model,
      value_loss_amount: caseItem.value_loss_amount,
      fault_rate: caseItem.fault_rate,
      assigned_lawyer: caseItem.assigned_lawyer,
      created_at: caseItem.created_at,
      customer: {
        id: caseItem.customer?.id || '',
        full_name: caseItem.customer?.full_name || '',
        phone: caseItem.customer?.phone || null,
        email: caseItem.customer?.email || '',
      },
    }));

    return NextResponse.json({ cases: transformed });
  } catch (error: any) {
    console.error('Error in get-cases-board API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

