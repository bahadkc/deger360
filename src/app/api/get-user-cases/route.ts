import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Force dynamic rendering since we use cookies
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

    // Get user_auth to find customer_id
    const { data: userAuth, error: authError } = await supabaseAdmin
      .from('user_auth')
      .select('customer_id')
      .eq('id', user.id)
      .maybeSingle();

    if (authError) {
      console.error('Error fetching user_auth:', authError);
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      );
    }

    if (!userAuth || !userAuth.customer_id) {
      return NextResponse.json(
        { error: 'No customer_id found for user' },
        { status: 404 }
      );
    }

    // Fetch cases with customer data, admin_checklist, and documents using service role to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('cases')
      .select(`
        *,
        customers (*),
        admin_checklist (*),
        documents (*)
      `)
      .eq('customer_id', userAuth.customer_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching cases:', error);
      return NextResponse.json(
        { error: 'Failed to fetch cases' },
        { status: 500 }
      );
    }

    // Document category to checklist task key mapping
    const DOCUMENT_TO_TASK_MAPPING: Record<string, string> = {
      'kaza_tespit_tutanagi': 'kaza_tespit_tutanagi',
      'arac_fotograflari': 'arac_fotograflari',
      'ruhsat': 'ruhsat_fotokopisi',
      'kimlik': 'kimlik_fotokopisi',
      'karsi_tarafin_ruhsati': 'karsi_tarafin_ruhsati_alindi',
      'karsi_tarafin_ehliyeti': 'karsi_tarafin_ehliyeti_alindi',
      'bilir_kisi_raporu': 'eksper_raporu_alindi',
      'bilirkisi_raporu': 'bilirkisi_rapor_hazirlandi',
      'hakem_karari': 'hakem_karari_dokumani_eklendi',
    };

    // Fetch skipped documents for all cases at once
    const caseIds = (data || []).map((c: any) => c.id);
    let skippedDocumentsMap = new Map<string, Set<string>>();
    
    if (caseIds.length > 0) {
      const { data: skippedData } = await supabaseAdmin
        .from('skipped_documents')
        .select('case_id, category')
        .in('case_id', caseIds);
      
      // Group skipped categories by case_id
      (skippedData || []).forEach((item: { case_id: string; category: string }) => {
        if (!skippedDocumentsMap.has(item.case_id)) {
          skippedDocumentsMap.set(item.case_id, new Set());
        }
        skippedDocumentsMap.get(item.case_id)!.add(item.category);
      });
    }

    // Process each case to filter out skipped documents and checklist items
    const processedCases = (data || []).map((caseItem: any) => {
      const caseId = caseItem.id;
      const skippedCategories = skippedDocumentsMap.get(caseId) || new Set<string>();
      
      // Filter out documents from skipped categories
      const filteredDocuments = (caseItem.documents || []).filter((doc: any) => 
        !skippedCategories.has(doc.category)
      );
      
      // Get task keys that correspond to skipped document categories
      const skippedTaskKeys = new Set<string>();
      Object.entries(DOCUMENT_TO_TASK_MAPPING).forEach(([docCategory, taskKey]) => {
        if (skippedCategories.has(docCategory)) {
          skippedTaskKeys.add(taskKey);
        }
      });
      
      // Special handling for sigorta_odeme_dekontu
      const insuranceResponse = caseItem.insurance_response;
      if (skippedCategories.has('sigorta_odeme_dekontu')) {
        if (insuranceResponse === 'accepted') {
          skippedTaskKeys.add('sigortanin_yaptigi_odeme_dekontu_muzakere');
        } else if (insuranceResponse === 'rejected') {
          skippedTaskKeys.add('sigortanin_yaptigi_odeme_dekontu_tahkim');
        } else {
          skippedTaskKeys.add('sigortanin_yaptigi_odeme_dekontu_muzakere');
          skippedTaskKeys.add('sigortanin_yaptigi_odeme_dekontu_tahkim');
        }
      }
      
      // Filter out checklist items that correspond to skipped document categories
      const filteredChecklist = (caseItem.admin_checklist || []).filter((item: any) => 
        !skippedTaskKeys.has(item.task_key)
      );
      
      return {
        ...caseItem,
        documents: filteredDocuments,
        admin_checklist: filteredChecklist,
      };
    });

    return NextResponse.json(
      { cases: processedCases },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in get-user-cases:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

