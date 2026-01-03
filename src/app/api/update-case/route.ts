import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { caseId, caseUpdates, customerUpdates } = body;

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
      console.error('🍪 update-case - getUser error:', {
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
    const canEditData = ['superadmin', 'admin', 'lawyer'].includes(role);

    if (!canEditData) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this data' },
        { status: 403 }
      );
    }

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

    // Get case to find customer_id
    const { data: caseData, error: caseError } = await supabaseAdmin
      .from('cases')
      .select('customer_id')
      .eq('id', caseId)
      .single();

    if (caseError || !caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    const customerId = caseData.customer_id;

    // Update customer if customerUpdates provided
    if (customerUpdates && customerId) {
      // Generate dosya takip numarası if not provided or null
      if (!customerUpdates.dosya_takip_numarasi || customerUpdates.dosya_takip_numarasi === 'AUTO_GENERATE') {
        const { data: existingCustomers } = await supabaseAdmin
          .from('customers')
          .select('dosya_takip_numarasi')
          .not('dosya_takip_numarasi', 'is', null);

        const existingNumbers = (existingCustomers || [])
          .map((c: any) => parseInt(c.dosya_takip_numarasi || '0'))
          .filter((n: number) => !isNaN(n) && n >= 546178);

        customerUpdates.dosya_takip_numarasi =
          existingNumbers.length === 0 ? '546179' : (Math.max(...existingNumbers) + 1).toString();
      }

      // Check if email changed and update auth if needed
      if (customerUpdates.email) {
        const { data: oldCustomer } = await supabaseAdmin
          .from('customers')
          .select('email')
          .eq('id', customerId)
          .single();

        if (oldCustomer && oldCustomer.email !== customerUpdates.email) {
          // Update email in auth.users
          const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
          const userToUpdate = authUsers.users.find((u) => u.email === oldCustomer.email);
          
          if (userToUpdate) {
            await supabaseAdmin.auth.admin.updateUserById(userToUpdate.id, {
              email: customerUpdates.email,
            });
          }
        }
      }

      const { error: customerUpdateError } = await supabaseAdmin
        .from('customers')
        .update(customerUpdates)
        .eq('id', customerId);

      if (customerUpdateError) {
        console.error('Error updating customer:', customerUpdateError);
        return NextResponse.json(
          { error: 'Failed to update customer' },
          { status: 500 }
        );
      }
    }

    // Update case if caseUpdates provided
    if (caseUpdates) {
      const { error: caseUpdateError } = await supabaseAdmin
        .from('cases')
        .update(caseUpdates)
        .eq('id', caseId);

      if (caseUpdateError) {
        console.error('Error updating case:', caseUpdateError);
        return NextResponse.json(
          { error: 'Failed to update case' },
          { status: 500 }
        );
      }
    }

    // Return updated case with customer data
    const { data: updatedCase, error: fetchError } = await supabaseAdmin
      .from('cases')
      .select(`
        *,
        customers (*)
      `)
      .eq('id', caseId)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch updated case' },
        { status: 500 }
      );
    }

    return NextResponse.json({ case: updatedCase });
  } catch (error: any) {
    console.error('Error in update-case API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

