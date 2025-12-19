# 🐛 BEYAZ EKRAN SORUNU - DETAYLI PROBLEM RAPORU

## 📋 ÖZET

Next.js 14 uygulamasında portal sayfaları açıldığında tamamen beyaz ekran görünüyor. Sayfa render edilemiyor ve kullanıcı etkileşimi mümkün değil. Test sayfası (`/test`) çalışıyor, bu da temel React/Next.js'in çalıştığını gösteriyor.

---

## 🔴 ANA SORUN: Supabase Client Environment Variables Yüklenemiyor

### Hata Mesajı (Browser Console):
```
Uncaught Error: supabaseKey is required.
    at new SupabaseClient (index.mjs:200:1)
    at createClient (index.mjs:390:1)
    at eval (client.ts:12:42)
```

### Sorunlu Kod Dosyası: `src/lib/supabase/client.ts`

```typescript
// Browser/Client-side Supabase client
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,      // ❌ undefined geliyor
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // ❌ undefined geliyor
);
```

**Problem:** `process.env.NEXT_PUBLIC_SUPABASE_URL` ve `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` değerleri `undefined` geliyor, bu yüzden Supabase client oluşturulamıyor ve sayfa crash ediyor.

---

## 🔍 İLGİLİ KOD PARÇALARI

### 1. Supabase Client (`src/lib/supabase/client.ts`)

```typescript
import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Browser/Client-side Supabase client
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,      // ⚠️ SORUN BURADA
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!  // ⚠️ SORUN BURADA
);

// Server-side Supabase client (admin privileges)
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
```

**Sorun:** Client-side'da `process.env` kullanımı Next.js'te özel bir yaklaşım gerektirir. `NEXT_PUBLIC_` prefix'i olan değişkenler build-time'da inject edilir, ancak burada düzgün çalışmıyor.

---

### 2. Auth Functions (`src/lib/supabase/auth.ts`)

```typescript
import { supabase } from './client';  // ⚠️ Bu import başarısız oluyor

export async function loginWithCaseNumber(caseNumber: string, password: string) {
  // İlk olarak case number ile müşteriyi bul
  const { data: caseData, error: caseError } = await supabase  // ❌ supabase undefined
    .from('cases')
    .select('customer_id, customers(email)')
    .eq('case_number', caseNumber)
    .single();
  // ...
}
```

**Sorun:** `client.ts`'den import edilen `supabase` undefined olduğu için tüm auth fonksiyonları çalışmıyor.

---

### 3. Portal Giriş Sayfası (`src/app/portal/giris/page.tsx`)

```typescript
'use client';

import { loginWithCaseNumber } from '@/lib/supabase/auth';  // ⚠️ Import başarısız

export default function GirisPage() {
  // ...
  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginWithCaseNumber(data.dosyaTakipNumarasi, data.sifre);  // ❌ Crash
      router.push('/portal');
    } catch (error: any) {
      setError('Giriş başarısız...');
    }
  };
  // ...
}
```

**Sorun:** Sayfa yüklenirken `auth.ts` import ediliyor, bu da `client.ts`'i import ediyor ve Supabase client oluşturulmaya çalışılıyor. Environment variable'lar yoksa client oluşturulamıyor ve sayfa render edilemiyor.

---

### 4. Middleware (`src/middleware.ts`)

```typescript
export async function middleware(req: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,      // ⚠️ Server-side'da çalışıyor mu?
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,  // ⚠️ Server-side'da çalışıyor mu?
    {
      cookies: { /* ... */ }
    }
  );
  // ...
}
```

**Not:** Middleware server-side çalıştığı için burada sorun olmayabilir, ancak kontrol edilmeli.

---

### 5. Environment Variables (`.env.local`)

**Dosya Konumu:** Proje kök dizininde `.env.local`

**Beklenen Format:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Kontrol Edilmesi Gerekenler:**
- ✅ Dosya mevcut mu?
- ✅ `=` işaretinden önce/sonra boşluk var mı? (OLMAMALI)
- ✅ Tırnak işareti kullanılmış mı? (OLMAMALI)
- ✅ Key'ler tam mı? (200+ karakter olmalı)
- ✅ Server yeniden başlatıldı mı? (Environment variables sadece server başlangıcında yüklenir)

