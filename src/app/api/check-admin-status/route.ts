import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getCookieOptions } from '@/lib/utils/cookie-utils';

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
    
    // Cookie'leri toplamak için array
    const cookiesToSet: Array<{ name: string; value: string; options: any }> = [];
    
    const supabaseClient = createServerClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        getAll() {
          return allCookies;
        },
        setAll(cookiesToSetArray) {
          cookiesToSetArray.forEach(({ name, value, options }) => {
            // Use cookie utils to determine secure flag based on actual protocol
            const cookieOptions = getCookieOptions(
              { url: request.url, headers: request.headers },
              options
            );
            cookieStore.set(name, value, cookieOptions);
            // Store cookies to be set in response
            cookiesToSet.push({ name, value, options: cookieOptions });
          });
        },
      },
    });
    
    // Helper function to create response with cookies
    const createResponse = (data: any, status: number = 200) => {
      const response = NextResponse.json(data, { status });
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
      });
      return response;
    };

    let { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    // If getUser fails, try to refresh the session
    if (userError || !user) {
      console.error('check-admin-status - getUser error:', {
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
        return createResponse(
          { error: 'Unauthorized', isAdmin: false, admin: null },
          401
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
      .select('role, customer_id, name')
      .eq('id', user.id)
      .maybeSingle();

    if (authError || !userAuth) {
      return createResponse(
        { error: 'Admin access required', isAdmin: false, admin: null },
        403
      );
    }

    const role = (userAuth as { role: string }).role;
    const isAdmin = role === 'superadmin' || role === 'admin' || role === 'lawyer' || role === 'acente';
    const isSuperAdmin = role === 'superadmin';

    if (!isAdmin) {
      return createResponse(
        { error: 'Admin access required', isAdmin: false, admin: null },
        403
      );
    }

    return createResponse({
      isAdmin: true,
      isSuperAdmin,
      admin: {
        id: user.id,
        email: user.email || '',
        role: role as 'superadmin' | 'admin' | 'lawyer' | 'acente',
        customer_id: (userAuth as { customer_id: string | null }).customer_id,
        name: (userAuth as { name: string | null }).name || null,
      },
    });
  } catch (error: any) {
    console.error('Error in check-admin-status:', error);
    // In catch block, cookies might not be available, so use regular NextResponse
    return NextResponse.json(
      { error: 'Internal server error', isAdmin: false, admin: null },
      { status: 500 }
    );
  }
}

