# Veri Akışı ve İş Rotası Dokümantasyonu

**Tarih:** 2025-01-XX  
**Amaç:** Sistemdeki veri akışlarını, iş rotalarını ve tablo ilişkilerini detaylı olarak açıklamak

---

## 📋 İçindekiler

1. [Formdan Müşteri Oluşturma (Lead)](#1-formdan-müşteri-oluşturma-lead)
2. [Admin Panelden Müşteri Oluşturma](#2-admin-panelden-müşteri-oluşturma)
3. [Admin Oluşturma](#3-admin-oluşturma)
4. [Belge Yükleme](#4-belge-yükleme)
5. [Case Güncelleme](#5-case-güncelleme)
6. [Checklist Güncelleme](#6-checklist-güncelleme)
7. [Case Stage Güncelleme](#7-case-stage-güncelleme)
8. [Portal'da Veri Görüntüleme](#8-portalda-veri-görüntüleme)
9. [Admin Atama](#9-admin-atama)

---

## 1. Formdan Müşteri Oluşturma (Lead)

### 🎯 Amaç
Web sitesindeki formdan gelen müşteri bilgilerini sisteme kaydetmek ve otomatik olarak case oluşturmak.

### 📍 Rota
**API:** `POST /api/create-lead`  
**Component:** `src/components/forms/contact-form.tsx`  
**Sayfa:** Ana sayfa formu

### 🔄 İş Akışı

```
1. Kullanıcı Formu Doldurur
   ↓
2. POST /api/create-lead
   ↓
3. Dosya Takip Numarası Üretilir
   ↓
4. customers Tablosuna Kayıt
   ↓
5. auth.users Tablosuna Kullanıcı Oluşturulur
   ↓
6. user_auth Tablosuna Kayıt
   ↓
7. cases Tablosuna Case Oluşturulur
   ↓
8. Sonuç Döndürülür
```

### 📊 Tablo İşlemleri

#### **customers** Tablosu
```sql
INSERT INTO customers (
  full_name,           -- Formdan: adSoyad
  email,               -- Formdan: email VEYA telefon@deger360.net
  phone,               -- Formdan: telefon
  dosya_takip_numarasi -- Otomatik: 546179'den başlayarak artan
)
```

**Örnek Veri:**
- `full_name`: "Ahmet Yılmaz"
- `email`: "5551234567@deger360.net" (telefon yoksa)
- `phone`: "0555 123 45 67"
- `dosya_takip_numarasi`: "546179" (otomatik artan)

#### **auth.users** Tablosu (Supabase Auth)
```javascript
supabaseAdmin.auth.admin.createUser({
  email: email,                    // customers.email ile aynı
  password: password,              // soyisim.son4rakam formatında
  email_confirm: true             // Otomatik onaylanır
})
```

**Şifre Formatı:**
- `password`: `${soyisim}.${telefonSon4Rakam}`
- Örnek: "yılmaz.4567"

#### **user_auth** Tablosu
```sql
INSERT INTO user_auth (
  id,              -- auth.users.id ile aynı
  customer_id,     -- customers.id
  role             -- 'customer'
)
```

#### **cases** Tablosu
```sql
INSERT INTO cases (
  customer_id,              -- customers.id
  case_number,              -- DK-2025-179 formatında
  status,                    -- 'active'
  vehicle_plate,            -- 'BELİRTİLMEDİ'
  vehicle_brand_model,       -- Formdan: aracMarkaModel
  accident_date,            -- Bugünün tarihi (placeholder)
  damage_amount,            -- Formdan: hasarTutari
  board_stage               -- 'basvuru_alindi'
)
```

**Case Numarası Formatı:**
- `case_number`: `DK-${YIL}-${dosyaTakipNo.slice(-3)}`
- Örnek: "DK-2025-179"

### 🔗 İlişkiler

```
customers (1) ──┐
                ├──> cases (1)
auth.users (1) ─┘
                └──> user_auth (1) ──> customers (1)
```

### 📤 Sonuç

```json
{
  "success": true,
  "customer": { /* customers kaydı */ },
  "case": { /* cases kaydı */ },
  "credentials": {
    "dosyaTakipNo": "546179",
    "password": "yılmaz.4567",
    "email": "5551234567@deger360.net"
  }
}
```

### ⚠️ Hata Durumları

1. **Email zaten varsa:** Timestamp eklenerek tekrar denenir
2. **Auth kullanıcı oluşturma hatası:** `customers` kaydı silinir (rollback)
3. **user_auth oluşturma hatası:** `customers` ve `auth.users` silinir (rollback)

---

## 2. Admin Panelden Müşteri Oluşturma

### 🎯 Amaç
Admin panel üzerinden detaylı müşteri bilgileri ile müşteri ve case oluşturmak.

### 📍 Rota
**API:** `POST /api/create-customer`  
**Component:** `src/components/admin/add-customer-modal.tsx`  
**Sayfa:** Admin panel müşteri ekleme modalı

### 🔄 İş Akışı

```
1. Admin Modalı Açar ve Formu Doldurur
   ↓
2. Belge Dosyaları Base64'e Dönüştürülür
   ↓
3. POST /api/create-customer
   ↓
4. Dosya Takip Numarası Üretilir
   ↓
5. customers Tablosuna Kayıt
   ↓
6. cases Tablosuna Case Oluşturulur
   ↓
7. auth.users Tablosuna Kullanıcı Oluşturulur
   ↓
8. user_auth Tablosuna Kayıt
   ↓
9. Belgeler Supabase Storage'a Yüklenir
   ↓
10. documents Tablosuna Kayıtlar
   ↓
11. Sonuç Döndürülür
```

### 📊 Tablo İşlemleri

#### **customers** Tablosu
```sql
INSERT INTO customers (
  full_name,              -- Formdan
  email,                  -- Formdan
  phone,                  -- Formdan (opsiyonel)
  address,                -- Formdan (opsiyonel)
  tc_kimlik,             -- Formdan (opsiyonel)
  iban,                   -- Formdan (opsiyonel)
  payment_person_name,    -- Formdan (opsiyonel)
  dosya_takip_numarasi    -- Otomatik: 546179'den başlayarak artan
)
```

#### **cases** Tablosu
```sql
INSERT INTO cases (
  customer_id,            -- customers.id
  case_number,            -- DK-2025-179 formatında
  status,                 -- 'active'
  vehicle_plate,         -- Formdan
  vehicle_brand_model,    -- Formdan
  accident_date,          -- Formdan
  accident_location,      -- Formdan (opsiyonel)
  board_stage             -- 'basvuru_alindi'
)
```

#### **auth.users** Tablosu
```javascript
supabaseAdmin.auth.admin.createUser({
  email: customerData.email,
  password: `${plaka}.${soyisim}`,  // plaka.soyisim formatında
  email_confirm: true
})
```

**Şifre Formatı:**
- `password`: `${plaka}.${soyisim}`
- Örnek: "34abc123.yılmaz"

#### **user_auth** Tablosu
```sql
INSERT INTO user_auth (
  id,          -- auth.users.id
  customer_id, -- customers.id
  role         -- 'customer'
)
```

#### **documents** Tablosu (Her belge için)
```sql
INSERT INTO documents (
  case_id,        -- cases.id
  name,            -- Dosya adı
  file_path,       -- Storage path: documents/{caseId}/{category}/{timestamp}_{random}_{filename}
  file_size,       -- Dosya boyutu
  file_type,       -- MIME type
  category,        -- Belge kategorisi
  uploaded_by,     -- 'admin'
  uploaded_by_name -- 'Admin'
)
```

**Storage Yapısı:**
```
documents/
  └── {caseId}/
      └── {category}/
          └── {timestamp}_{random}_{filename}
```

**Örnek:**
```
documents/
  └── abc123-def456-ghi789/
      ├── kaza_tespit_tutanagi/
      │   └── 1704067200000_x7k9m2_kaza_tespit.pdf
      ├── arac_fotograflari/
      │   └── 1704067201000_p3q8n1_arac_1.jpg
      └── ruhsat_fotokopisi/
          └── 1704067202000_m5r2t4_ruhsat.pdf
```

### 🔗 İlişkiler

```
customers (1) ──┐
                ├──> cases (1) ──> documents (N)
auth.users (1) ─┘
                └──> user_auth (1) ──> customers (1)
```

### 📤 Sonuç

```json
{
  "success": true,
  "customer": { /* customers kaydı */ },
  "case": { /* cases kaydı */ },
  "credentials": {
    "dosyaTakipNo": "546179",
    "password": "34abc123.yılmaz"
  },
  "uploadedDocuments": ["kaza_tespit.pdf", "arac_1.jpg"]
}
```

---

## 3. Admin Oluşturma

### 🎯 Amaç
Superadmin tarafından yeni admin, avukat veya acente kullanıcısı oluşturmak.

### 📍 Rota
**API:** `POST /api/create-admin`  
**Component:** `src/app/admin/admin-olustur/page.tsx`  
**Yetki:** Sadece `superadmin` rolü

### 🔄 İş Akışı

```
1. Superadmin Formu Doldurur
   ↓
2. Yetki Kontrolü (superadmin mi?)
   ↓
3. POST /api/create-admin
   ↓
4. auth.users Tablosuna Kullanıcı Oluşturulur
   ↓
5. user_auth Tablosuna Kayıt (customer_id = null)
   ↓
6. Sonuç Döndürülür
```

### 📊 Tablo İşlemleri

#### **auth.users** Tablosu
```javascript
supabaseAdmin.auth.admin.createUser({
  email: email.trim(),
  password: password,      // Minimum 6 karakter
  email_confirm: true      // Otomatik onaylanır
})
```

#### **user_auth** Tablosu
```sql
INSERT INTO user_auth (
  id,          -- auth.users.id
  customer_id, -- NULL (admin'lerin customer_id'si yok)
  role,        -- 'admin', 'lawyer', veya 'acente'
  name         -- Admin adı
)
```

**Önemli Fark:**
- Müşteriler: `customer_id` dolu, `role = 'customer'`
- Adminler: `customer_id = NULL`, `role = 'admin'|'lawyer'|'acente'`

### 🔗 İlişkiler

```
auth.users (1) ──> user_auth (1)
                      └──> customer_id = NULL
```

### 📤 Sonuç

```json
{
  "success": true,
  "message": "Admin created successfully",
  "user": {
    "id": "uuid",
    "name": "Ahmet Admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### ⚠️ Hata Durumları

1. **Yetki hatası:** Sadece superadmin admin oluşturabilir
2. **Email zaten varsa:** Hata döner
3. **user_auth oluşturma hatası:** `auth.users` silinir (rollback)

---

## 4. Belge Yükleme

### 🎯 Amaç
Admin tarafından bir case'e belge yüklemek.

### 📍 Rota
**API:** `POST /api/upload-document`  
**Component:** Admin panel case detay sayfası  
**Yetki:** `superadmin`, `admin`, `lawyer`

### 🔄 İş Akışı

```
1. Admin Belge Seçer ve Kategori Seçer
   ↓
2. POST /api/upload-document (FormData)
   ↓
3. Yetki Kontrolü
   ↓
4. Case Erişim Kontrolü (case_admins)
   ↓
5. Dosya Supabase Storage'a Yüklenir
   ↓
6. documents Tablosuna Kayıt
   ↓
7. Sonuç Döndürülür
```

### 📊 Tablo İşlemleri

#### **documents** Tablosu
```sql
INSERT INTO documents (
  case_id,         -- Hangi case'e ait
  name,             -- Dosya adı
  category,         -- Belge kategorisi
  file_path,        -- Storage path
  file_size,         -- Dosya boyutu
  file_type,         -- MIME type
  uploaded_by,      -- user.id
  uploaded_by_name   -- user_auth.name
)
```

**Storage Path Formatı:**
```
documents/{caseId}/{category}/{timestamp}_{random}_{sanitizedFileName}
```

**Örnek:**
```
documents/abc123-def456/kaza_tespit_tutanagi/1704067200000_x7k9m2_kaza_tespit.pdf
```

### 🔗 İlişkiler

```
cases (1) ──> documents (N)
user_auth (1) ──> documents.uploaded_by (N)
```

### 📤 Sonuç

```json
{
  "documents": [
    {
      "id": "uuid",
      "case_id": "uuid",
      "name": "kaza_tespit.pdf",
      "file_path": "documents/...",
      "category": "kaza_tespit_tutanagi",
      "uploaded_by": "admin-user-id",
      "uploaded_by_name": "Ahmet Admin"
    }
  ]
}
```

### ⚠️ Yetkilendirme

1. **Superadmin:** Tüm case'lere erişebilir
2. **Admin/Lawyer:** Sadece `case_admins` tablosunda atanmış case'lere erişebilir
3. **Acente:** Belge yükleyemez

---

## 5. Case Güncelleme

### 🎯 Amaç
Case ve müşteri bilgilerini güncellemek, admin atamalarını yönetmek.

### 📍 Rota
**API:** `POST /api/update-case`  
**Component:** `src/components/admin/case-tabs/general-info-tab.tsx`  
**Yetki:** `superadmin`, `admin`, `lawyer`

### 🔄 İş Akışı

```
1. Admin Case Bilgilerini Günceller
   ↓
2. POST /api/update-case
   ↓
3. Yetki Kontrolü
   ↓
4. Case Erişim Kontrolü
   ↓
5. customers Tablosu Güncellenir (opsiyonel)
   ↓
6. cases Tablosu Güncellenir (opsiyonel)
   ↓
7. case_admins Tablosu Güncellenir (opsiyonel, sadece superadmin)
   ↓
8. Sonuç Döndürülür
```

### 📊 Tablo İşlemleri

#### **customers** Tablosu (Opsiyonel)
```sql
UPDATE customers
SET 
  full_name = ?,
  email = ?,
  phone = ?,
  address = ?,
  tc_kimlik = ?,
  iban = ?,
  payment_person_name = ?,
  dosya_takip_numarasi = ?  -- Otomatik üretilebilir
WHERE id = ?
```

**Email Değişikliği:**
- Eğer email değişirse, `auth.users` tablosundaki email de güncellenir

#### **cases** Tablosu (Opsiyonel)
```sql
UPDATE cases
SET 
  vehicle_plate = ?,
  vehicle_brand_model = ?,
  accident_date = ?,
  accident_location = ?,
  damage_amount = ?,
  value_loss_amount = ?,
  fault_rate = ?,
  estimated_compensation = ?,
  commission_rate = ?,
  assigned_lawyer = ?,
  -- ... diğer alanlar
WHERE id = ?
```

#### **case_admins** Tablosu (Sadece Superadmin)
```sql
-- Eski atamaları sil
DELETE FROM case_admins WHERE case_id = ?

-- Yeni atamaları ekle
INSERT INTO case_admins (case_id, admin_id)
VALUES (?, ?), (?, ?), ...
```

**Önemli:** Sadece `superadmin` admin atayabilir ve değiştirebilir.

### 🔗 İlişkiler

```
cases (1) ──> customers (1)
cases (1) ──> case_admins (N) ──> user_auth (N)
```

### 📤 Sonuç

```json
{
  "case": {
    "id": "uuid",
    "case_number": "DK-2025-179",
    "customer_id": "uuid",
    "customers": { /* güncellenmiş müşteri bilgileri */ },
    // ... diğer case bilgileri
  }
}
```

---

## 6. Checklist Güncelleme

### 🎯 Amaç
Admin checklist'teki bir görevi tamamlamak veya geri almak.

### 📍 Rota
**API:** `POST /api/update-checklist`  
**Component:** `src/components/admin/case-tabs/checklist-tab.tsx`  
**Yetki:** `superadmin`, `admin`, `lawyer`

### 🔄 İş Akışı

```
1. Admin Checklist Item'ı İşaretler/Kaldırır
   ↓
2. POST /api/update-checklist
   ↓
3. Yetki Kontrolü
   ↓
4. Case Erişim Kontrolü
   ↓
5. admin_checklist Tablosuna Upsert
   ↓
6. Tüm Checklist Item'ları Kontrol Edilir
   ↓
7. Yeni board_stage Belirlenir
   ↓
8. cases.board_stage Güncellenir
   ↓
9. Sonuç Döndürülür
```

### 📊 Tablo İşlemleri

#### **admin_checklist** Tablosu
```sql
INSERT INTO admin_checklist (
  case_id,
  task_key,        -- Örn: 'ilk_gorusme_yapildi'
  title,           -- CHECKLIST_ITEMS'den alınır
  completed,        -- true/false
  completed_at,     -- Tamamlandıysa şu anki zaman
  completed_by      -- user_auth.name veya user.email
)
ON CONFLICT (case_id, task_key)
DO UPDATE SET
  completed = ?,
  completed_at = ?,
  completed_by = ?
```

**Checklist Item'ları:**
- `src/lib/checklist-sections.ts` dosyasından tanımlanır
- Her item bir `task_key` ve `title` içerir

#### **cases** Tablosu (Otomatik)
```sql
UPDATE cases
SET board_stage = ?  -- Yeni stage belirlenir
WHERE id = ?
```

**Stage Belirleme Mantığı:**
1. Tüm checklist item'ları kontrol edilir
2. Her section için tamamlanma durumu kontrol edilir
3. İlk tamamlanmamış section'ın `boardStage` değeri alınır
4. Eğer tüm section'lar tamamlandıysa son section'ın stage'i kullanılır

**Stage'ler:**
- `basvuru_alindi` - Başvuru Alındı
- `evrak_ekspertiz` - Evrak Toplama ve Bilir Kişi
- `sigorta_basvurusu` - Sigorta Başvurusu
- `muzakere` - Müzakere
- `odeme` - Ödeme
- `tamamlandi` - Tamamlandı

### 🔗 İlişkiler

```
cases (1) ──> admin_checklist (N)
user_auth (1) ──> admin_checklist.completed_by (N)
```

### 📤 Sonuç

```json
{
  "checklistItem": {
    "id": "uuid",
    "case_id": "uuid",
    "task_key": "ilk_gorusme_yapildi",
    "title": "İlk görüşme yapıldı",
    "completed": true,
    "completed_at": "2025-01-XX...",
    "completed_by": "Ahmet Admin"
  },
  "boardStage": "evrak_ekspertiz"
}
```

---

## 7. Case Stage Güncelleme

### 🎯 Amaç
Admin board'da case'i manuel olarak bir stage'den diğerine taşımak.

### 📍 Rota
**API:** `POST /api/update-case-board-stage`  
**Component:** Admin board sayfası  
**Yetki:** `superadmin`, `admin`, `lawyer`

### 🔄 İş Akışı

```
1. Admin Board'da Case'i Sürükler/Bırakır
   ↓
2. POST /api/update-case-board-stage
   ↓
3. Yetki Kontrolü
   ↓
4. Case Erişim Kontrolü
   ↓
5. cases.board_stage Güncellenir
   ↓
6. Sonuç Döndürülür
```

### 📊 Tablo İşlemleri

#### **cases** Tablosu
```sql
UPDATE cases
SET board_stage = ?  -- Yeni stage: 'basvuru_alindi', 'evrak_ekspertiz', vb.
WHERE id = ?
```

**Stage Değerleri:**
- `basvuru_alindi`
- `evrak_ekspertiz`
- `sigorta_basvurusu`
- `muzakere`
- `odeme`
- `tamamlandi`

### 📤 Sonuç

```json
{
  "case": {
    "id": "uuid",
    "board_stage": "evrak_ekspertiz",
    // ... diğer case bilgileri
  }
}
```

---

## 8. Portal'da Veri Görüntüleme

### 🎯 Amaç
Müşteri portalında case bilgilerini, checklist'i, belgeleri ve ödemeleri görüntülemek.

### 📍 Rota
**Sayfa:** `/portal`  
**Component:** `src/app/portal/page.tsx`  
**Yetki:** Müşteri (kendi case'lerini görebilir)

### 🔄 İş Akışı

```
1. Müşteri Portal'a Giriş Yapar
   ↓
2. GET /api/get-user-cases
   ↓
3. İlk Case Seçilir veya Mevcut Case Yüklenir
   ↓
4. GET /api/get-case/[caseId]
   ↓
5. admin_checklist Verileri Yüklenir
   ↓
6. documents Verileri Yüklenir
   ↓
7. payments Verileri Yüklenir
   ↓
8. Veriler Portal'da Görüntülenir
```

### 📊 Veri Çekme İşlemleri

#### **user_auth** Tablosu
```sql
SELECT * FROM user_auth
WHERE id = ?  -- Giriş yapan kullanıcının id'si
```

#### **cases** Tablosu
```sql
SELECT * FROM cases
WHERE customer_id = ?  -- user_auth.customer_id
ORDER BY created_at DESC
```

#### **admin_checklist** Tablosu
```sql
SELECT * FROM admin_checklist
WHERE case_id = ?
```

**Checklist Merge:**
- Veritabanındaki checklist item'ları ile `CHECKLIST_ITEMS` birleştirilir
- Eksik item'lar default değerlerle eklenir

#### **documents** Tablosu
```sql
SELECT * FROM documents
WHERE case_id = ?
ORDER BY uploaded_at DESC
```

#### **payments** Tablosu
```sql
SELECT * FROM payments
WHERE case_id = ?
ORDER BY created_at DESC
```

### 🔗 İlişkiler

```
user_auth (1) ──> customers (1) ──> cases (N)
                                         ├──> admin_checklist (N)
                                         ├──> documents (N)
                                         └──> payments (N)
```

### 📤 Görüntülenen Veriler

1. **Case Bilgileri:**
   - Case numarası
   - Araç bilgileri
   - Kaza tarihi
   - Durum bilgileri

2. **Checklist İlerlemesi:**
   - Section'lar ve tamamlanma durumu
   - Her item'ın tamamlanma durumu
   - Mevcut section gösterimi

3. **Belgeler:**
   - Kategoriye göre gruplandırılmış belgeler
   - İndirme linkleri
   - Yüklenme tarihleri

4. **Ödemeler:**
   - Ödeme geçmişi
   - Ödeme tutarları
   - Ödeme durumları

---

## 9. Admin Atama

### 🎯 Amaç
Bir case'i belirli admin'lere atamak (sadece superadmin).

### 📍 Rota
**API:** `POST /api/update-case` (adminIds parametresi ile)  
**Component:** Admin panel case detay sayfası  
**Yetki:** Sadece `superadmin`

### 🔄 İş Akışı

```
1. Superadmin Admin Seçer
   ↓
2. POST /api/update-case (adminIds ile)
   ↓
3. Superadmin Kontrolü
   ↓
4. case_admins Tablosundaki Eski Atamalar Silinir
   ↓
5. Yeni Admin Atamaları Eklenir
   ↓
6. Sonuç Döndürülür
```

### 📊 Tablo İşlemleri

#### **case_admins** Tablosu
```sql
-- Eski atamaları temizle
DELETE FROM case_admins
WHERE case_id = ?

-- Yeni atamaları ekle
INSERT INTO case_admins (case_id, admin_id)
VALUES 
  (?, ?),  -- case_id, admin_id
  (?, ?),
  ...
```

**Önemli:**
- Eğer `adminIds` boş array ise, tüm atamalar kaldırılır
- Sadece `superadmin` bu işlemi yapabilir
- Diğer admin'ler sadece kendilerine atanmış case'leri görebilir

### 🔗 İlişkiler

```
cases (1) ──> case_admins (N) ──> auth.users (N)
                                      └──> user_auth (1)
```

### 📤 Sonuç

```json
{
  "case": {
    "id": "uuid",
    // ... case bilgileri
  }
}
```

**Not:** Admin atamaları response'da dönmez, sadece case bilgileri döner.

---

## 🔐 Yetkilendirme Matrisi

| İşlem | Superadmin | Admin | Lawyer | Acente | Customer |
|-------|-----------|-------|--------|--------|----------|
| Müşteri Oluşturma | ✅ | ✅ | ✅ | ❌ | ❌ |
| Admin Oluşturma | ✅ | ❌ | ❌ | ❌ | ❌ |
| Case Görüntüleme | ✅ (Tümü) | ✅ (Atanan) | ✅ (Atanan) | ❌ | ✅ (Kendi) |
| Case Güncelleme | ✅ (Tümü) | ✅ (Atanan) | ✅ (Atanan) | ❌ | ❌ |
| Admin Atama | ✅ | ❌ | ❌ | ❌ | ❌ |
| Belge Yükleme | ✅ (Tümü) | ✅ (Atanan) | ✅ (Atanan) | ❌ | ❌ |
| Checklist Güncelleme | ✅ (Tümü) | ✅ (Atanan) | ✅ (Atanan) | ❌ | ❌ |
| Stage Güncelleme | ✅ (Tümü) | ✅ (Atanan) | ✅ (Atanan) | ❌ | ❌ |

---

## 📈 Veri Akış Şeması

```
┌─────────────────┐
│   Web Form      │
│  (create-lead)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   customers      │◄──┐
└────────┬────────┘   │
         │            │
         ▼            │
┌─────────────────┐   │
│     cases       │───┘
└────────┬────────┘
         │
         ├──► admin_checklist
         ├──► documents
         └──► payments

┌─────────────────┐
│  Admin Panel    │
│ (create-customer)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   customers      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     cases       │
└────────┬────────┘
         │
         ├──► documents (Storage)
         └──► admin_checklist

┌─────────────────┐
│  Admin Panel    │
│  (create-admin) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   auth.users    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   user_auth     │
└─────────────────┘

┌─────────────────┐
│  Admin Panel    │
│ (update-case)   │
└────────┬────────┘
         │
         ├──► customers (UPDATE)
         ├──► cases (UPDATE)
         └──► case_admins (UPDATE)

┌─────────────────┐
│  Admin Panel    │
│(update-checklist)│
└────────┬────────┘
         │
         ├──► admin_checklist (UPSERT)
         └──► cases.board_stage (UPDATE)
```

---

## 🎯 Özet Tablo İlişkileri

### Ana İlişkiler

```
customers (1) ──> cases (N)
cases (1) ──> admin_checklist (N)
cases (1) ──> documents (N)
cases (1) ──> payments (N)
cases (1) ──> case_admins (N)
case_admins (N) ──> auth.users (N)
auth.users (1) ──> user_auth (1)
user_auth (1) ──> customers (1) [opsiyonel, sadece müşteriler için]
```

### Kritik Noktalar

1. **Her müşterinin mutlaka bir case'i vardır**
2. **Her case'in mutlaka bir customer'ı vardır**
3. **Admin'lerin customer_id'si NULL'dur**
4. **Checklist güncellemesi otomatik olarak board_stage'i günceller**
5. **Admin atamaları sadece superadmin tarafından yapılabilir**
6. **Belgeler hem veritabanında hem de Supabase Storage'da saklanır**

---

**Not:** Bu dokümantasyon sistemin mevcut durumunu yansıtmaktadır. Kod tabanı değişiklikleri bu belgeyi güncelleyebilir.
