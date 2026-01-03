import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { CHECKLIST_SECTIONS } from '@/lib/checklist-sections';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const dynamic = 'force-dynamic';

// Helper function to check if a section is completed
function isSectionCompleted(
  section: typeof CHECKLIST_SECTIONS[0],
  checklistItems: Array<{ task_key: string; completed: boolean }>
): boolean {
  // Get all items for this section
  const sectionItems = checklistItems.filter((item) => section.taskKeys.includes(item.task_key));
  
  // Section is completed if:
  // 1. All task keys in the section have corresponding checklist items
  // 2. All those items are completed
  const allTaskKeysPresent = section.taskKeys.every((taskKey) => 
    sectionItems.some((item) => item.task_key === taskKey)
  );
  
  if (!allTaskKeysPresent) {
    return false; // Not all tasks exist yet
  }
  
  // All tasks exist and all are completed
  return sectionItems.length === section.taskKeys.length && sectionItems.every((item) => item.completed);
}

// Get current section based on checklist completion
// Returns the first incomplete section, or the next section if current is completed
function getCurrentSection(
  checklistItems: Array<{ task_key: string; completed: boolean }>
): typeof CHECKLIST_SECTIONS[0] | null {
  for (let i = 0; i < CHECKLIST_SECTIONS.length; i++) {
    const section = CHECKLIST_SECTIONS[i];
    if (!isSectionCompleted(section, checklistItems)) {
      return section;
    }
  }
  // All sections completed, return last section
  return CHECKLIST_SECTIONS[CHECKLIST_SECTIONS.length - 1];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { caseId, taskKey, completed } = body;

    if (!caseId || !taskKey) {
      return NextResponse.json(
        { error: 'Case ID and task key are required' },
        { status: 400 }
      );
    }

    // completed can be boolean or undefined (defaults to true if not provided)
    const completedStatus = completed !== undefined ? completed : true;

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
        { error: 'You do not have permission to update checklist' },
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

    // Get task title from CHECKLIST_ITEMS
    const { CHECKLIST_ITEMS } = await import('@/lib/checklist-sections');
    const taskItem = CHECKLIST_ITEMS.find((item) => item.key === taskKey);
    const taskTitle = taskItem?.title || taskKey;

    // Upsert checklist item
    const { data: checklistItem, error: checklistError } = await supabaseAdmin
      .from('admin_checklist')
      .upsert({
        case_id: caseId,
        task_key: taskKey,
        title: taskTitle,
        completed: completedStatus,
        completed_at: completedStatus ? new Date().toISOString() : null,
        completed_by: completedStatus ? (userAuth as { name: string | null }).name || user.email : null,
      }, {
        onConflict: 'case_id,task_key',
      })
      .select()
      .single();

    if (checklistError) {
      console.error('Error updating checklist:', checklistError);
      return NextResponse.json(
        { error: 'Failed to update checklist' },
        { status: 500 }
      );
    }

    // Get all checklist items for this case to determine board_stage
    const { data: allChecklistItems, error: fetchError } = await supabaseAdmin
      .from('admin_checklist')
      .select('task_key, completed')
      .eq('case_id', caseId);

    if (fetchError) {
      console.error('Error fetching checklist items:', fetchError);
      // Still return success for the update
      return NextResponse.json({ checklistItem });
    }

    // Determine current section based on checklist completion
    const checklistData = (allChecklistItems || []).map((item: any) => ({
      task_key: item.task_key,
      completed: item.completed,
    }));

    const currentSection = getCurrentSection(checklistData);
    const newBoardStage = currentSection?.boardStage || 'basvuru_alindi';

    // Update case board_stage
    const { error: updateStageError } = await supabaseAdmin
      .from('cases')
      .update({ board_stage: newBoardStage })
      .eq('id', caseId);

    if (updateStageError) {
      console.error('Error updating board_stage:', updateStageError);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({ 
      checklistItem,
      boardStage: newBoardStage,
    });
  } catch (error: any) {
    console.error('Error in update-checklist API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

