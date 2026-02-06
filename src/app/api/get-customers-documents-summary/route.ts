import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { EXPECTED_DOCUMENTS } from '@/lib/expected-documents';

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
    // Only superadmin, admin, and lawyer can access this page
    if (role !== 'superadmin' && role !== 'admin' && role !== 'lawyer') {
      return NextResponse.json(
        { error: 'Access denied. Only superadmin, admin, and lawyer can access this page.' },
        { status: 403 }
      );
    }

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
        return NextResponse.json({ customers: [] });
      }
    }

    // Build query - Get customers with their cases
    let query = supabaseAdmin
      .from('customers')
      .select(`
        id,
        full_name,
        email,
        phone,
        dosya_takip_numarasi,
        is_sample,
        cases!inner(
          id,
          case_number,
          vehicle_plate,
          vehicle_brand_model
        )
      `)
      .order('created_at', { ascending: false });

    // Filter by assigned cases if not superadmin
    if (!isSuperAdmin && assignedCaseIds && assignedCaseIds.length > 0) {
      query = query.in('cases.id', assignedCaseIds);
    } else if (!isSuperAdmin) {
      return NextResponse.json({ customers: [] });
    } else if (isSuperAdmin) {
      // Superadmin: exclude sample customers
      query = query.eq('is_sample', false);
    }

    const { data: customersData, error: customersError } = await query;

    if (customersError) {
      console.error('Error fetching customers:', customersError);
      return NextResponse.json(
        { error: 'Failed to fetch customers' },
        { status: 500 }
      );
    }

    if (!customersData || customersData.length === 0) {
      return NextResponse.json({ customers: [] });
    }

    // Get all case IDs
    const caseIds = customersData.flatMap((customer: any) => 
      Array.isArray(customer.cases) 
        ? customer.cases.map((c: any) => c.id)
        : [customer.cases?.id].filter(Boolean)
    );

    // Get all documents for these cases
    const { data: documentsData, error: documentsError } = await supabaseAdmin
      .from('documents')
      .select('case_id, category')
      .in('case_id', caseIds);

    if (documentsError) {
      console.error('Error fetching documents:', documentsError);
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      );
    }

    // Group documents by case_id
    const documentsByCase = new Map<string, Set<string>>();
    (documentsData || []).forEach((doc: { case_id: string; category: string }) => {
      if (!documentsByCase.has(doc.case_id)) {
        documentsByCase.set(doc.case_id, new Set());
      }
      documentsByCase.get(doc.case_id)!.add(doc.category);
    });

    // Transform data to include document status
    const customers = customersData.map((customer: any) => {
      const cases = Array.isArray(customer.cases) ? customer.cases : [customer.cases].filter(Boolean);
      const primaryCase = cases[0]; // Get first case (usually there's only one)
      
      if (!primaryCase) {
        return null;
      }

      const caseId = primaryCase.id;
      const uploadedCategories = documentsByCase.get(caseId) || new Set();

      // Check each expected document
      const documentStatus = EXPECTED_DOCUMENTS.map((expectedDoc) => ({
        key: expectedDoc.key,
        name: expectedDoc.name,
        uploaded: uploadedCategories.has(expectedDoc.key),
        required: expectedDoc.required,
      }));

      return {
        id: customer.id,
        full_name: customer.full_name,
        email: customer.email,
        phone: customer.phone,
        dosya_takip_numarasi: customer.dosya_takip_numarasi,
        case_id: caseId,
        case_number: primaryCase.case_number,
        vehicle_plate: primaryCase.vehicle_plate,
        vehicle_brand_model: primaryCase.vehicle_brand_model,
        documentStatus,
      };
    }).filter(Boolean);

    return NextResponse.json({ customers });
  } catch (error: any) {
    console.error('Error in get-customers-documents-summary API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
