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
    const isAdmin = role === 'admin';
    const canAssignAdmins = isSuperAdmin || isAdmin;

    // Superadmin and admin can assign admins (admin only to acentes)
    if (!canAssignAdmins) {
      return NextResponse.json(
        { error: 'Only superadmin and admin can assign admins to cases' },
        { status: 403 }
      );
    }

    if (isAdmin) {
      // Admin rolü için: mevcut admin/avukat atamalarını koru, sadece acenteleri güncelle
      // Önce mevcut atamaları al
      const { data: existingAssignments, error: fetchError } = await supabaseAdmin
        .from('case_admins')
        .select('admin_id')
        .eq('case_id', caseId);

      if (fetchError) {
        console.error('❌ Fetch Error:', fetchError);
        return NextResponse.json(
          { error: 'Failed to fetch existing assignments' },
          { status: 500 }
        );
      }

      const existingAdminIds = (existingAssignments || []).map((a: any) => a.admin_id);
      
      // Mevcut atamaların rollerini kontrol et
      const { data: existingUserAuths, error: existingAuthError } = await supabaseAdmin
        .from('user_auth')
        .select('id, role')
        .in('id', existingAdminIds.length > 0 ? existingAdminIds : ['00000000-0000-0000-0000-000000000000']);

      if (existingAuthError) {
        console.error('❌ Existing Auth Error:', existingAuthError);
        return NextResponse.json(
          { error: 'Failed to verify existing assignments' },
          { status: 500 }
        );
      }

      // Admin/avukat/superadmin atamalarını koru (acente olmayanlar)
      const nonAcenteAssignments = (existingUserAuths || [])
        .filter((ua: any) => ua.role !== 'acente')
        .map((ua: any) => ua.id);

      // Yeni gönderilen adminIds'lerden mevcut non-acente atamalarını ve admin'in kendisini çıkar
      // Sadece yeni eklenen ID'leri kontrol et
      const newAdminIds = adminIds.filter((adminId: string) => 
        adminId !== user.id && !nonAcenteAssignments.includes(adminId)
      );
      
      let assignedUserAuths: any[] = [];
      if (newAdminIds.length > 0) {
        const { data: checkUserAuths, error: checkError } = await supabaseAdmin
          .from('user_auth')
          .select('id, role')
          .in('id', newAdminIds);

        if (checkError) {
          return NextResponse.json(
            { error: 'Failed to verify admin roles' },
            { status: 500 }
          );
        }

        assignedUserAuths = checkUserAuths || [];

        const nonAcenteAdmins = assignedUserAuths.filter((ua: any) => ua.role !== 'acente');
        if (nonAcenteAdmins.length > 0) {
          return NextResponse.json(
            { error: 'Admin rolü sadece acentelere atama yapabilir' },
            { status: 403 }
          );
        }
      }

      // Sadece acente atamalarını sil
      const acenteIds = (existingUserAuths || [])
        .filter((ua: any) => ua.role === 'acente')
        .map((ua: any) => ua.id);

      if (acenteIds.length > 0) {
        const { error: deleteAcenteError } = await supabaseAdmin
          .from('case_admins')
          .delete()
          .eq('case_id', caseId)
          .in('admin_id', acenteIds);

        if (deleteAcenteError) {
          console.error('❌ Delete Acente Error:', deleteAcenteError);
          return NextResponse.json(
            { error: 'Failed to delete acente assignments' },
            { status: 500 }
          );
        }
      }

      // Yeni acente atamalarını ekle (admin'in kendisi de dahil)
      const newAcenteIds = adminIds.filter((adminId: string) => {
        // Admin'in kendisi veya acente olanlar
        if (adminId === user.id) return true;
        const userAuth = assignedUserAuths.find((ua: any) => ua.id === adminId);
        return userAuth?.role === 'acente';
      });

      // Mevcut tüm atamaları al (hem acente hem non-acente)
      const allExistingAdminIds = existingAdminIds;
      
      // Sadece gerçekten yeni olan atamaları ekle (mevcut olmayanları)
      const finalAdminIds = [...new Set([...nonAcenteAssignments, ...newAcenteIds])];
      const newAssignments = finalAdminIds.filter((adminId: string) => !allExistingAdminIds.includes(adminId));

      if (newAssignments.length > 0) {
        const assignments = newAssignments.map((adminId: string) => ({
          case_id: caseId,
          admin_id: adminId,
        }));

        const { error: insertError } = await supabaseAdmin
          .from('case_admins')
          .insert(assignments);

        if (insertError) {
          console.error('❌ Insert Error:', insertError);
          return NextResponse.json(
            { error: 'Failed to insert admin assignments' },
            { status: 500 }
          );
        }
      }
    } else {
      // Superadmin için: tüm atamaları güncelle
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
