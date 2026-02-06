import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const dynamic = 'force-dynamic';

// Document category to checklist task key mapping
// This mapping determines which checklist item should be marked as completed when a document is uploaded
const DOCUMENT_TO_TASK_MAPPING: Record<string, string> = {
  'kaza_tespit_tutanagi': 'kaza_tespit_tutanagi',
  'arac_fotograflari': 'arac_fotograflari',
  'ruhsat': 'ruhsat_fotokopisi',
  'kimlik': 'kimlik_fotokopisi',
  'karsi_tarafin_ruhsati': 'karsi_tarafin_ruhsati_alindi',
  'karsi_tarafin_ehliyeti': 'karsi_tarafin_ehliyeti_alindi',
  'bilir_kisi_raporu': 'eksper_raporu_alindi',
  'bilirkisi_raporu': 'bilirkisi_rapor_hazirlandi',
  'sigortaya_gonderilen_ihtarname': 'sigortaya_yapilan_basvuru_dokumani_eklendi',
  'hakem_karari': 'hakem_karari_dokumani_eklendi',
  // sigorta_odeme_dekontu is handled specially based on case board_stage
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const caseId = formData.get('caseId') as string;
    const category = formData.get('category') as string;
    const uploadedByName = formData.get('uploadedByName') as string;

    // Support both single file (backward compatibility) and multiple files
    const fileList = files.length > 0 ? files : formData.get('file') ? [formData.get('file') as File] : [];

    if (fileList.length === 0 || !caseId || !category) {
      return NextResponse.json(
        { error: 'File(s), case ID, and category are required' },
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
            cookieStore.set(name, value, options);
          });
        },
      },
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError) {
      console.error('Error getting user from session:', {
        error: userError,
        message: userError.message,
        status: userError.status,
      });
      // Don't sign out, just return error - let client handle it
      return NextResponse.json(
        { error: 'Unauthorized: Session expired or invalid. Please log in again.' },
        { status: 401 }
      );
    }

    if (!user) {
      console.error('No user found in session');
      // Don't sign out, just return error - let client handle it
      return NextResponse.json(
        { error: 'Unauthorized: No active session. Please log in again.' },
        { status: 401 }
      );
    }

    console.log('Upload document - User authenticated:', user.id, user.email);

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
        { error: 'You do not have permission to upload documents' },
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

    // Upload multiple files
    const uploadedDocuments = [];
    const errors = [];

    for (const file of fileList) {
      try {
        // Generate unique filename with timestamp to avoid collisions
        const fileExt = file.name.split('.').pop();
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 9);
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${caseId}/${category}/${timestamp}_${randomSuffix}_${sanitizedFileName}`;
        const filePath = `documents/${fileName}`;

        const fileBuffer = await file.arrayBuffer();

        // Upload file to Supabase Storage
        const { error: uploadError } = await supabaseAdmin.storage
          .from('documents')
          .upload(filePath, fileBuffer, {
            contentType: file.type,
            upsert: false, // Don't overwrite, use unique filename
          });

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          errors.push({ fileName: file.name, error: 'Failed to upload file' });
          continue;
        }

        // Save document record with storage path (not public URL) for easier deletion and access
        const { data: document, error: documentError } = await supabaseAdmin
          .from('documents')
          .insert({
            case_id: caseId,
            name: file.name,
            category: category,
            file_path: filePath, // Store storage path, not public URL
            file_size: file.size,
            file_type: file.type || fileExt,
            uploaded_by: user.id,
            uploaded_by_name: uploadedByName || (userAuth as { name: string | null }).name || null,
          })
          .select()
          .single();

        if (documentError) {
          console.error('Error saving document record:', documentError);
          // Try to delete uploaded file
          await supabaseAdmin.storage.from('documents').remove([filePath]);
          errors.push({ fileName: file.name, error: 'Failed to save document record' });
          continue;
        }

        uploadedDocuments.push(document);
      } catch (fileError: any) {
        console.error('Error processing file:', fileError);
        errors.push({ fileName: file.name, error: fileError.message || 'Unknown error' });
      }
    }

    // Auto-mark checklist items based on uploaded documents
    // Only mark if document was successfully uploaded
    if (uploadedDocuments.length > 0) {
      let taskKeyToMark: string | undefined = DOCUMENT_TO_TASK_MAPPING[category];
      
      // Special handling for sigorta_odeme_dekontu - determine based on case insurance_response or board_stage
      if (category === 'sigorta_odeme_dekontu') {
        // Get case insurance_response and board_stage to determine which section
        const { data: caseData } = await supabaseAdmin
          .from('cases')
          .select('insurance_response, board_stage')
          .eq('id', caseId)
          .single();
        
        // If insurance_response is 'rejected', use tahkim checklist item
        // If insurance_response is 'accepted' or null/undefined, use müzakere checklist item
        // Also check board_stage as fallback
        if (caseData?.insurance_response === 'rejected' || caseData?.board_stage === 'tahkim') {
          taskKeyToMark = 'sigortanin_yaptigi_odeme_dekontu_tahkim';
        } else {
          // Default to müzakere (accepted or no response)
          taskKeyToMark = 'sigortanin_yaptigi_odeme_dekontu_muzakere';
        }
      }
      
      if (taskKeyToMark) {
        try {
          // Get task title from CHECKLIST_ITEMS
          const { CHECKLIST_ITEMS } = await import('@/lib/checklist-sections');
          const taskItem = CHECKLIST_ITEMS.find((item) => item.key === taskKeyToMark);
          const taskTitle = taskItem?.title || taskKeyToMark;

          // Check if checklist item already exists and is completed
          const { data: existingChecklistItem } = await supabaseAdmin
            .from('admin_checklist')
            .select('completed')
            .eq('case_id', caseId)
            .eq('task_key', taskKeyToMark)
            .maybeSingle();

          // Only mark as completed if not already completed (to avoid overwriting manual unchecks)
          if (!existingChecklistItem || !existingChecklistItem.completed) {
            // Upsert checklist item
            const { error: checklistError } = await supabaseAdmin
              .from('admin_checklist')
              .upsert({
                case_id: caseId,
                task_key: taskKeyToMark,
                title: taskTitle,
                completed: true,
                completed_at: new Date().toISOString(),
                completed_by: (userAuth as { name: string | null }).name || user.email || null,
              }, {
                onConflict: 'case_id,task_key',
              });

            if (checklistError) {
              console.error('Error auto-marking checklist item:', checklistError);
              // Don't fail the upload, just log the error
            } else {
              console.log(`Auto-marked checklist item: ${taskKeyToMark} for case ${caseId}`);
            }
          }
        } catch (checklistError: any) {
          console.error('Error in auto-marking checklist:', checklistError);
          // Don't fail the upload, just log the error
        }
      }
    }

    // Return results
    if (uploadedDocuments.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to upload any files',
          errors: errors
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      documents: uploadedDocuments,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error('Error in upload-document API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

