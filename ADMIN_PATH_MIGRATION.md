# Admin Path Migration Guide

Admin paneli URL'si gizli bir path'e taşındı. Bu dokümantasyon migration sürecini açıklar.

## 🔒 Yeni Admin Path

**Eski Path:** `/admin`  
**Yeni Path:** `/sys-admin-panel-secure-7x9k2m`

## ✅ Yapılan Değişiklikler

### 1. Admin Path Configuration
- `src/lib/config/admin-paths.ts` dosyası oluşturuldu
- Tüm admin route'ları merkezi bir yerden yönetiliyor
- Path değiştirmek için sadece bu dosyayı güncellemek yeterli

### 2. Next.js Rewrites
- `vercel.json` dosyasına rewrite eklendi
- `/sys-admin-panel-secure-7x9k2m/*` → `/admin/*` yönlendirmesi yapılıyor
- Klasör yapısı değişmedi, sadece URL gizlendi

### 3. Tüm Referanslar Güncellendi
- Layout navigation links
- Router push'lar
- Link href'leri
- Conditional layout checks
- Robots.txt

## 📝 Kullanım

### Admin Routes Helper

```typescript
import { adminRoutes } from '@/lib/config/admin-paths';

// Dashboard
adminRoutes.dashboard // /sys-admin-panel-secure-7x9k2m

// Login
adminRoutes.login // /sys-admin-panel-secure-7x9k2m/giris

// Customers
adminRoutes.customers // /sys-admin-panel-secure-7x9k2m/musteriler
adminRoutes.customerDetail('case-id') // /sys-admin-panel-secure-7x9k2m/musteriler/case-id

// Reports
adminRoutes.reports // /sys-admin-panel-secure-7x9k2m/raporlar

// Admins
adminRoutes.admins // /sys-admin-panel-secure-7x9k2m/adminler
adminRoutes.adminDetail('admin-id') // /sys-admin-panel-secure-7x9k2m/adminler/admin-id

// Create Admin
adminRoutes.createAdmin // /sys-admin-panel-secure-7x9k2m/admin-olustur
```

### Path Check

```typescript
import { isAdminPath } from '@/lib/config/admin-paths';

if (isAdminPath(pathname)) {
  // Admin path
}
```

## 🔐 Güvenlik

### Robots.txt
- Hem `/admin/` hem de gizli path disallow edildi
- Bot'lar admin panelini bulamaz

### Middleware
- Admin path kontrolü yapılıyor
- Conditional layout admin path'i gizliyor

### URL Obfuscation
- Gizli path bot'lar ve müşteriler tarafından bulunamaz
- Rastgele karakterler içeriyor
- Düzenli olarak değiştirilebilir

## 🔄 Path Değiştirme

Path'i değiştirmek için:

1. `src/lib/config/admin-paths.ts` dosyasını açın
2. `ADMIN_PATH` değişkenini yeni path ile değiştirin
3. `vercel.json` dosyasındaki rewrite'ı güncelleyin
4. `src/app/api/robots/route.ts` dosyasını güncelleyin

**Örnek:**
```typescript
// src/lib/config/admin-paths.ts
export const ADMIN_PATH = '/yeni-gizli-path-xyz123';
```

```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/yeni-gizli-path-xyz123/:path*",
      "destination": "/admin/:path*"
    }
  ]
}
```

## ⚠️ Önemli Notlar

1. **Klasör Yapısı**: Klasör yapısı değişmedi (`src/app/admin/` hala mevcut)
2. **Internal Routes**: İçeride hala `/admin` kullanılıyor (rewrite sayesinde)
3. **External Access**: Dışarıdan sadece gizli path ile erişilebilir
4. **Bookmarks**: Eski bookmark'lar çalışmaz, yeni path kullanılmalı

## 🚀 Deployment Sonrası

1. Yeni admin path'i not edin
2. Admin kullanıcılarına yeni path'i bildirin
3. Bookmark'ları güncelleyin
4. Eski `/admin` path'ine erişim olmayacağını doğrulayın

## 📞 Support

Sorularınız için:
- Configuration: `src/lib/config/admin-paths.ts`
- Rewrites: `vercel.json`
- Robots: `src/app/api/robots/route.ts`

