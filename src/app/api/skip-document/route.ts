import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const dynamic = 'force-dynamic';

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
  'sigorta_odeme_dekontu': 'sigortanin_yaptigi_odeme_dekontu_muzakere', // Default, will be adjusted based on board_stage
  'acenteye_atilan_dekont': 'musteriye_odeme_yapildi', // This doesn't map to a checklist item, but we'll handle it
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { caseId, category, skip } = body;

    if (!caseId || !category) {
      return NextResponse.json(
        { error: 'Case ID and category are required' },
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
    const canEditData = ['superadmin', 'admin', 'lawyer'].includes(role);

    if (!canEditData) {
      return NextResponse.json(
        { error: 'You do not have permission to skip documents' },
        { status: 403 }
      );
    }

    // Check if user has access to this case
    const isSuperAdmin = role === 'superadmin';
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

    const skipValue = skip !== undefined ? skip : true;
    const adminName = (userAuth as { name: string | null }).name || user.email || 'Admin';

    if (skipValue) {
      // Mark document category as skipped
      // Try insert first, if it fails due to unique constraint, update instead
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('skipped_documents')
        .insert({
          case_id: caseId,
          category: category,
          created_by: adminName,
        })
        .select();

      if (insertError) {
        if (insertError.code === '23505') {
          // Unique constraint violation - update instead
          const { data: updateData, error: updateError } = await supabaseAdmin
            .from('skipped_documents')
            .update({
              created_by: adminName,
            })
            .eq('case_id', caseId)
            .eq('category', category)
            .select();

          if (updateError) {
            console.error('Error updating skipped document:', updateError);
            console.error('Update error details:', JSON.stringify(updateError, null, 2));
            return NextResponse.json(
              { error: `Failed to skip document: ${updateError.message || updateError.code || updateError.hint || 'Unknown error'}. Details: ${JSON.stringify(updateError)}` },
              { status: 500 }
            );
          }
        } else {
          console.error('Error inserting skipped document:', insertError);
          console.error('Insert error details:', JSON.stringify(insertError, null, 2));
          return NextResponse.json(
            { error: `Failed to skip document: ${insertError.message || insertError.code || insertError.hint || 'Unknown error'}. Code: ${insertError.code}. Details: ${JSON.stringify(insertError)}` },
            { status: 500 }
          );
        }
      }

      // Mark corresponding checklist item as completed if mapping exists
      const taskKey = DOCUMENT_TO_TASK_MAPPING[category];
      if (taskKey) {
        // Special handling for sigorta_odeme_dekontu - determine based on board_stage
        let actualTaskKey = taskKey;
        if (category === 'sigorta_odeme_dekontu') {
          const { data: caseData } = await supabaseAdmin
            .from('cases')
            .select('board_stage')
            .eq('id', caseId)
            .single();
          
          if (caseData?.board_stage === 'tahkim') {
            actualTaskKey = 'sigortanin_yaptigi_odeme_dekontu_tahkim';
          }
        }

        // Update checklist item
        const { CHECKLIST_ITEMS } = await import('@/lib/checklist-sections');
        const taskItem = CHECKLIST_ITEMS.find((item) => item.key === actualTaskKey);
        const taskTitle = taskItem?.title || actualTaskKey;

        await supabaseAdmin
          .from('admin_checklist')
          .upsert({
            case_id: caseId,
            task_key: actualTaskKey,
            title: taskTitle,
            completed: true,
            completed_at: new Date().toISOString(),
            completed_by: adminName,
          }, {
            onConflict: 'case_id,task_key',
          });
      }
    } else {
      // Unmark document category as skipped
      const { error: deleteError } = await supabaseAdmin
        .from('skipped_documents')
        .delete()
        .eq('case_id', caseId)
        .eq('category', category);

      if (deleteError) {
        console.error('Error deleting skipped document:', deleteError);
        return NextResponse.json(
          { error: 'Failed to unskip document' },
          { status: 500 }
        );
      }

      // Optionally uncheck the checklist item (user might want to keep it checked)
      // We'll leave it checked as the user might have manually completed it
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in skip-document API:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Internal server error', details: error.toString() },
      { status: 500 }
    );
  }
}
