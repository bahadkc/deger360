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
    const { caseId, paymentDate, uploadedByName } = body;

    if (!caseId || !paymentDate) {
      return NextResponse.json(
        { error: 'Case ID and payment date are required' },
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

    // Get user_auth to check role
    const { data: userAuth, error: authError } = await supabaseAdmin
      .from('user_auth')
      .select('role, name')
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

    // Get case number for file path
    const { data: caseData, error: caseError } = await supabaseAdmin
      .from('cases')
      .select('case_number')
      .eq('id', caseId)
      .single();

    if (caseError || !caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Format payment date
    const dateObj = new Date(paymentDate);
    const formattedDate = dateObj.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    // Create special document record with NO_RECEIPT flag in file_path
    // Format: NO_RECEIPT:dd/mm/yyyy
    const specialFilePath = `NO_RECEIPT:${formattedDate}`;

    const { data: document, error: documentError } = await supabaseAdmin
      .from('documents')
      .insert({
        case_id: caseId,
        name: `Ödeme Dekontu - ${formattedDate}`,
        category: 'acenteye_atilan_dekont',
        file_path: specialFilePath,
        file_size: 0,
        file_type: 'text/plain',
        uploaded_by: user.id,
        uploaded_by_name: uploadedByName || (userAuth as { name: string | null }).name || null,
        description: `Bu dosyanın ödemesi ${formattedDate} tarihinde nakit olarak yapılmıştır`,
      })
      .select()
      .single();

    if (documentError) {
      console.error('Error creating no-receipt document:', documentError);
      return NextResponse.json(
        { error: 'Failed to create document record' },
        { status: 500 }
      );
    }

    return NextResponse.json({ document });
  } catch (error: any) {
    console.error('Error in create-no-receipt-document API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
