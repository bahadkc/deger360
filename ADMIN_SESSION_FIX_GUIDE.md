# Admin Session Fix Guide - Senior Developer İçin

## Hızlı Bakış: Sorunlu Kodlar

### 🔴 KRİTİK SORUN 1: Cache Süresi Dolduğunda Agresif Logout

**Dosya**: `src/lib/supabase/admin-auth.ts`
**Fonksiyon**: `isAdmin()` (Satır 34-84)

```typescript
// ❌ MEVCUT KOD - SORUNLU
export async function isAdmin(forceRefresh = false): Promise<boolean> {
  try {
    // Cache kontrolü
    if (!forceRefresh && adminStatusCache) {
      const cacheAge = Date.now() - adminStatusCache.timestamp;
      if (cacheAge < ADMIN_CACHE_DURATION) {
        return adminStatusCache.status.isAdmin;
      }
    }

    // ❌ SORUN: Cache süresi dolduğunda hemen API'ye istek atılıyor
    const response = await fetch('/api/check-admin-status', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      // ❌ SORUN: API hata döndüğünde expired cache kullanılıyor veya false dönüyor
      // Bu da kullanıcıyı logout ediyor
      if (adminStatusCache) {
        return adminStatusCache.status.isAdmin; // Expired cache!
      }
      return false; // ❌ Burada false dönünce layout logout ediyor
    }
    // ...
  }
}
```

**Sorun**: 
- Cache süresi (5 dakika) dolduğunda API'ye istek atılıyor
- API geçici olarak 401 dönerse (network sorunu, cookie sync sorunu vs.) kullanıcı logout ediliyor
- Expired cache kullanılıyor ama bu da güvenilir değil

**✅ ÖNERİLEN ÇÖZÜM**:
```typescript
export async function isAdmin(forceRefresh = false): Promise<boolean> {
  try {
    // Cache kontrolü - daha uzun süre kullan
    if (!forceRefresh && adminStatusCache) {
      const cacheAge = Date.now() - adminStatusCache.timestamp;
      // Cache'i 15 dakika kullan, ama expired olsa bile API'ye hemen istek atma
      if (cacheAge < 15 * 60 * 1000) {
        return adminStatusCache.status.isAdmin;
      }
      
      // Cache expired ama hala kullanılabilir - önce client-side session kontrolü yap
      const { data: { user } } = await supabase.auth.getUser();
      if (user && adminStatusCache.userId === user.id) {
        // Client-side session var, expired cache'i kullan (stale-while-revalidate pattern)
        // Arka planda yeni cache'i güncelle ama şimdilik expired cache'i dön
        refreshAdminStatusCacheInBackground();
        return adminStatusCache.status.isAdmin;
      }
    }

    // Sadece cache yoksa veya client-side session yoksa API'ye istek at
    const response = await fetch('/api/check-admin-status', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      // API hata döndü - önce client-side session kontrolü yap
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Client-side session var ama API 401 döndü
        // Cookie sync sorunu olabilir - retry mekanizması dene
        if (response.status === 401) {
          // Retry once after short delay
          await new Promise(resolve => setTimeout(resolve, 500));
          const retryResponse = await fetch('/api/check-admin-status', {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            // Update cache and return
            updateAdminStatusCache(retryData);
            return retryData.isAdmin === true;
          }
        }
        // Retry başarısız ama client-side session var - expired cache kullan
        if (adminStatusCache && adminStatusCache.userId === user.id) {
          return adminStatusCache.status.isAdmin;
        }
      }
      // Client-side session yok - gerçekten logout olmuş
      adminStatusCache = null;
      return false;
    }
    // ... rest of the code
  }
}
```

---

### 🔴 KRİTİK SORUN 2: Layout'ta Her Route Değişiminde Kontrol

**Dosya**: `src/app/admin/layout.tsx`
**Fonksiyon**: `checkAdminAccess()` ve `useEffect` (Satır 23-73)

