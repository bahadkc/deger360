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
    const role = searchParams.get('role');
    const period = searchParams.get('period') || 'all_time';

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

    const userRole = (userAuth as { role: string }).role;
    const isSuperAdmin = userRole === 'superadmin';

    // Get assigned case IDs if not superadmin
    let assignedCaseIds: string[] = [];
    if (!isSuperAdmin) {
      const { data: caseAdmins, error: caseAdminsError } = await supabaseAdmin
        .from('case_admins')
        .select('case_id')
        .eq('admin_id', user.id);

      if (caseAdminsError) {
        console.error('Error fetching assigned cases:', caseAdminsError);
        return NextResponse.json(
          { error: 'Failed to fetch assigned cases' },
          { status: 500 }
        );
      }

      assignedCaseIds = (caseAdmins || []).map((ca: any) => ca.case_id);
    }

    // Load cases based on role
    let casesQuery = supabaseAdmin
      .from('cases')
      .select(`
        id,
        case_number,
        status,
        board_stage,
        assigned_lawyer,
        created_at,
        start_date,
        updated_at,
        value_loss_amount,
        fault_rate,
        estimated_compensation,
        customers (
          id,
          full_name,
          dosya_takip_numarasi,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (!isSuperAdmin && assignedCaseIds.length > 0) {
      casesQuery = casesQuery.in('id', assignedCaseIds);
    } else if (!isSuperAdmin && assignedCaseIds.length === 0) {
      // No assigned cases, return empty data
      return NextResponse.json({
        cases: [],
        admins: [],
        caseAdmins: [],
        checklist: [],
      });
    } else if (isSuperAdmin) {
      // Superadmin: exclude sample customers
      casesQuery = casesQuery.eq('customers.is_sample', false);
    }

    const { data: casesData, error: casesError } = await casesQuery;

    if (casesError) {
      console.error('Error loading cases:', casesError);
      return NextResponse.json(
        { error: 'Failed to load cases' },
        { status: 500 }
      );
    }

    // Load admins, lawyers, acentes (only for superadmin)
    let adminsData: any[] = [];
    if (isSuperAdmin) {
      const { data: admins, error: adminsError } = await supabaseAdmin
        .from('user_auth')
        .select(`
          id,
          name,
          role
        `)
        .in('role', ['admin', 'lawyer', 'acente']);

      if (adminsError) {
        console.error('Error loading admins:', adminsError);
      } else {
        adminsData = admins || [];
      }
    }

    // Load case assignments (only for superadmin)
    let caseAdminsData: any[] = [];
    if (isSuperAdmin) {
      const { data: caseAdmins, error: caseAdminsError } = await supabaseAdmin
        .from('case_admins')
        .select('*');

      if (caseAdminsError) {
        console.error('Error loading case_admins:', caseAdminsError);
      } else {
        caseAdminsData = caseAdmins || [];
      }
    }

    // Load checklist items
    const caseIds = (casesData || []).map((c: any) => c.id);
    let checklistData: any[] = [];
    if (caseIds.length > 0) {
      const { data: checklist, error: checklistError } = await supabaseAdmin
        .from('admin_checklist')
        .select('case_id, task_key, completed')
        .in('case_id', caseIds);

      if (checklistError) {
        console.error('Error loading checklist:', checklistError);
      } else {
        checklistData = checklist || [];
      }
    }

    // Load documents (specifically for acente report - dekont documents)
    let documentsData: any[] = [];
    if (caseIds.length > 0) {
      const { data: documents, error: documentsError } = await supabaseAdmin
        .from('documents')
        .select('id, case_id, name, file_path, category, uploaded_at')
        .in('case_id', caseIds)
        .eq('category', 'acenteye_atilan_dekont');

      if (documentsError) {
        console.error('Error loading documents:', documentsError);
      } else {
        documentsData = documents || [];
      }
    }

    return NextResponse.json({
      cases: casesData || [],
      admins: adminsData,
      caseAdmins: caseAdminsData,
      checklist: checklistData,
      documents: documentsData,
    });
  } catch (error: any) {
    console.error('Error in get-report-data API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

