import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerData, vehicleData, documents } = body;

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

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

    // Generate password
    const surname = customerData.full_name.split(' ').pop() || '';
    const cleanPlate = vehicleData.vehicle_plate.replace(/\s/g, '').toLowerCase();
    const cleanSurname = surname.toLowerCase();
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

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: customerData.email,
      password: password,
      email_confirm: true,
    });

    if (authError) throw authError;

    // Create user_auth record
    if (authData.user) {
      await supabaseAdmin.from('user_auth').insert({
        id: authData.user.id,
        customer_id: customer.id,
        role: 'customer',
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