```typescript
// ❌ MEVCUT KOD - SORUNLU
const checkAdminAccess = useCallback(async () => {
  if (pathname === adminRoutes.login) {
    setLoading(false);
    return;
  }

  // ❌ SORUN: Her route değişiminde çağrılıyor
  const adminStatus = await isAdmin();
  if (!adminStatus) {
    router.push(adminRoutes.login); // ❌ Hemen logout
    return;
  }
  
  const admin = await getCurrentAdmin(); // ❌ 2. API çağrısı
  const superAdmin = await isSuperAdmin(); // ❌ 3. API çağrısı
}, [pathname, router]); // ❌ pathname dependency var!

useEffect(() => {
  checkAdminAccess(); // ❌ Her pathname değişiminde çalışıyor
}, [checkAdminAccess]);
```

**Sorun**:
- `pathname` dependency array'de olduğu için her route değişiminde `checkAdminAccess` yeniden oluşturuluyor
- Her route değişiminde 3 ayrı API çağrısı yapılıyor
- Cache süresi dolmuşsa her route değişiminde API'ye istek atılıyor

**✅ ÖNERİLEN ÇÖZÜM**:
```typescript
const checkAdminAccess = useCallback(async () => {
  if (pathname === adminRoutes.login) {
    setLoading(false);
    return;
  }

  // Cache'i kontrol et - sadece cache yoksa veya expired ise API'ye istek at
  const adminStatus = await isAdmin(); // Cache kullanır, sadece gerektiğinde API'ye istek atar
  
  if (!adminStatus) {
    // Admin değil - ama önce client-side session kontrolü yap
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Gerçekten logout olmuş
      router.push(adminRoutes.login);
      return;
    }
    // Client-side session var ama admin değil - belki cache sorunu
    // Force refresh dene
    const refreshedStatus = await isAdmin(true);
    if (!refreshedStatus) {
      router.push(adminRoutes.login);
      return;
    }
  }
  
  // Admin bilgilerini cache'den al - ayrı API çağrısı yapma
  const admin = await getCurrentAdmin(); // Bu da cache kullanır
  setAdminUser(admin);
  
  const superAdmin = await isSuperAdmin(); // Bu da cache kullanır
  setIsSuperAdminUser(superAdmin);
}, [router]); // ❌ pathname'i dependency'den çıkar!

useEffect(() => {
  // Sadece mount'ta ve SIGNED_OUT event'inde çağır
  checkAdminAccess();
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') {
      clearAdminStatusCache();
      router.push(adminRoutes.login);
    }
    // SIGNED_IN ve TOKEN_REFRESHED event'lerinde cache'i kullan, API'ye istek atma
  });
  
  return () => subscription.unsubscribe();
}, []); // ❌ checkAdminAccess'i dependency'den çıkar!
```

---

### 🔴 KRİTİK SORUN 3: API'de Session Yoksa 200 Dönüyor

**Dosya**: `src/app/api/check-admin-status/route.ts`
**Fonksiyon**: `GET` handler (Satır 11-88)

```typescript
// ❌ MEVCUT KOD - SORUNLU
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabaseClient = createServerClient(/* ... */);
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      // ❌ SORUN: Session yoksa 200 OK dönüyor
      // Client-side bu false'u görünce logout ediyor
      return NextResponse.json(
        { isAdmin: false, admin: null },
        { status: 200 } // ❌ 200 değil, 401 olmalı
      );
    }
    // ...
  }
}
```

**Sorun**:
- Session yoksa `200 OK` dönüyor ama `isAdmin: false`
- Client-side bu `false`'u görünce kullanıcıyı logout ediyor
- Ama aslında session geçerli olabilir, sadece cookie'ler okunamıyor olabilir

