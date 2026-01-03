# Admin Panel Session Management - Sorun Analizi

## Problem Özeti
Admin panelde kullanıcı oturum açtıktan sonra:
1. **Otomatik logout**: "Oturum süreniz dolmuş olabilir" mesajı ile kullanıcı login sayfasına yönlendiriliyor
2. **Credential kaybı**: Sayfa yenilendiğinde credential'lar silinmiş gibi görünüyor ve tekrar giriş yapılamıyor
3. **Session geçersizleşmesi**: Geçerli session varken bile kullanıcı logout ediliyor

---

## İlgili Dosyalar ve Sorunlu Kısımlar

### 1. `src/lib/supabase/admin-auth.ts` - Ana Sorun Kaynağı

#### Sorun 1: Cache Süresi Dolduğunda Agresif Session Kontrolü
**Satır 34-84**: `isAdmin()` fonksiyonu

```typescript
export async function isAdmin(forceRefresh = false): Promise<boolean> {
  // Cache kontrolü
  if (!forceRefresh && adminStatusCache) {
    const cacheAge = Date.now() - adminStatusCache.timestamp;
    if (cacheAge < ADMIN_CACHE_DURATION) {
      return adminStatusCache.status.isAdmin;
    }
  }

  // Cache süresi dolduğunda API'ye istek atılıyor
  const response = await fetch('/api/check-admin-status', {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    // ❌ SORUN: 401 geldiğinde cache temizleniyor ve false dönüyor
    // Bu da kullanıcıyı login sayfasına yönlendiriyor
    if (adminStatusCache) {
      return adminStatusCache.status.isAdmin; // Expired cache kullanılıyor
    }
    return false; // ❌ Burada false dönünce layout kullanıcıyı logout ediyor
  }
}
```

**Sorun**: 
- Cache süresi (5 dakika) dolduğunda API'ye istek atılıyor
- Eğer API 401 dönerse (geçici bir sorun olabilir), cache temizleniyor ve `false` dönüyor
- `false` dönünce layout kullanıcıyı login sayfasına yönlendiriyor

#### Sorun 2: 401 Hatasında Cache Temizleme
**Satır 110-128**: `isSuperAdmin()` fonksiyonu

```typescript
if (!response.ok) {
  if (response.status === 401) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      adminStatusCache = null; // ❌ Cache temizleniyor
      return false;
    }
    // User exists but API returned 401 - might be temporary
    if (adminStatusCache) {
      return adminStatusCache.status.isSuperAdmin; // Expired cache kullanılıyor
    }
  }
  return false; // ❌ Bu da logout'a sebep oluyor
}
```

**Sorun**:
- API 401 döndüğünde client-side `supabase.auth.getUser()` ile kontrol ediliyor
- Ama bu kontrol yeterli değil çünkü cookie'ler server-side'da olabilir
- Cache temizlenince bir sonraki çağrıda tekrar API'ye istek atılıyor ve döngü başlıyor

#### Sorun 3: Login Sonrası Force Refresh
**Satır 346-392**: `loginAsAdmin()` fonksiyonu

```typescript
export async function loginAsAdmin(email: string, password: string) {
  clearAdminStatusCache(); // Cache temizleniyor
  
  // Login API çağrısı...
  
  // ❌ SORUN: Login sonrası force refresh ile cache bypass ediliyor
  const statusData = await getCurrentAdmin(true); // forceRefresh = true
  if (!statusData) {
    throw new Error('Admin yetkisi doğrulanamadı...');
  }
}
```

**Sorun**:
- Login sonrası `forceRefresh = true` ile cache bypass ediliyor
- Eğer bu sırada API'de geçici bir sorun varsa, login başarısız görünüyor

---

### 2. `src/app/admin/layout.tsx` - Layout'ta Sürekli Kontrol

#### Sorun 4: Her Render'da Admin Kontrolü
**Satır 23-53**: `checkAdminAccess()` fonksiyonu

```typescript
const checkAdminAccess = useCallback(async () => {
  // Login sayfasında kontrol yapılmıyor ✅
  if (pathname === adminRoutes.login) {
    setLoading(false);
    return;
  }

  // ❌ SORUN: Her sayfa değişiminde ve mount'ta çağrılıyor
  const adminStatus = await isAdmin();
  if (!adminStatus) {
    router.push(adminRoutes.login); // ❌ Hemen logout ediliyor
    setLoading(false);
    return;
  }
  
  // Admin bilgileri çekiliyor (3 ayrı API çağrısı)
  const admin = await getCurrentAdmin();
  const superAdmin = await isSuperAdmin();
}, [pathname, router]);

useEffect(() => {
  checkAdminAccess(); // ❌ Her mount'ta ve pathname değişiminde çağrılıyor
}, [checkAdminAccess]);
```

**Sorun**:
- Her sayfa değişiminde `isAdmin()` çağrılıyor
- Cache süresi dolmuşsa API'ye istek atılıyor
- API 401 dönerse kullanıcı logout ediliyor
- `checkAdminAccess` dependency array'de `pathname` var, bu da her route değişiminde yeniden çalışmasına sebep oluyor

#### Sorun 5: Auth State Change Listener
**Satır 55-73**: `useEffect` içinde auth listener

