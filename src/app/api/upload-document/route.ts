import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const caseId = formData.get('caseId') as string;
    const category = formData.get('category') as string;
    const uploadedByName = formData.get('uploadedByName') as string;

    if (!file || !caseId || !category) {
      return NextResponse.json(
        { error: 'File, case ID, and category are required' },
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

    // Check if document with same category already exists
    const { data: existingDoc, error: existingDocError } = await supabaseAdmin
      .from('documents')
      .select('id, file_path')
      .eq('case_id', caseId)
      .eq('category', category)
      .maybeSingle();

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${caseId}/${category}_${Date.now()}.${fileExt}`;
    const filePath = `documents/${fileName}`;

    const fileBuffer = await file.arrayBuffer();
    
    // Delete old file if exists
    if (existingDoc && existingDoc.file_path) {
      let oldStoragePath = existingDoc.file_path;
      // Extract storage path from URL if it's a full URL
      if (oldStoragePath.includes('supabase.co')) {
        const urlParts = oldStoragePath.split('/storage/v1/object/public/documents/');
        if (urlParts.length > 1) {
          oldStoragePath = `documents/${urlParts[1]}`;
        }
      } else if (!oldStoragePath.startsWith('documents/')) {
        oldStoragePath = `documents/${oldStoragePath}`;
      }
      
      // Delete old file from storage
      await supabaseAdmin.storage.from('documents').remove([oldStoragePath]);
      
      // Delete old document record
      await supabaseAdmin.from('documents').delete().eq('id', existingDoc.id);
    }

    const { error: uploadError } = await supabaseAdmin.storage
      .from('documents')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false, // Don't overwrite, use unique filename
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
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
        uploaded_by: user.id,
        uploaded_by_name: uploadedByName || (userAuth as { name: string | null }).name || null,
      })
      .select()
      .single();

    if (documentError) {
      console.error('Error saving document record:', documentError);
      // Try to delete uploaded file
      await supabaseAdmin.storage.from('documents').remove([filePath]);
      return NextResponse.json(
        { error: 'Failed to save document record' },
        { status: 500 }
      );
    }

    return NextResponse.json({ document });
  } catch (error: any) {
    console.error('Error in upload-document API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

