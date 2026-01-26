import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const documentId = searchParams.get('documentId');
    const filePath = searchParams.get('filePath');

    if (!documentId || !filePath) {
      return NextResponse.json(
        { error: 'Document ID and file path are required' },
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
      .select('role, customer_id')
      .eq('id', user.id)
      .maybeSingle();

    if (authError || !userAuth) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 403 }
      );
    }

    // Get document to check case access
    const { data: document, error: docError } = await supabaseAdmin
      .from('documents')
      .select('case_id, name, file_path')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const role = (userAuth as { role: string; customer_id: string | null }).role;
    const customerId = (userAuth as { customer_id: string | null }).customer_id;
    const isSuperAdmin = role === 'superadmin';
    const isAdmin = ['superadmin', 'admin', 'lawyer', 'acente'].includes(role);
    const isCustomer = role === 'customer';
    
    // Check access based on role
    if (isSuperAdmin) {
      // Superadmin has access to all documents
    } else if (isAdmin) {
      // Admin needs to be assigned to the case
      const { data: caseAdmin, error: caseAdminError } = await supabaseAdmin
        .from('case_admins')
        .select('case_id')
        .eq('case_id', document.case_id)
        .eq('admin_id', user.id)
        .maybeSingle();

      if (caseAdminError || !caseAdmin) {
        return NextResponse.json(
          { error: 'Access denied. This case is not assigned to you.' },
          { status: 403 }
        );
      }
    } else if (isCustomer) {
      // Customer needs to own the case - get case to check customer_id
      const { data: caseData, error: caseError } = await supabaseAdmin
        .from('cases')
        .select('customer_id')
        .eq('id', document.case_id)
        .single();

      if (caseError || !caseData) {
        return NextResponse.json(
          { error: 'Case not found' },
          { status: 404 }
        );
      }

      const caseCustomerId = (caseData as { customer_id: string }).customer_id;
      if (!customerId || caseCustomerId !== customerId) {
        return NextResponse.json(
          { error: 'Access denied. This document does not belong to you.' },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check if this is a "NO_RECEIPT" document (no physical file)
    if (filePath.startsWith('NO_RECEIPT:')) {
      // Extract date and amount from file_path (format: NO_RECEIPT:dd/mm/yyyy:amount or NO_RECEIPT:dd/mm/yyyy for old records)
      const parts = filePath.replace('NO_RECEIPT:', '').split(':');
      const datePart = parts[0] || '';
      const amountPart = parts[1] || '';
      
      // Format amount for display (support old format without amount)
      let messageText = '';
      if (amountPart) {
        const formattedAmount = parseFloat(amountPart).toLocaleString('tr-TR', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }) + ' TL';
        messageText = `Bu dosyanın ödemesi <span class="date">${datePart}</span> tarihinde <span class="amount">${formattedAmount}</span> ücret nakit olarak yapılmıştır.`;
      } else {
        // Old format without amount
        messageText = `Bu dosyanın ödemesi <span class="date">${datePart}</span> tarihinde nakit olarak yapılmıştır.`;
      }
      
      // Create HTML page showing the payment information
      const htmlContent = `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ödeme Dekontu</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
            padding: 20px;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            max-width: 600px;
            width: 100%;
        }
        h1 {
            color: #1e293b;
            margin-bottom: 30px;
            text-align: center;
            font-size: 24px;
        }
        .message {
            font-size: 18px;
            color: #475569;
            line-height: 1.6;
            text-align: center;
            padding: 20px;
            background-color: #f8fafc;
            border-radius: 6px;
            border-left: 4px solid #2563eb;
        }
        .date, .amount {
            font-weight: 600;
            color: #1e293b;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Ödeme Dekontu</h1>
        <div class="message">
            ${messageText}
        </div>
    </div>
</body>
</html>
      `;

      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }

    // Extract storage path from file_path (remove domain if it's a URL)
    let storagePath = filePath;
    if (storagePath.includes('supabase.co')) {
      // Extract path from URL: https://xxx.supabase.co/storage/v1/object/public/documents/path
      const urlParts = storagePath.split('/storage/v1/object/public/documents/');
      if (urlParts.length > 1) {
        storagePath = urlParts[1];
      }
    } else if (storagePath.startsWith('documents/')) {
      // Already in correct format
      storagePath = storagePath;
    } else {
      // Assume it's just the filename, prepend documents/
      storagePath = `documents/${storagePath}`;
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('documents')
      .download(storagePath);

    if (downloadError || !fileData) {
      console.error('Error downloading file:', downloadError);
      return NextResponse.json(
        { error: 'Failed to download file' },
        { status: 500 }
      );
    }

    // Convert blob to buffer
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine content type
    const fileName = document.name || 'document';
    const fileExt = fileName.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (fileExt === 'pdf') contentType = 'application/pdf';
    else if (fileExt === 'jpg' || fileExt === 'jpeg') contentType = 'image/jpeg';
    else if (fileExt === 'png') contentType = 'image/png';
    else if (fileExt === 'doc' || fileExt === 'docx') contentType = 'application/msword';

    // Return file with proper headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('Error in download-document API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

