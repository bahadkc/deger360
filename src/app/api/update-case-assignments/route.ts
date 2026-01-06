import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // 1. Önce kullanıcının oturumu var mı kontrol et (Sadece Okuma Modu)
  // Burada cookie set etmeye çalışmıyoruz, sadece var olanı okuyoruz.
  const cookieStore = await cookies();
  
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Auth kontrolü sırasında cookie yenilemeye gerek yok.
          // Sadece kimlik doğrulama yapıyoruz.
          // Boş bırakarak session bozulma riskini 0'a indiriyoruz.
        },
      },
    }
  );

  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

  if (authError || !user) {
    console.error('❌ Auth Error:', authError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { caseId, adminIds } = body;

    if (!caseId || !Array.isArray(adminIds)) {
      return NextResponse.json(
        { error: 'Case ID and admin IDs array are required' },
        { status: 400 }
      );
    }

    // 2. VERİTABANI İŞLEMİ İÇİN "SERVICE ROLE" KULLAN (Admin Bypass)
    // Bu client cookie kullanmaz, RLS takılmaz, session bozmaz.
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Superadmin kontrolü - Service Role ile user_auth tablosundan kontrol et
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
    const isSuperAdmin = role === 'superadmin';

    // Only superadmin can assign admins
    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: 'Only superadmin can assign admins to cases' },
        { status: 403 }
      );
    }

    // Mevcut atamaları temizle
    const { error: deleteError } = await supabaseAdmin
      .from('case_admins')
      .delete()
      .eq('case_id', caseId);
    
    if (deleteError) {
      console.error('❌ Delete Error:', deleteError);
      throw deleteError;
    }

    // Yeni adminleri ekle
    if (adminIds.length > 0) {
      const assignments = adminIds.map((adminId: string) => ({
        case_id: caseId,
        admin_id: adminId,
      }));

      const { error: insertError } = await supabaseAdmin
        .from('case_admins')
        .insert(assignments);

      if (insertError) {
        console.error('❌ Insert Error:', insertError);
        throw insertError;
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Case assignments updated successfully'
    });

  } catch (error: any) {
    console.error('❌ Update Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