---

## 🧪 TEST SONUÇLARI

### ✅ Çalışan Sayfa: `/test`
- Inline styles ile yazılmış basit bir test sayfası
- React render çalışıyor
- Next.js routing çalışıyor
- **Sonuç:** Temel sistem sağlıklı

### ❌ Çalışmayan Sayfa: `/portal/giris`
- Supabase import eden sayfa
- Beyaz ekran görünüyor
- Console'da "supabaseKey is required" hatası
- **Sonuç:** Supabase client oluşturulamıyor

---

## 🔧 OLASI ÇÖZÜMLER

### Çözüm 1: Environment Variables Kontrolü
- `.env.local` dosyasının formatını kontrol et
- Server'ı tamamen durdurup yeniden başlat
- Next.js cache'ini temizle (`.next` klasörünü sil)

### Çözüm 2: Client-Side Environment Variable Erişimi
Next.js'te client-side'da environment variable'lara erişim için özel bir yaklaşım gerekebilir:

```typescript
// Örnek çözüm (kontrol edilmeli)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are missing!');
  // Fallback veya error handling
}
```

### Çözüm 3: Dynamic Import veya Lazy Loading
Supabase client'ı lazy load ederek sayfa yüklenmesini engellemeyi önle:

```typescript
// Örnek yaklaşım
let supabase: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (!supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      throw new Error('Supabase credentials not configured');
    }
    
    supabase = createBrowserClient(url, key);
  }
  return supabase;
}
```

### Çözüm 4: Error Boundary
Sayfa seviyesinde error boundary ekleyerek crash'i yakala ve kullanıcıya anlamlı bir mesaj göster.

---

## 📊 EK BİLGİLER

### Teknoloji Stack:
- Next.js 14.2.35
- React 18.3.1
- TypeScript 5.2.2
- Supabase (@supabase/ssr 0.8.0, @supabase/supabase-js 2.89.0)
- Tailwind CSS 3.4.19

### Browser Console Hataları:
1. `Uncaught Error: supabaseKey is required` (Ana sorun)
2. `Warning: An error occurred during hydration` (Hydration hatası)
3. `Failed to load resource: 404` (CSS/JS dosyaları - ikincil sorun)

### Network Tab:
- CSS dosyaları: 404 (layout.css)
- JS chunk dosyaları: 404 (main-app.js, page.js)
- **Not:** Bu 404'ler muhtemelen Supabase hatası yüzünden sayfa render edilemediği için oluşuyor

---

## 🎯 SORULACAK SORULAR (Senior Developer İçin)

1. **Environment Variables:** Next.js 14'te client-side'da `NEXT_PUBLIC_` prefix'li environment variable'lara nasıl erişilmeli? Build-time vs runtime farkı nedir?

2. **Supabase Client Initialization:** `@supabase/ssr` paketinde `createBrowserClient` kullanımı doğru mu? Alternatif yaklaşımlar var mı?

3. **Error Handling:** Supabase client oluşturulamadığında sayfanın crash etmesini nasıl önleyebiliriz? Graceful degradation mümkün mü?

4. **Module Resolution:** Import chain (`page.tsx` → `auth.ts` → `client.ts`) başarısız olduğunda Next.js'in davranışı nedir? Neden sayfa render edilemiyor?

5. **Build Process:** `.env.local` dosyasındaki değişikliklerin Next.js dev server'a yansıması için ne gerekiyor? Cache sorunları nasıl çözülür?

---

## 📝 SONUÇ

Ana sorun: **Supabase client oluşturulurken environment variable'lar undefined geliyor ve bu yüzden sayfa render edilemiyor.**

İlk adım olarak:
1. `.env.local` dosyasının formatını kontrol et
2. Server'ı tamamen durdurup yeniden başlat
3. Next.js cache'ini temizle
4. Browser cache'ini temizle

Eğer sorun devam ederse, client-side environment variable erişim yaklaşımını gözden geçir.
