import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { CHECKLIST_ITEMS } from '@/lib/checklist-sections';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const caseId = searchParams.get('caseId');

    if (!caseId) {
      return NextResponse.json(
        { error: 'Case ID is required' },
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

    // Check if user has access to this case
    if (!isSuperAdmin) {
      const { data: caseAdmin, error: caseAdminError } = await supabaseAdmin
        .from('case_admins')
        .select('case_id')
        .eq('case_id', caseId)
        .eq('admin_id', user.id)
        .maybeSingle();

      if (caseAdminError || !caseAdmin) {
        return NextResponse.json(
          { error: 'Access denied. This case is not assigned to you.' },
          { status: 403 }
        );
      }
    }

    // Fetch checklist items
    const { data, error } = await supabaseAdmin
      .from('admin_checklist')
      .select('*')
      .eq('case_id', caseId);

    if (error) {
      console.error('Error fetching checklist:', error);
      return NextResponse.json(
        { error: 'Failed to fetch checklist' },
        { status: 500 }
      );
    }

    // Get case data to check insurance_response
    const { data: caseData, error: caseError } = await supabaseAdmin
      .from('cases')
      .select('insurance_response')
      .eq('id', caseId)
      .single();

    // Merge with default checklist items
    const mergedChecklist = CHECKLIST_ITEMS.map((item) => {
      const existing = data?.find((c) => c.task_key === item.key);
      return existing || {
        id: '',
        task_key: item.key,
        title: item.title,
        completed: false,
        completed_at: null,
        completed_by: null,
      };
    });

    return NextResponse.json({ 
      checklist: mergedChecklist,
      insuranceResponse: caseData?.insurance_response || null
    });
  } catch (error: any) {
    console.error('Error in get-checklist API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

