import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { turkishToEnglish } from '@/lib/utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  // Admin kontrolü
  const cookieStore = await cookies();
  
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  );

  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Admin rol kontrolü
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: userAuth, error: userAuthError } = await supabaseAdmin
    .from('user_auth')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (userAuthError || !userAuth || (userAuth.role !== 'admin' && userAuth.role !== 'superadmin')) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }

  try {
    // Tüm müşterileri al
    const { data: customers, error: customersError } = await supabaseAdmin
      .from('customers')
      .select('id, email, full_name, phone')
      .not('email', 'is', null);

    if (customersError) {
      console.error('Error fetching customers:', customersError);
      return NextResponse.json(
        { error: 'Failed to fetch customers' },
        { status: 500 }
      );
    }

    if (!customers || customers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No customers found',
        updated: 0,
        failed: 0,
      });
    }

    // Tüm auth kullanıcılarını al
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      console.error('Error listing users:', usersError);
      return NextResponse.json(
        { error: 'Failed to list users' },
        { status: 500 }
      );
    }

    let updated = 0;
    let failed = 0;
    const errors: string[] = [];

    // Her müşteri için şifreyi güncelle
    for (const customer of customers) {
      if (!customer.email) continue;

      // Auth user'ı bul
      const authUser = users.find(u => u.email === customer.email);
      if (!authUser) {
        failed++;
        errors.push(`Customer ${customer.email}: Auth user not found`);
        continue;
      }

      // Müşterinin case'ini al (plaka bilgisi için)
      const { data: cases } = await supabaseAdmin
        .from('cases')
        .select('vehicle_plate')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Şifreyi yeniden oluştur
      const surname = customer.full_name?.split(' ').pop() || '';
      const cleanSurname = turkishToEnglish(surname);
      
      let newPassword = '';
      
      if (cases?.vehicle_plate) {
        // Plaka varsa: plaka.soyisim formatı
        const cleanPlate = turkishToEnglish(cases.vehicle_plate.replace(/\s/g, ''));
        newPassword = `${cleanPlate}.${cleanSurname}`;
      } else if (customer.phone) {
        // Plaka yoksa ama telefon varsa: soyisim.son4rakam formatı
        const cleanPhone = customer.phone.replace(/\s/g, '').replace(/[^0-9]/g, '');
        const phoneDigits = cleanPhone.slice(-4);
        newPassword = `${cleanSurname}.${phoneDigits}`;
      } else {
        // Hiçbiri yoksa sadece soyisim (minimum 6 karakter için)
        newPassword = cleanSurname || 'password123';
      }

      // Şifreyi güncelle
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        authUser.id,
        { password: newPassword }
      );

      if (updateError) {
        failed++;
        errors.push(`Customer ${customer.email}: ${updateError.message}`);
        console.error(`Error updating password for ${customer.email}:`, updateError);
      } else {
        updated++;
        console.log(`Password updated for ${customer.email}: ${newPassword}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Password migration completed. Updated: ${updated}, Failed: ${failed}`,
      updated,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error: any) {
    console.error('Error in password migration:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
