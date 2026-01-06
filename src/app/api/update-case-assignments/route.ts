import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getCookieOptions } from '@/lib/utils/cookie-utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { caseId, adminIds } = body;

    if (!caseId || !Array.isArray(adminIds)) {
      return NextResponse.json(
        { error: 'Case ID and admin IDs array are required' },
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
      console.error('🍪 update-case-assignments - getUser error:', {
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
        return createResponse(
          { error: 'Unauthorized - Session expired or invalid' },
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
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (authError || !userAuth) {
      return createResponse(
        { error: 'Admin access required' },
        403
      );
    }

    const role = (userAuth as { role: string }).role;
    const isSuperAdmin = role === 'superadmin';

    // Only superadmin can assign admins
    if (!isSuperAdmin) {
      return createResponse(
        { error: 'Only superadmin can assign admins to cases' },
        403
      );
    }

    // Delete existing assignments
    const { error: deleteError } = await supabaseAdmin
      .from('case_admins')
      .delete()
      .eq('case_id', caseId);

    if (deleteError) {
      console.error('Error deleting existing admin assignments:', deleteError);
      return createResponse(
        { error: 'Failed to delete existing assignments' },
        500
      );
    }

    // Insert new assignments
    if (adminIds.length > 0) {
      const assignments = adminIds.map((adminId: string) => ({
        case_id: caseId,
        admin_id: adminId,
      }));

      const { error: insertError } = await supabaseAdmin
        .from('case_admins')
        .insert(assignments);

      if (insertError) {
        console.error('Error inserting admin assignments:', insertError);
        return createResponse(
          { error: 'Failed to insert admin assignments' },
          500
        );
      }
    }

    // Success response with cookies
    return createResponse({ 
      success: true,
      message: 'Case assignments updated successfully'
    });
  } catch (error: any) {
    console.error('Error in update-case-assignments API:', error);
    // In catch block, cookies might not be available, so use regular NextResponse
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