**✅ ÖNERİLEN ÇÖZÜM**:
```typescript
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabaseClient = createServerClient(/* ... */);
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      // ✅ Session yoksa 401 dön
      return NextResponse.json(
        { error: 'Unauthorized', isAdmin: false, admin: null },
        { status: 401 } // ✅ 401 Unauthorized
      );
    }
    // ... rest of the code
  } catch (error: any) {
    console.error('Error in check-admin-status:', error);
    // ✅ Hata durumunda da 401 dön, 200 değil
    return NextResponse.json(
      { error: 'Internal server error', isAdmin: false, admin: null },
      { status: 500 }
    );
  }
}
```

---

### 🔴 KRİTİK SORUN 4: Login Sonrası Force Refresh

**Dosya**: `src/lib/supabase/admin-auth.ts`
**Fonksiyon**: `loginAsAdmin()` (Satır 346-392)

```typescript
// ❌ MEVCUT KOD - SORUNLU
export async function loginAsAdmin(email: string, password: string) {
  clearAdminStatusCache(); // Cache temizleniyor
  
  const response = await fetch('/api/login-admin', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  // ... login başarılı

  // ❌ SORUN: Login sonrası force refresh ile cache bypass ediliyor
  await new Promise(resolve => setTimeout(resolve, 300));
  const statusData = await getCurrentAdmin(true); // ❌ forceRefresh = true
  if (!statusData) {
    throw new Error('Admin yetkisi doğrulanamadı...');
  }
}
```

**Sorun**:
- Login başarılı olsa bile `forceRefresh = true` ile cache bypass ediliyor
- Eğer bu sırada API'de geçici bir sorun varsa (cookie sync, network vs.) login başarısız görünüyor

**✅ ÖNERİLEN ÇÖZÜM**:
```typescript
export async function loginAsAdmin(email: string, password: string) {
  clearAdminStatusCache();
  
  const response = await fetch('/api/login-admin', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Giriş başarısız');
  }

  // Session'ı client-side'a set et
  if (data.session) {
    await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
  }

  // ✅ Cookie'lerin set edilmesi için biraz bekle
  await new Promise(resolve => setTimeout(resolve, 500));

  // ✅ Force refresh yerine normal cache kullan
  // Login API zaten admin bilgisini döndü, cache'i manuel set et
  if (data.admin) {
    adminStatusCache = {
      userId: data.admin.id,
      status: {
        isAdmin: true,
        isSuperAdmin: data.admin.role === 'superadmin',
        admin: data.admin,
      },
      timestamp: Date.now(),
    };
    return { user: data.user, admin: data.admin };
  }

  // ✅ Eğer admin bilgisi yoksa, o zaman API'ye istek at (ama retry ile)
  let retries = 3;
  while (retries > 0) {
    const statusData = await getCurrentAdmin(false); // Cache kullan
    if (statusData) {
      return { user: data.user, admin: statusData };
    }
    retries--;
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  throw new Error('Admin yetkisi doğrulanamadı. Lütfen sayfayı yenileyin.');
}
```

---

## Özet: Yapılması Gerekenler

1. ✅ **Cache stratejisini iyileştir**: Expired cache'i de kullan (stale-while-revalidate)
2. ✅ **401 handling'i iyileştir**: Retry mekanizması ekle, hemen logout etme
3. ✅ **Layout optimizasyonu**: Route değişiminde API çağrısı yapma
4. ✅ **API response codes**: Session yoksa 401 dön, 200 değil
5. ✅ **Login sonrası**: Force refresh yerine cache'i manuel set et

---

## Test Checklist

- [ ] Login yap → 5 dakika bekle → Sayfa yenile → Hala login mi?
- [ ] Login yap → 6 dakika bekle → Başka sayfaya git → Logout oluyor mu?
- [ ] Login yap → Cookie'leri manuel sil → Sayfa yenile → Ne oluyor?
- [ ] Login yap → Network'ü kes → Sayfa yenile → Ne oluyor?
- [ ] Login yap → Token refresh oluyor → Logout oluyor mu?

