import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { turkishToEnglish } from '@/lib/utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerData, vehicleData, documents } = body;

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

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get user_auth to check role
    const { data: userAuth, error: userAuthError } = await supabaseAdmin
      .from('user_auth')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (userAuthError || !userAuth) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const role = (userAuth as { role: string }).role;
    const isAdminOrLawyer = role === 'admin' || role === 'lawyer';

    // Generate tracking number
    const { data: existingCustomers } = await supabaseAdmin
      .from('customers')
      .select('dosya_takip_numarasi')
      .not('dosya_takip_numarasi', 'is', null);

    const existingNumbers = (existingCustomers || [])
      .map((c) => parseInt(c.dosya_takip_numarasi || '0'))
      .filter((n) => !isNaN(n) && n >= 546178);

    const dosyaTakipNo =
      existingNumbers.length === 0 ? '546179' : (Math.max(...existingNumbers) + 1).toString();

    // Generate password - only English characters and numbers
    const surname = customerData.full_name.split(' ').pop() || '';
    const cleanPlate = turkishToEnglish(vehicleData.vehicle_plate.replace(/\s/g, ''));
    const cleanSurname = turkishToEnglish(surname);
    const password = `${cleanPlate}.${cleanSurname}`;

    // Create customer
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('customers')
      .insert({
        full_name: customerData.full_name,
        email: customerData.email,
        phone: customerData.phone || null,
        address: customerData.address || null,
        tc_kimlik: customerData.tc_kimlik || null,
        iban: customerData.iban || null,
        payment_person_name: customerData.payment_person_name || null,
        dosya_takip_numarasi: dosyaTakipNo,
      })
      .select()
      .single();

    if (customerError) throw customerError;

    // Create case
    const caseNumber = `DK-${new Date().getFullYear()}-${dosyaTakipNo.slice(-3)}`;
    const { data: caseData, error: caseError } = await supabaseAdmin
      .from('cases')
      .insert({
        customer_id: customer.id,
        case_number: caseNumber,
        status: 'active',
        vehicle_plate: vehicleData.vehicle_plate,
        vehicle_brand_model: vehicleData.vehicle_brand_model,
        accident_date: vehicleData.accident_date,
        accident_location: vehicleData.accident_location || null,
        board_stage: 'basvuru_alindi',
      })
      .select()
      .single();

    if (caseError) throw caseError;

    // Auto-assign case to admin/lawyer if they created it
    if (isAdminOrLawyer) {
      const { error: assignmentError } = await supabaseAdmin
        .from('case_admins')
        .insert({
          case_id: caseData.id,
          admin_id: user.id,
        });

      if (assignmentError) {
        console.error('Error assigning case to admin/lawyer:', assignmentError);
        // Don't fail the request, just log the error
      }
    }

    // Create auth user
    const { data: authData, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: customerData.email,
      password: password,
      email_confirm: true,
    });

    if (createAuthError) throw createAuthError;

    // Create user_auth record
    if (authData.user) {
      await supabaseAdmin.from('user_auth').insert({
        id: authData.user.id,
        customer_id: customer.id,
        role: 'customer',
        password: password, // Store password in user_auth table for display purposes
      });
    }

    // Upload documents (if any) - support multiple files per category
    const uploadedDocs = [];
    for (const [category, fileDataOrArray] of Object.entries(documents)) {
      if (fileDataOrArray) {
        // Handle both single file (backward compatibility) and array of files
        const filesArray = Array.isArray(fileDataOrArray) ? fileDataOrArray : [fileDataOrArray];
        
        for (const fileData of filesArray) {
          try {
            // fileData is base64 encoded file
            const { name, content, type } = fileData as any;
            const buffer = Buffer.from(content, 'base64');
            const fileExt = type || 'pdf';
            const timestamp = Date.now();
            const randomSuffix = Math.random().toString(36).substring(2, 9);
            const sanitizedFileName = name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fileName = `${caseData.id}/${category}/${timestamp}_${randomSuffix}_${sanitizedFileName}`;
            const filePath = `documents/${fileName}`;

            // Determine content type
            let contentType = 'application/pdf';
            if (fileExt === 'jpg' || fileExt === 'jpeg') contentType = 'image/jpeg';
            if (fileExt === 'png') contentType = 'image/png';
            if (fileExt === 'webp') contentType = 'image/webp';

            const { error: uploadError } = await supabaseAdmin.storage
              .from('documents')
              .upload(filePath, buffer, {
                contentType: contentType,
              });

            if (!uploadError) {
              const { error: docError } = await supabaseAdmin.from('documents').insert({
                case_id: caseData.id,
                name: name,
                file_path: filePath,
                file_size: buffer.length,
                file_type: contentType,
                category: category,
                uploaded_by: 'admin',
                uploaded_by_name: 'Admin',
              });

              if (!docError) {
                uploadedDocs.push(name);
              }
            }
          } catch (docError) {
            console.error(`Error uploading document ${category}:`, docError);
            // Continue with other documents
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      customer: customer,
      case: caseData,
      credentials: {
        dosyaTakipNo,
        password,
      },
      uploadedDocuments: uploadedDocs,
    });
  } catch (error: any) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