```typescript
useEffect(() => {
  setMounted(true);
  checkAdminAccess();
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
      clearAdminStatusCache(); // ❌ Cache temizleniyor
      checkAdminAccess(); // ❌ Tekrar kontrol ediliyor
    }
    // TOKEN_REFRESHED event'i ignore ediliyor ✅
  });
}, [checkAdminAccess]);
```

**Sorun**:
- `SIGNED_IN` event'inde cache temizleniyor ve tekrar kontrol ediliyor
- Ama `TOKEN_REFRESHED` event'i ignore ediliyor, bu doğru
- Ancak token refresh sırasında cookie'ler güncellenmeyebilir

---

### 3. `src/app/api/check-admin-status/route.ts` - API Route

#### Sorun 6: Session Cookie Okuma Sorunu
**Satır 11-35**: Cookie okuma ve session kontrolü

```typescript
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const supabaseClient = createServerClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll(); // ❌ Cookie'ler doğru okunuyor mu?
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
    // ❌ SORUN: Session yoksa 200 dönüyor ama isAdmin: false
    // Client-side bu false'u görünce logout ediyor
    return NextResponse.json(
      { isAdmin: false, admin: null },
      { status: 200 } // ❌ 200 dönüyor, 401 değil
    );
  }
}
```

**Sorun**:
- Session yoksa `200 OK` ile `{ isAdmin: false }` dönüyor
- Client-side bu `false`'u görünce kullanıcıyı logout ediyor
- Ama aslında session geçerli olabilir, sadece cookie'ler okunamıyor olabilir

---

### 4. `src/app/api/login-admin/route.ts` - Login API

#### Sorun 7: Session Cookie Set Etme
**Satır 48-52**: Login işlemi

```typescript
const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
  email: normalizedEmail,
  password,
});

// ❌ SORUN: Cookie'ler otomatik set ediliyor ama garantisi yok
// createServerClient'in setAll callback'i çalışıyor mu?
```

**Sorun**:
- Login başarılı olsa bile cookie'ler doğru set edilmeyebilir
- `createServerClient` cookie'leri set ediyor ama bu async bir işlem ve garantisi yok

---

## Kök Neden Analizi

### Ana Sorunlar:
1. **Cache Stratejisi**: Cache süresi dolduğunda agresif API çağrısı yapılıyor
2. **Session Validation**: Client-side ve server-side session kontrolü tutarsız
3. **Error Handling**: 401 hatası geldiğinde cache temizleniyor ve kullanıcı logout ediliyor
4. **Cookie Management**: Cookie'lerin set/read işlemleri garantili değil
5. **Layout Re-render**: Her route değişiminde admin kontrolü yapılıyor

---

## Önerilen Çözümler

### Çözüm 1: Cache Stratejisini İyileştir
- Cache süresini uzat (5 dakika → 15-30 dakika)
- Cache süresi dolduğunda hemen API'ye istek atma, önce client-side session kontrolü yap
- API 401 dönerse cache'i temizleme, sadece logla ve expired cache kullan

### Çözüm 2: Session Validation İyileştir
- `check-admin-status` API'sinde session yoksa `401` dön, `200` değil
- Client-side'da 401 geldiğinde önce `supabase.auth.getUser()` ile kontrol et
- Eğer client-side session varsa ama API 401 döndüyse, cookie sorunu olabilir - retry mekanizması ekle

### Çözüm 3: Layout Optimizasyonu
- `checkAdminAccess`'i sadece mount'ta ve SIGNED_OUT event'inde çağır
- Route değişiminde çağırma
- Cache'i daha agresif kullan

### Çözüm 4: Cookie Management
- Login sonrası cookie'lerin set edildiğini doğrula
- Cookie'lerin `httpOnly`, `secure`, `sameSite` ayarlarını kontrol et
- Cookie'lerin domain ve path ayarlarını kontrol et

### Çözüm 5: Error Recovery
- 401 hatası geldiğinde kullanıcıyı hemen logout etme
- Önce retry mekanizması dene (3 kez)
- Retry başarısız olursa logout et

---

## Test Senaryoları

1. **Normal Login**: Login → Dashboard → 5 dakika bekle → Sayfa yenile → Hala login mi?
2. **Cache Expiry**: Login → Dashboard → 6 dakika bekle → Başka sayfaya git → Logout oluyor mu?
3. **Session Refresh**: Login → Dashboard → Token refresh oluyor → Logout oluyor mu?
4. **Cookie Loss**: Login → Cookie'leri manuel sil → Sayfa yenile → Ne oluyor?

---

## Kritik Kod Satırları

- `src/lib/supabase/admin-auth.ts:34-84` - `isAdmin()` fonksiyonu
- `src/lib/supabase/admin-auth.ts:110-128` - `isSuperAdmin()` 401 handling
- `src/app/admin/layout.tsx:23-53` - `checkAdminAccess()` fonksiyonu
- `src/app/admin/layout.tsx:55-73` - Auth state change listener
- `src/app/api/check-admin-status/route.ts:28-35` - Session validation

---

## Notlar

- Supabase SSR cookie management karmaşık olabilir
- Next.js 13+ App Router'da cookie handling farklı çalışabilir
- Production'da cookie domain/path ayarları farklı olabilir
- Vercel'de cookie'ler farklı davranabilir

