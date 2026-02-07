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
    const caseId = searchParams.get('caseId');

    if (!caseId) {
      return NextResponse.json(
        { error: 'Case ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated user from session
    const cookieStore = await cookies();
    const requestCookies = request.cookies.getAll();
    
    const allCookiesMap = new Map<string, { name: string; value: string }>();
    cookieStore.getAll().forEach(c => {
      allCookiesMap.set(c.name, { name: c.name, value: c.value });
    });
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

    // Get user_auth to find customer_id
    const { data: userAuth, error: authError } = await supabaseAdmin
      .from('user_auth')
      .select('customer_id')
      .eq('id', user.id)
      .maybeSingle();

    if (authError || !userAuth || !userAuth.customer_id) {
      return NextResponse.json(
        { error: 'Customer account not found' },
        { status: 403 }
      );
    }

    // Verify user has access to this case (must be the customer)
    const { data: caseData, error: caseError } = await supabaseAdmin
      .from('cases')
      .select('customer_id')
      .eq('id', caseId)
      .eq('customer_id', userAuth.customer_id)
      .maybeSingle();

    if (caseError || !caseData) {
      return NextResponse.json(
        { error: 'Access denied. This case does not belong to you.' },
        { status: 403 }
      );
    }

    // Fetch skipped document categories
    const { data, error } = await supabaseAdmin
      .from('skipped_documents')
      .select('category')
      .eq('case_id', caseId);

    if (error) {
      console.error('Error fetching skipped documents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch skipped documents' },
        { status: 500 }
      );
    }

    const categories = (data || []).map((item: { category: string }) => item.category);

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error('Error in get-skipped-documents-customer API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
