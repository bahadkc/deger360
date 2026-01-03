import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;

    if (!caseId) {
      return NextResponse.json(
        { error: 'Case ID is required' },
        { status: 400 }
      );
    }

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
            // Ensure cookies work in production (Vercel)
            const cookieOptions = {
              ...options,
              // Ensure secure cookies in production
              secure: process.env.NODE_ENV === 'production',
              // SameSite for cross-site requests
              sameSite: 'lax' as const,
              // Path should be root for all cookies
              path: '/',
            };
            cookieStore.set(name, value, cookieOptions);
          });
        },
      },
    });

    let { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    // If getUser fails, try to refresh the session
    if (userError || !user) {
      console.error('🍪 get-case - getUser error:', {
        message: userError?.message,
        status: userError?.status,
        name: userError?.name,
        cookieCount: allCookies.length,
      });

      // Try to get current session first
      const { data: { session: currentSession } } = await supabaseClient.auth.getSession();
      
      // If we have a session, try to refresh it
      if (currentSession) {
        const { data: { session }, error: refreshError } = await supabaseClient.auth.refreshSession();
        
        if (!refreshError && session) {
          // Retry getUser after refresh
          const retryResult = await supabaseClient.auth.getUser();
          user = retryResult.data.user;
          userError = retryResult.error;
        }
      }

      if (userError || !user) {
        console.error('🍪 Cookie var ama getUser başarısız - cookie format sorunu olabilir');
        return NextResponse.json(
          { error: 'Unauthorized - Session expired or invalid' },
          { status: 401 }
        );
      }
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
      // Check if case is assigned to this admin
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

    // Fetch case with customer data
    const { data, error } = await supabaseAdmin
      .from('cases')
      .select(`
        *,
        customers (*)
      `)
      .eq('id', caseId)
      .single();

    if (error) {
      console.error('Error fetching case:', error);
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ case: data });
  } catch (error: any) {
    console.error('Error in get-case API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

