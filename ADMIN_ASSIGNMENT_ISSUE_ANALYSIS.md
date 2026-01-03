# Admin Assignment Issue - Sorun Analizi

## Problem Özeti
Superadmin hesabından müşterilere admin atamaya çalışırken:
1. **401 Unauthorized hataları**: `check-admin-status` ve `get-case` API'leri 401 dönüyor
2. **Otomatik logout**: İşlem başarılı görünüyor ama kullanıcı logout ediliyor
3. **Credential kaybı**: Hesap bilgileri siliniyor ve tekrar giriş yapılamıyor
4. **Atama yapılmıyor**: İşlem başarılı mesajı gösteriliyor ama atama gerçekleşmiyor

## Hata Logları

```
admin-auth.ts:83  GET http://localhost:3000/api/check-admin-status 401 (Unauthorized)
page.tsx:35  GET http://localhost:3000/api/get-case/a1fe0fce-6269-44df-93b2-02c4f74a9189 401 (Unauthorized)
page.tsx:45 API error: Unauthorized
Error loading case data: Error: Unauthorized page.tsx:53
    at eval (page.tsx:46:15)
```

## İlgili Dosyalar ve Sorunlu Kısımlar

### 1. `src/app/api/check-admin-status/route.ts` - 401 Hatası

**Sorun**: API route session cookie'lerini okuyamıyor ve 401 dönüyor.

**Kod**:
```typescript
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Debug: Log cookie names (not values for security)
    const allCookies = cookieStore.getAll();
    console.log('check-admin-status - Cookies received:', allCookies.length, 'cookies');
    console.log('check-admin-status - Cookie names:', allCookies.map(c => c.name).join(', '));
    
    const supabaseClient = createServerClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', isAdmin: false, admin: null },
        { status: 401 }
      );
    }
    // ...
  }
}
```

**Sorunlar**:
- `cookies()` fonksiyonu Next.js 13+ App Router'da async ve `await` ile kullanılmalı ✅ (Doğru kullanılmış)
- Cookie'ler doğru okunmuyor olabilir - debug logları eklenmiş ama sonuçlar bilinmiyor
- `createServerClient` cookie'leri doğru okuyamıyor olabilir
- Cookie domain/path ayarları yanlış olabilir

---

### 2. `src/app/api/get-case/[caseId]/route.ts` - 401 Hatası

**Sorun**: Case detay sayfası açılırken 401 hatası alınıyor.

**Kod**:
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params; // ✅ Next.js 13+ için düzeltildi

    const cookieStore = await cookies();
    const supabaseClient = createServerClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
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
    // ...
  }
}
```

**Sorunlar**:
- Aynı cookie okuma sorunu
- `params` async sorunu düzeltildi ✅

---

### 3. `src/app/api/update-case-assignments/route.ts` - Admin Atama API

**Sorun**: Admin atama işlemi sırasında session kayboluyor.

**Kod**:
```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { caseId, adminIds } = body;

    // Get authenticated user from session
    const cookieStore = await cookies();
    const supabaseClient = createServerClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
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

    // ... admin atama işlemi

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in update-case-assignments API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Sorunlar**:
- Cookie okuma sorunu burada da var
- İşlem başarılı görünüyor ama session kayboluyor
- Client-side'da `onUpdate()` çağrısı yapılıyor ve bu sırada yeni API çağrıları yapılıyor, bu da 401 hatasına sebep oluyor

---

### 4. `src/components/admin/case-tabs/general-info-tab.tsx` - Client-Side Kod

**Sorun**: Admin atama işlemi sonrası `onUpdate()` çağrısı yapılıyor ve bu sırada session kayboluyor.

**Kod**:
```typescript
// Save admin assignments (only if superadmin) - separate API call
if (canAssignAdminsData && assignedAdmins.length >= 0) {
  try {
    const assignmentsResponse = await fetch('/api/update-case-assignments', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        caseId: caseData.id,
        adminIds: assignedAdmins,
      }),
    });

    if (!assignmentsResponse.ok) {
      console.error('Error updating admin assignments');
    }
  } catch (error) {
    console.error('Error saving admin assignments:', error);
  }
}

// ... diğer kaydetme işlemleri

// Reload case data via onUpdate callback
onUpdate(); // ❌ Burada yeni API çağrıları yapılıyor ve 401 hatası alınıyor
```

