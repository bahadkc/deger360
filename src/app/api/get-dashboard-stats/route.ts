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
        // No assigned cases, return empty stats
        return NextResponse.json({
          stats: {
            totalCases: 0,
            activeCases: 0,
            completedCases: 0,
          },
        });
      }
    }

    // Build query
    let casesQuery = supabaseAdmin
      .from('cases')
      .select('id, status, board_stage, customers!inner(is_sample)');

    // Filter by assigned cases if not superadmin
    if (!isSuperAdmin && assignedCaseIds && assignedCaseIds.length > 0) {
      casesQuery = casesQuery.in('id', assignedCaseIds);
    } else if (isSuperAdmin) {
      // Superadmin: exclude sample customers
      casesQuery = casesQuery.eq('customers.is_sample', false);
    }

    const { data: casesData, error: casesError } = await casesQuery;

    if (casesError) {
      console.error('Error fetching cases:', casesError);
      return NextResponse.json(
        { error: 'Failed to fetch cases' },
        { status: 500 }
      );
    }

    const cases = casesData || [];

    // Load checklist data for all cases
    const caseIds = cases.map((c: any) => c.id);
    const { data: checklistData } = await supabaseAdmin
      .from('admin_checklist')
      .select('case_id, task_key, completed')
      .in('case_id', caseIds.length > 0 ? caseIds : ['00000000-0000-0000-0000-000000000000']); // Dummy ID if no cases

    const checklistList = checklistData || [];

    // Get all checklist item keys from CHECKLIST_ITEMS
    // These are the keys that need to be completed for a case to be considered completed
    const allTaskKeys = [
      'ilk_gorusme_yapildi',
      'musteri_arac_bilgileri',
      'kaza_tespit_tutanagi',
      'arac_fotograflari',
      'ruhsat_fotokopisi',
      'kimlik_fotokopisi',
      'arac_incelendi',
      'deger_kaybi_hesaplandi',
      'eksper_raporu_alindi',
      'sigorta_basvurusu_yapildi',
      'sigorta_kabul_cevabi',
      'odeme_bekleniyor',
      'odeme_yapildi',
    ];

    // Helper function to check if a case is completed
    const checkCaseCompleted = (caseItem: any): boolean => {
      // If board_stage is 'tamamlandi', it's completed
      if (caseItem.board_stage === 'tamamlandi') {
        return true;
      }

      // Get checklist items for this case
      const caseChecklist = checklistList
        .filter((c: any) => c.case_id === caseItem.id)
        .map((c: any) => ({ task_key: c.task_key, completed: c.completed }));

      // Check if all checklist items are completed
      const completedTaskKeys = caseChecklist
        .filter((item: any) => item.completed)
        .map((item: any) => item.task_key);

      return allTaskKeys.every((key) => completedTaskKeys.includes(key));
    };

    const totalCases = cases.length;
    const completedCases = cases.filter((c: any) => checkCaseCompleted(c)).length;
    const activeCases = totalCases - completedCases;

    return NextResponse.json({
      stats: {
        totalCases,
        activeCases,
        completedCases,
      },
    });
  } catch (error: any) {
    console.error('Error in get-dashboard-stats API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

