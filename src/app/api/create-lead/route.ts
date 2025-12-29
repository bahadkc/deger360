import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { protectAPI, createProtectedResponse } from '@/lib/security/api-protection';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  // API Protection (bot detection, rate limiting, size validation)
  const protection = await protectAPI(request, {
    maxRequestSize: 200 * 1024, // 200KB max for lead creation
    rateLimit: {
      windowMs: 60000,
      maxRequests: 10,
    },
  });

  if (protection) {
    return protection; // Blocked by protection
  }

  try {
    const body = await request.json();
    logger.info('Create lead request', { hasEmail: !!body.email });
    const { adSoyad, telefon, aracMarkaModel, hasarTutari, email: providedEmail } = body;

    // Validate required fields
    if (!adSoyad || !telefon || !aracMarkaModel || !hasarTutari) {
      return NextResponse.json(
        { success: false, error: 'Tüm alanlar zorunludur' },
        { status: 400 }
      );
    }

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

    // Use provided email if available, otherwise generate from phone number
    // Remove spaces and special characters from phone
    const cleanPhone = telefon.replace(/\s/g, '').replace(/[^0-9]/g, '');
    const email = providedEmail?.trim() || `${cleanPhone}@deger360.net`;

    // Generate password for portal
    const surname = adSoyad.split(' ').pop() || '';
    const cleanSurname = surname.toLowerCase();
    // Use first 4 digits of phone as part of password
    const phoneDigits = cleanPhone.slice(-4);
    const password = `${cleanSurname}.${phoneDigits}`;

    // Create customer
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('customers')
      .insert({
        full_name: adSoyad,
        email: email,
        phone: telefon,
        dosya_takip_numarasi: dosyaTakipNo,
      })
      .select()
      .single();

    if (customerError) {
      // If email already exists, try with timestamp
      if (customerError.code === '23505') {
        const emailWithTimestamp = `${cleanPhone}_${Date.now()}@deger360.net`;
        const { data: retryCustomer, error: retryError } = await supabaseAdmin
          .from('customers')
          .insert({
            full_name: adSoyad,
            email: emailWithTimestamp,
            phone: telefon,
            dosya_takip_numarasi: dosyaTakipNo,
          })
          .select()
          .single();

        if (retryError) throw retryError;
        
        // Create auth user with retry email
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: emailWithTimestamp,
          password: password,
          email_confirm: true,
        });

        if (authError) throw authError;

        // Create user_auth record
        if (authData.user) {
          await supabaseAdmin.from('user_auth').insert({
            id: authData.user.id,
            customer_id: retryCustomer.id,
            role: 'customer',
          });
        }

        // Create case for admin board
        const caseNumber = `DK-${new Date().getFullYear()}-${dosyaTakipNo.slice(-3)}`;
        const { data: caseData, error: caseError } = await supabaseAdmin
          .from('cases')
          .insert({
            customer_id: retryCustomer.id,
            case_number: caseNumber,
            status: 'active',
            vehicle_plate: 'BELİRTİLMEDİ',
            vehicle_brand_model: aracMarkaModel,
            accident_date: new Date().toISOString().split('T')[0],
            damage_amount: hasarTutari,
            board_stage: 'basvuru_alindi',
          })
          .select()
          .single();

        if (caseError) {
          console.error('Error creating case:', caseError);
        }

        return NextResponse.json({
          success: true,
          customer: retryCustomer,
          case: caseData,
          credentials: {
            dosyaTakipNo,
            password,
            email: emailWithTimestamp,
          },
        });
      }
      throw customerError;
    }

    // Create auth user for portal login
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
    });

    if (authError) {
      // If auth user creation fails, delete the customer
      await supabaseAdmin.from('customers').delete().eq('id', customer.id);
      throw authError;
    }

    // Create user_auth record
    if (authData.user) {
      const { error: userAuthError } = await supabaseAdmin.from('user_auth').insert({
        id: authData.user.id,
        customer_id: customer.id,
        role: 'customer',
      });

      if (userAuthError) {
        // Cleanup on error
        await supabaseAdmin.from('customers').delete().eq('id', customer.id);
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw userAuthError;
      }
    }

    // Create case for admin board
    const caseNumber = `DK-${new Date().getFullYear()}-${dosyaTakipNo.slice(-3)}`;
    const { data: caseData, error: caseError } = await supabaseAdmin
      .from('cases')
      .insert({
        customer_id: customer.id,
        case_number: caseNumber,
        status: 'active',
        vehicle_plate: 'BELİRTİLMEDİ', // Will be updated later
        vehicle_brand_model: aracMarkaModel,
        accident_date: new Date().toISOString().split('T')[0], // Today's date as placeholder
        damage_amount: hasarTutari,
        board_stage: 'basvuru_alindi', // Start in "Başvuru Alındı" stage
      })
      .select()
      .single();

    if (caseError) {
      // Log error but don't fail - customer is already created
      console.error('Error creating case:', caseError);
    }

    logger.info('Lead created successfully', { customerId: customer.id, dosyaTakipNo });
    
    return createProtectedResponse({
      success: true,
      customer: customer,
      case: caseData,
      credentials: {
        dosyaTakipNo,
        password,
        email: email,
      },
    });
  } catch (error: any) {
    logger.error('Error creating lead', { error: error.message, stack: error.stack });
    
    return createProtectedResponse(
      { success: false, error: error.message || 'Bir hata oluştu' },
      500
    );
  }
}