**Sorunlar**:
- `onUpdate()` çağrısı `loadCaseData()` fonksiyonunu tetikliyor
- `loadCaseData()` `/api/get-case/[caseId]` API'sine istek atıyor
- Bu sırada session cookie'leri kaybolmuş oluyor ve 401 hatası alınıyor
- 401 hatası alınınca layout'taki `checkAdminAccess()` fonksiyonu çalışıyor ve kullanıcıyı logout ediyor

---

### 5. `src/app/admin/musteriler/[caseId]/page.tsx` - Case Detail Page

**Sorun**: `loadCaseData()` fonksiyonu 401 hatası alınca hata gösteriyor ama layout logout ediyor.

**Kod**:
```typescript
const loadCaseData = useCallback(async () => {
  if (!caseId) {
    return;
  }
  
  try {
    const response = await fetch(`/api/get-case/${caseId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API error:', errorData.error || response.statusText);
      throw new Error(errorData.error || 'Failed to load case data'); // ❌ Hata fırlatılıyor
    }

    const data = await response.json();
    setCaseData(data.case);
  } catch (error) {
    console.error('Error loading case data:', error);
    // ❌ Hata yakalanıyor ama layout'taki checkAdminAccess() çalışıyor ve logout ediyor
  } finally {
    setLoading(false);
  }
}, [caseId]);
```

**Sorunlar**:
- 401 hatası alınınca hata fırlatılıyor
- Layout'taki `checkAdminAccess()` fonksiyonu sürekli çalışıyor ve 401 görünce logout ediyor

---

## Kök Neden Analizi

### Ana Sorun: Cookie Okuma Problemi

1. **Cookie'ler gönderilmiyor**: Client-side'dan API'ye istek atılırken cookie'ler gönderilmiyor olabilir
2. **Cookie domain/path sorunu**: Cookie'ler yanlış domain/path'te set edilmiş olabilir
3. **Cookie expire sorunu**: Cookie'ler expire olmuş olabilir
4. **Session cookie'leri kayboluyor**: İşlem sırasında session cookie'leri kayboluyor

### İkincil Sorun: Layout'ta Agresif Logout

1. **Her API hatasında logout**: Layout'taki `checkAdminAccess()` fonksiyonu her 401 hatasında logout ediyor
2. **Cache kullanılmıyor**: 401 hatası alınınca cache kullanılmıyor, direkt logout ediliyor
3. **Retry mekanizması yok**: Geçici hatalarda retry yapılmıyor

---

## Önerilen Çözümler

### Çözüm 1: Cookie Okuma Sorununu Düzelt

**Problem**: Cookie'ler doğru okunmuyor.

**Çözüm**:
1. `request.cookies` kullanarak cookie'leri direkt oku
2. Cookie domain/path ayarlarını kontrol et
3. Cookie'lerin `httpOnly`, `secure`, `sameSite` ayarlarını kontrol et

**Kod Örneği**:
```typescript
export async function GET(request: NextRequest) {
  try {
    // Option 1: Use request.cookies directly
    const cookieHeader = request.headers.get('cookie');
    console.log('Cookie header:', cookieHeader);
    
    // Option 2: Use cookies() from next/headers
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    console.log('Cookies from store:', allCookies);
    
    // Check if Supabase auth cookies exist
    const supabaseCookies = allCookies.filter(c => 
      c.name.startsWith('sb-') || 
      c.name.includes('auth-token') ||
      c.name.includes('supabase')
    );
    console.log('Supabase cookies:', supabaseCookies.map(c => c.name));
    
    // ...
  }
}
```

### Çözüm 2: Layout'ta Agresif Logout'u Düzelt

**Problem**: Her 401 hatasında logout ediliyor.

**Çözüm**:
1. 401 hatası alınınca önce client-side session kontrolü yap
2. Client-side session varsa cache kullan ve retry dene
3. Sadece gerçekten session yoksa logout et

**Kod Örneği**:
```typescript
// src/app/admin/musteriler/[caseId]/page.tsx
const loadCaseData = useCallback(async () => {
  if (!caseId) {
    return;
  }
  
  try {
    const response = await fetch(`/api/get-case/${caseId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // 401 hatası alındı - önce client-side session kontrolü yap
      if (response.status === 401) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Client-side session var, retry dene
          await new Promise(resolve => setTimeout(resolve, 500));
          const retryResponse = await fetch(`/api/get-case/${caseId}`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });
          
          if (retryResponse.ok) {
            const data = await retryResponse.json();
            setCaseData(data.case);
            return;
          }
        }
      }
      
      // Retry başarısız veya gerçekten session yok
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to load case data');
    }

    const data = await response.json();
    setCaseData(data.case);
  } catch (error) {
    console.error('Error loading case data:', error);
    // Hata göster ama logout etme - layout zaten kontrol edecek
  } finally {
    setLoading(false);
  }
}, [caseId]);
```

### Çözüm 3: Admin Atama İşleminde Session Kontrolü

**Problem**: Admin atama işlemi sırasında session kayboluyor.

**Çözüm**:
1. Admin atama işlemi sonrası `onUpdate()` çağrısını geciktir
2. Session'ın hala geçerli olduğunu doğrula
3. Hata durumunda kullanıcıyı logout etme, sadece hata göster

**Kod Örneği**:
```typescript
// src/components/admin/case-tabs/general-info-tab.tsx
// Save admin assignments
if (canAssignAdminsData && assignedAdmins.length >= 0) {
  try {
    const assignmentsResponse = await fetch('/api/update-case-assignments', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        caseId: caseData.id,
        adminIds: assignedAdmins,
      }),
    });

    if (!assignmentsResponse.ok) {
      const errorData = await assignmentsResponse.json().catch(() => ({}));
      throw new Error(errorData.error || 'Admin atama başarısız');
    }

    // ✅ İşlem başarılı - session'ı kontrol et
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Session kayboldu. Lütfen sayfayı yenileyin.');
    }

    // ✅ Kısa bir gecikme sonrası güncelle (cookie'lerin sync olması için)
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // ✅ onUpdate() çağrısını yap ama hata durumunda logout etme
    try {
      onUpdate();
    } catch (updateError) {
      console.error('Error updating case data:', updateError);
      // Hata göster ama logout etme
      alert('Admin atama başarılı ancak sayfa güncellenemedi. Lütfen sayfayı yenileyin.');
    }
  } catch (error) {
    console.error('Error saving admin assignments:', error);
    alert(`Admin atama başarısız: ${error.message}`);
    // ❌ Hata durumunda logout etme
  }
}
```

---

## Test Senaryoları

1. **Cookie Okuma Testi**:
   - Admin panelde giriş yap
   - Browser DevTools → Application → Cookies → Supabase cookie'lerini kontrol et
   - `check-admin-status` API'sine istek at ve server console'da cookie loglarını kontrol et
   - Cookie'ler gönderiliyor mu?

2. **Admin Atama Testi**:
   - Superadmin olarak giriş yap
   - Bir müşteriye admin ata
   - İşlem başarılı mesajından sonra logout oluyor mu?
   - Atama gerçekten yapıldı mı? (Supabase'de kontrol et)

3. **Session Kontrolü Testi**:
   - Admin panelde giriş yap
   - Bir müşteri sayfasına git
   - Sayfa yüklenirken 401 hatası alınıyor mu?
   - Logout oluyor mu?

---

## Kritik Kod Satırları

- `src/app/api/check-admin-status/route.ts:14-34` - Cookie okuma
- `src/app/api/get-case/[caseId]/route.ts:26-47` - Cookie okuma ve session kontrolü
- `src/app/api/update-case-assignments/route.ts:23-45` - Cookie okuma ve session kontrolü
- `src/components/admin/case-tabs/general-info-tab.tsx:383-403` - Admin atama işlemi
- `src/app/admin/musteriler/[caseId]/page.tsx:26-57` - Case data yükleme
- `src/app/admin/layout.tsx:23-53` - Admin access kontrolü ve logout

---

## Notlar

- Supabase SSR cookie management karmaşık olabilir
- Next.js 13+ App Router'da cookie handling farklı çalışabilir
- Production'da cookie domain/path ayarları farklı olabilir
- Vercel'de cookie'ler farklı davranabilir
- Cookie'lerin `httpOnly`, `secure`, `sameSite` ayarları önemli
- Client-side ve server-side cookie sync sorunları olabilir

---

## Debug Checklist

- [ ] Browser DevTools → Application → Cookies → Supabase cookie'leri var mı?
- [ ] Server console'da cookie logları görünüyor mu?
- [ ] Cookie'lerin domain/path ayarları doğru mu?
- [ ] `credentials: 'include'` tüm fetch çağrılarında var mı?
- [ ] Session cookie'leri expire olmuş mu?
- [ ] Cookie'lerin `httpOnly`, `secure`, `sameSite` ayarları doğru mu?

