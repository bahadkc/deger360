import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { turkishToEnglish } from '@/lib/utils';

export async function POST(request: Request) {
  // 1. Önce bu işlemi yapanın Admin olup olmadığını kontrol et
  const cookieStore = await cookies();
  
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) { 
            // Sadece okuma yapıyoruz, cookie set etmeye gerek yok
        },
      },
    }
  );

  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, customerEmail, newPassword } = body; 
    // Frontend'den 'userId' (müşterinin auth user ID'si) veya 'customerEmail' ve 'newPassword' gelir

    if (!newPassword) {
        return NextResponse.json({ error: 'Yeni şifre gerekli' }, { status: 400 });
    }

    if (newPassword.length < 6) {
        return NextResponse.json({ error: 'Şifre en az 6 karakter olmalıdır' }, { status: 400 });
    }

    // 2. KRİTİK NOKTA: Şifreyi değiştirmek için SERVICE ROLE kullanıyoruz.
    // Service Role, "Admin" yetkisiyle başkasının verisini değiştirmemizi sağlar.
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY! // .env dosyasında olduğundan emin ol
    );

    // Eğer userId yoksa, customerEmail'den bul
    let targetUserId = userId;
    let customerId: string | null = null;
    
    if (!targetUserId && customerEmail) {
        // Normalize email (trim and lowercase for comparison)
        const normalizedEmail = customerEmail.trim().toLowerCase();
        
        // Email'den auth user ID bul - tüm sayfaları kontrol et
        let targetUser = null;
        let page = 0;
        const pageSize = 1000;
        
        while (true) {
            const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
                page: page,
                perPage: pageSize,
            });
            
            if (listError) {
                console.error('Error listing users:', listError);
                break;
            }
            
            // Check if usersData exists and has users array
            if (!usersData || !usersData.users) {
                break;
            }
            
            // Normalize edilmiş email ile karşılaştır
            targetUser = usersData.users.find(u => 
                u.email?.trim().toLowerCase() === normalizedEmail
            );
            
            if (targetUser || usersData.users.length < pageSize) {
                break; // Bulundu veya son sayfa
            }
            
            page++;
        }
        
        if (!targetUser) {
            // Auth user yoksa, önce customer'ı bul ve auth user oluştur
            const { data: customerData, error: customerError } = await supabaseAdmin
                .from('customers')
                .select('id')
                .eq('email', customerEmail)
                .maybeSingle();
            
            if (customerError || !customerData) {
                return NextResponse.json({ error: 'Müşteri bulunamadı' }, { status: 404 });
            }
            
            customerId = customerData.id;
            
            // Create auth user
            const { data: authData, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
                email: customerEmail.trim(),
                password: turkishToEnglish(newPassword),
                email_confirm: true,
            });
            
            if (createAuthError) {
                // Eğer email zaten kayıtlı hatası alırsak, tekrar ara (case sensitivity veya whitespace sorunu olabilir)
                if (createAuthError.message?.includes('already been registered') || 
                    createAuthError.message?.includes('already registered')) {
                    
                    // Tüm sayfaları tekrar kontrol et (normalize edilmiş email ile)
                    let retryTargetUser = null;
                    let retryPage = 0;
                    
                    while (true) {
                        const { data: retryUsersData, error: retryListError } = await supabaseAdmin.auth.admin.listUsers({
                            page: retryPage,
                            perPage: pageSize,
                        });
                        
                        if (retryListError) {
                            break;
                        }
                        
                        // Check if retryUsersData exists and has users array
                        if (!retryUsersData || !retryUsersData.users) {
                            break;
                        }
                        
                        retryTargetUser = retryUsersData.users.find(u => 
                            u.email?.trim().toLowerCase() === normalizedEmail
                        );
                        
                        if (retryTargetUser || retryUsersData.users.length < pageSize) {
                            break;
                        }
                        
                        retryPage++;
                    }
                    
                    if (retryTargetUser) {
                        // Kullanıcı bulundu, şifresini güncelle
                        targetUserId = retryTargetUser.id;
                    } else {
                        console.error('Error creating auth user:', createAuthError);
                        return NextResponse.json({ 
                            error: 'Email zaten kayıtlı ancak kullanıcı bulunamadı. Lütfen sistem yöneticisine başvurun.' 
                        }, { status: 500 });
                    }
                } else {
                    console.error('Error creating auth user:', createAuthError);
                    return NextResponse.json({ error: 'Auth kullanıcısı oluşturulamadı: ' + createAuthError.message }, { status: 500 });
                }
            } else if (authData?.user) {
                targetUserId = authData.user.id;
                
                // Create user_auth record
                const { error: userAuthError } = await supabaseAdmin
                    .from('user_auth')
                    .insert({
                        id: targetUserId,
                        customer_id: customerId,
                        role: 'customer',
                        password: turkishToEnglish(newPassword),
                    });
                
                if (userAuthError) {
                    console.error('Error creating user_auth record:', userAuthError);
                    // Don't fail, auth user was created successfully
                }
            }
        } else {
            targetUserId = targetUser.id;
            
            // Get customer_id from user_auth if available
            const { data: userAuthData } = await supabaseAdmin
                .from('user_auth')
                .select('customer_id')
                .eq('id', targetUserId)
                .maybeSingle();
            
            customerId = userAuthData?.customer_id || null;
        }
    }

    if (!targetUserId) {
        return NextResponse.json({ error: 'Kullanıcı ID veya email gerekli' }, { status: 400 });
    }

    // Convert Turkish characters to English characters for password
    const englishPassword = turkishToEnglish(newPassword);

    // DİKKAT: Burada 'updateUser' DEĞİL, 'admin.updateUserById' kullanıyoruz.
    // updateUser -> Login olan kişiyi günceller (HATA BUYDU)
    // updateUserById -> ID'si verilen kişiyi günceller (DOĞRUSU BU)
    const { data, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        targetUserId,
        { password: englishPassword }
    );

    if (updateError) {
        console.error("Şifre güncelleme hatası:", updateError);
        throw updateError;
    }

    // Update password in user_auth table as well (use English password)
    const { error: userAuthUpdateError } = await supabaseAdmin
        .from('user_auth')
        .update({ password: englishPassword })
        .eq('id', targetUserId);

    if (userAuthUpdateError) {
        console.error("user_auth password update error:", userAuthUpdateError);
        // Don't fail the request, password was updated in auth.users
    }

    console.log(`User ${targetUserId} password updated by Admin ${user.id}`);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
