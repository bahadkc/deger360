# Supabase Tam Kopyalama Rehberi

Bu dokümantasyon, mevcut production Supabase projenizin tam bir kopyasını oluşturmanız için gereken tüm bilgileri içerir. Bu rehberi kullanarak staging ortamında yeni bir Supabase projesi oluşturabilir ve tüm yapıyı sıfırdan kurabilirsiniz.

## 📋 İçindekiler

1. [Mevcut Proje Bilgileri](#mevcut-proje-bilgileri)
2. [Yeni Proje Oluşturma](#yeni-proje-oluşturma)
3. [Migration Dosyaları ve Sıralaması](#migration-dosyaları-ve-sıralaması)
4. [Adım Adım Kurulum](#adım-adım-kurulum)
5. [Doğrulama](#doğrulama)

---

## 🔍 Mevcut Proje Bilgileri

### Production Supabase Projesi
- **Project URL**: `https://bhioihqwcnkqysuhasuh.supabase.co`
- **Project Reference**: `bhioihqwcnkqysuhasuh`

### API Keys (Yeni projede kendi key'lerinizi alacaksınız)
- **Anon Key**: Legacy anon key mevcut
- **Publishable Key**: `sb_publishable_vHIXiHVJvQP18xY72K9QnQ_3jfGD0v5`

---

## 🗄️ Veritabanı Yapısı

### Tablolar

#### 1. `customers` - Müşteriler
```sql
- id (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- email (TEXT, UNIQUE, NOT NULL)
- phone (TEXT, NULLABLE)
- full_name (TEXT, NOT NULL)
- address (TEXT, NULLABLE)
- tc_kimlik (TEXT, NULLABLE)
- dosya_takip_numarasi (TEXT, UNIQUE, NULLABLE)
- iban (TEXT, NULLABLE)
- payment_person_name (TEXT, NULLABLE)
- insurance_company (TEXT, NULLABLE, COMMENT: 'Müşterinin sigorta şirketi adı')
- created_at (TIMESTAMPTZ, DEFAULT NOW())
- updated_at (TIMESTAMPTZ, DEFAULT NOW())
```

**Indexes:**
- `customers_pkey` (PRIMARY KEY on id)
- `customers_email_key` (UNIQUE on email)
- `customers_dosya_takip_numarasi_key` (UNIQUE on dosya_takip_numarasi)
- `idx_customers_dosya_takip_numarasi` (on dosya_takip_numarasi)

#### 2. `cases` - Dosyalar/Davalar
```sql
- id (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- customer_id (UUID, REFERENCES customers(id) ON DELETE CASCADE)
- case_number (TEXT, UNIQUE, NOT NULL)
- status (TEXT, NOT NULL, DEFAULT 'active')
- vehicle_plate (TEXT, NOT NULL)
- vehicle_brand_model (TEXT, NOT NULL)
- accident_date (DATE, NOT NULL)
- accident_location (TEXT, NULLABLE)
- damage_amount (DECIMAL(10,2), NULLABLE)
- value_loss_amount (DECIMAL(10,2), NULLABLE)
- fault_rate (INTEGER, DEFAULT 0)
- estimated_compensation (DECIMAL(10,2), NULLABLE)
- commission_rate (INTEGER, DEFAULT 20)
- current_stage (TEXT, DEFAULT 'başvuru')
- assigned_lawyer (TEXT, NULLABLE)
- start_date (TIMESTAMPTZ, DEFAULT NOW())
- estimated_completion_date (TIMESTAMPTZ, NULLABLE)
- completion_date (TIMESTAMPTZ, NULLABLE)
- board_stage (TEXT, DEFAULT 'basvuru_alindi')
- total_payment_amount (DECIMAL(10,2), NULLABLE)
- notary_and_file_expenses (DECIMAL(10,2), DEFAULT 0, COMMENT: 'Noter ve dosya masrafları tutarı (TL)')
- created_at (TIMESTAMPTZ, DEFAULT NOW())
- updated_at (TIMESTAMPTZ, DEFAULT NOW())
```

**Indexes:**
- `cases_pkey` (PRIMARY KEY on id)
- `cases_case_number_key` (UNIQUE on case_number)
- `idx_cases_customer_id` (on customer_id)
- `idx_cases_case_number` (on case_number)
- `idx_cases_board_stage` (on board_stage)

#### 3. `documents` - Belgeler
```sql
- id (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- case_id (UUID, REFERENCES cases(id) ON DELETE CASCADE)
- name (TEXT, NOT NULL)
- file_path (TEXT, NOT NULL)
- file_size (INTEGER, NULLABLE)
- file_type (TEXT, NULLABLE)
- category (TEXT, NOT NULL)
- status (TEXT, DEFAULT 'pending')
- uploaded_by (TEXT, DEFAULT 'customer')
- uploaded_by_name (TEXT, NULLABLE)
- uploaded_at (TIMESTAMPTZ, DEFAULT NOW())
- description (TEXT, NULLABLE)
- notes (TEXT, NULLABLE)
- created_at (TIMESTAMPTZ, DEFAULT NOW())
- updated_at (TIMESTAMPTZ, DEFAULT NOW())
```

**Indexes:**
- `documents_pkey` (PRIMARY KEY on id)
- `idx_documents_case_id` (on case_id)

#### 4. `process_steps` - Süreç Adımları
```sql
- id (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- case_id (UUID, REFERENCES cases(id) ON DELETE CASCADE)
- step_order (INTEGER, NOT NULL)
- title (TEXT, NOT NULL)
- description (TEXT, NULLABLE)
- status (TEXT, DEFAULT 'waiting')
- start_date (TIMESTAMPTZ, NULLABLE)
- end_date (TIMESTAMPTZ, NULLABLE)
- duration_days (INTEGER, NULLABLE)
- completed_tasks (TEXT[], NULLABLE)
- missing_items (TEXT[], NULLABLE)
- created_at (TIMESTAMPTZ, DEFAULT NOW())
- updated_at (TIMESTAMPTZ, DEFAULT NOW())
- UNIQUE(case_id, step_order)
```

**Indexes:**
- `process_steps_pkey` (PRIMARY KEY on id)
- `process_steps_case_id_step_order_key` (UNIQUE on case_id, step_order)
- `idx_process_steps_case_id` (on case_id)

#### 5. `customer_tasks` - Müşteri Görevleri
```sql
- id (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- case_id (UUID, REFERENCES cases(id) ON DELETE CASCADE)
- title (TEXT, NOT NULL)
- description (TEXT, NULLABLE)
- task_type (TEXT, NOT NULL)
- status (TEXT, DEFAULT 'pending')
- completed (BOOLEAN, DEFAULT FALSE)
- completed_at (TIMESTAMPTZ, NULLABLE)
- related_document_id (UUID, REFERENCES documents(id) ON DELETE SET NULL)
- deadline (TIMESTAMPTZ, NULLABLE)
- urgent (BOOLEAN, DEFAULT FALSE)
- created_at (TIMESTAMPTZ, DEFAULT NOW())
- updated_at (TIMESTAMPTZ, DEFAULT NOW())
```

**Indexes:**
- `customer_tasks_pkey` (PRIMARY KEY on id)
- `idx_customer_tasks_case_id` (on case_id)

#### 6. `activities` - Aktiviteler
```sql
- id (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- case_id (UUID, REFERENCES cases(id) ON DELETE CASCADE)
- type (TEXT, NOT NULL)
- title (TEXT, NOT NULL)
- description (TEXT, NULLABLE)
- performed_by (TEXT, NULLABLE)
- user_name (TEXT, NULLABLE)
- created_at (TIMESTAMPTZ, DEFAULT NOW())
```

**Indexes:**
- `activities_pkey` (PRIMARY KEY on id)
- `idx_activities_case_id` (on case_id)

#### 7. `payments` - Ödemeler
```sql
- id (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- case_id (UUID, REFERENCES cases(id) ON DELETE CASCADE)
- amount (DECIMAL(10,2), NOT NULL)
- payment_type (TEXT, NOT NULL)
- payment_method (TEXT, NULLABLE)
- status (TEXT, DEFAULT 'pending')
- payment_date (TIMESTAMPTZ, NULLABLE)
- iban (TEXT, NULLABLE)
- account_holder (TEXT, NULLABLE)
- description (TEXT, NULLABLE)
- notes (TEXT, NULLABLE)
- created_at (TIMESTAMPTZ, DEFAULT NOW())
- updated_at (TIMESTAMPTZ, DEFAULT NOW())
```

**Indexes:**
- `payments_pkey` (PRIMARY KEY on id)
- `idx_payments_case_id` (on case_id)

#### 8. `notifications` - Bildirimler
```sql
- id (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- customer_id (UUID, REFERENCES customers(id) ON DELETE CASCADE)
- case_id (UUID, REFERENCES cases(id) ON DELETE CASCADE)
- title (TEXT, NOT NULL)
- message (TEXT, NOT NULL)
- type (TEXT, DEFAULT 'info')
- read (BOOLEAN, DEFAULT FALSE)
- read_at (TIMESTAMPTZ, NULLABLE)
- created_at (TIMESTAMPTZ, DEFAULT NOW())
```

**Indexes:**
- `notifications_pkey` (PRIMARY KEY on id)
- `idx_notifications_customer_id` (on customer_id)

#### 9. `user_auth` - Kullanıcı Yetkilendirme
```sql
- id (UUID, PRIMARY KEY, REFERENCES auth.users(id) ON DELETE CASCADE)
- customer_id (UUID, UNIQUE, REFERENCES customers(id) ON DELETE CASCADE)
- role (TEXT, DEFAULT 'customer')
- name (TEXT, NULLABLE)
- created_at (TIMESTAMPTZ, DEFAULT NOW())
- updated_at (TIMESTAMPTZ, DEFAULT NOW())
```

**Indexes:**
- `user_auth_pkey` (PRIMARY KEY on id)
- `user_auth_customer_id_key` (UNIQUE on customer_id)
- `idx_user_auth_name` (on name)

#### 10. `admin_checklist` - Admin Yapılacaklar Listesi
```sql
- id (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- case_id (UUID, REFERENCES cases(id) ON DELETE CASCADE)
- task_key (TEXT, NOT NULL)
- title (TEXT, NOT NULL)
- completed (BOOLEAN, DEFAULT FALSE)
- completed_at (TIMESTAMPTZ, NULLABLE)
- completed_by (TEXT, NULLABLE)
- created_at (TIMESTAMPTZ, DEFAULT NOW())
- updated_at (TIMESTAMPTZ, DEFAULT NOW())
- UNIQUE(case_id, task_key)
```

**Indexes:**
- `admin_checklist_pkey` (PRIMARY KEY on id)
- `admin_checklist_case_id_task_key_key` (UNIQUE on case_id, task_key)
- `idx_admin_checklist_case_id` (on case_id)
- `idx_admin_checklist_completed` (on completed)

#### 11. `case_admins` - Dosya/Admin Atamaları
```sql
- id (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- case_id (UUID, REFERENCES cases(id) ON DELETE CASCADE)
- admin_id (UUID, REFERENCES auth.users(id) ON DELETE CASCADE)
- created_at (TIMESTAMPTZ, DEFAULT NOW())
- updated_at (TIMESTAMPTZ, DEFAULT NOW())
- UNIQUE(case_id, admin_id)
```

**Indexes:**
- `case_admins_pkey` (PRIMARY KEY on id)
- `case_admins_case_id_admin_id_key` (UNIQUE on case_id, admin_id)
- `idx_case_admins_case_id` (on case_id)
- `idx_case_admins_admin_id` (on admin_id)

---

## 🔧 Fonksiyonlar

### 1. `update_updated_at_column()`
```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
```

### 2. `generate_dosya_takip_numarasi()`
```sql
CREATE OR REPLACE FUNCTION public.generate_dosya_takip_numarasi()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_number TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- 100000 ile 999999 arası rastgele 6 haneli numara üret
    new_number := LPAD((FLOOR(RANDOM() * 900000) + 100000)::TEXT, 6, '0');
    
    -- Bu numaranın kullanılıp kullanılmadığını kontrol et
    SELECT EXISTS(SELECT 1 FROM customers WHERE dosya_takip_numarasi = new_number) INTO exists_check;
    
    -- Eğer kullanılmamışsa döndür
    IF NOT exists_check THEN
      RETURN new_number;
    END IF;
  END LOOP;
END;
$$;
```

### 3. `auto_assign_dosya_takip_numarasi()`
```sql
CREATE OR REPLACE FUNCTION public.auto_assign_dosya_takip_numarasi()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.dosya_takip_numarasi IS NULL THEN
    NEW.dosya_takip_numarasi := generate_dosya_takip_numarasi();
  END IF;
  RETURN NEW;
END;
$$;
```

### 4. `get_board_stage_from_current_stage(current_stage TEXT)`
```sql
CREATE OR REPLACE FUNCTION get_board_stage_from_current_stage(current_stage TEXT)
RETURNS TEXT AS $$
BEGIN
  CASE current_stage
    WHEN 'başvuru' THEN RETURN 'basvuru_alindi';
    WHEN 'evrak' THEN RETURN 'evrak_ekspertiz';
    WHEN 'ekspertiz' THEN RETURN 'evrak_ekspertiz';
    WHEN 'sigorta' THEN RETURN 'sigorta_basvurusu';
    WHEN 'tahkim' THEN RETURN 'muzakere';
    WHEN 'mahkeme' THEN RETURN 'muzakere';
    WHEN 'ödeme' THEN RETURN 'odeme';
    ELSE RETURN 'basvuru_alindi';
  END CASE;
END;
$$ LANGUAGE plpgsql;
```

---

## 🎯 Trigger'lar

### Updated_at Trigger'ları
Aşağıdaki tablolarda `updated_at` kolonunu otomatik güncelleyen trigger'lar mevcuttur:

1. `update_customers_updated_at` - customers tablosu
2. `update_cases_updated_at` - cases tablosu
3. `update_documents_updated_at` - documents tablosu
4. `update_process_steps_updated_at` - process_steps tablosu
5. `update_customer_tasks_updated_at` - customer_tasks tablosu
6. `update_payments_updated_at` - payments tablosu
7. `update_user_auth_updated_at` - user_auth tablosu
8. `update_admin_checklist_updated_at` - admin_checklist tablosu
9. `update_case_admins_updated_at` - case_admins tablosu

### Dosya Takip Numarası Trigger'ı
- `trigger_auto_assign_dosya_takip_numarasi` - customers tablosuna INSERT öncesi çalışır

---

## 📦 Storage Buckets

### 1. `documents` Bucket
- **Public**: `false`
- **File Size Limit**: 52428800 bytes (50 MB)
- **Allowed MIME Types**: 
  - `application/pdf`
  - `image/jpeg`
  - `image/jpg`
  - `image/png`
  - `image/webp`

### 2. `case-photos` Bucket
- **Public**: `false`
- **File Size Limit**: 52428800 bytes (50 MB)
- **Allowed MIME Types**:
  - `image/jpeg`
  - `image/jpg`
  - `image/png`
  - `image/webp`

### 3. `public-images` Bucket
- **Public**: `true`
- **File Size Limit**: 10485760 bytes (10 MB)
- **Allowed MIME Types**:
  - `image/jpeg`
  - `image/jpg`
  - `image/png`
  - `image/webp`

---

## 🔐 Row Level Security (RLS) Politikaları

Tüm tablolarda RLS aktif edilmiştir. Detaylı RLS politikaları migration dosyalarında tanımlanmıştır. Ana prensipler:

- **Superadmin**: Tüm kayıtları görüntüleyebilir ve düzenleyebilir
- **Admin/Lawyer**: Sadece kendilerine atanmış dosyaları görüntüleyebilir ve düzenleyebilir
- **Acente**: Sadece kendilerine atanmış dosyaları görüntüleyebilir (düzenleyemez)
- **Customer**: Sadece kendi kayıtlarını görüntüleyebilir

---

## 📝 Migration Dosyaları ve Sıralaması

Migration dosyaları **mutlaka** aşağıdaki sırayla çalıştırılmalıdır:

1. ✅ `001_initial_schema.sql` - Temel tablolar ve fonksiyonlar
2. ✅ `002_storage_and_policies.sql` - Storage bucket'ları ve ilk RLS politikaları
3. ✅ `004_add_file_tracking_number.sql` - Dosya takip numarası sistemi
4. ✅ `005_admin_panel_schema.sql` - Admin panel şeması
5. ✅ `009_admin_assignment_system.sql` - Admin atama sistemi
6. ✅ `009_add_notary_and_file_expenses.sql` - Noter ve dosya masrafları
7. ✅ `010_add_admin_name_and_roles.sql` - Admin isimleri ve roller
8. ✅ `012_update_rls_for_assigned_cases.sql` - RLS güncellemeleri
9. ✅ `013_fix_rls_and_function_security.sql` - RLS ve fonksiyon güvenlik düzeltmeleri
10. ✅ `014_optimize_rls_policies_performance.sql` - RLS performans optimizasyonları

**NOT**: `003_seed_data.sql`, `006_admin_checklist_policies.sql`, `007_create_admin_user.sql`, `008_add_sample_customer.sql`, `011_update_rls_for_new_roles.sql` dosyaları test verileri ve opsiyonel güncellemeler içerir. Production kopyası için gerekli değildir.

---

## 🚀 Yeni Proje Oluşturma

### Adım 1: Supabase Projesi Oluşturun

1. [Supabase Dashboard](https://supabase.com/dashboard) adresine gidin
2. "New Project" butonuna tıklayın
3. Proje bilgilerini doldurun:
   - **Project Name**: `deger360-staging` (veya istediğiniz isim)
   - **Database Password**: Güçlü bir şifre oluşturun ve kaydedin
   - **Region**: `Europe (Frankfurt)` (Türkiye'ye en yakın)
4. "Create new project" butonuna tıklayın (2-3 dakika bekleyin)

### Adım 2: API Keys'leri Alın

1. Sol menüden **"Settings"** > **"API"** seçin
2. Şu bilgileri kopyalayın ve kaydedin:
   - **Project URL** (örn: `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (Show butonuna tıklayın)

### Adım 3: Environment Variables Oluşturun

Projenizin kök dizininde `.env.local` dosyası oluşturun (veya staging için `.env.staging`):

```bash
NEXT_PUBLIC_SUPABASE_URL=buraya_yeni_project_url_yapıştırın
NEXT_PUBLIC_SUPABASE_ANON_KEY=buraya_yeni_anon_key_yapıştırın
SUPABASE_SERVICE_ROLE_KEY=buraya_yeni_service_role_key_yapıştırın
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 📋 Adım Adım Kurulum

### 1. SQL Editor'e Gidin

Supabase dashboard'da sol menüden **"SQL Editor"** seçin.

### 2. Migration Dosyalarını Sırayla Çalıştırın

Her migration dosyasını aşağıdaki sırayla çalıştırın:

#### Migration 1: `001_initial_schema.sql`
1. SQL Editor'de "New query" butonuna tıklayın
2. `supabase/migrations/001_initial_schema.sql` dosyasını açın
3. Tüm içeriği kopyalayıp SQL editor'e yapıştırın
4. **"Run"** butonuna tıklayın
5. ✅ Hata görmüyorsanız devam edin

#### Migration 2: `002_storage_and_policies.sql`
1. SQL Editor'de yeni bir query açın
2. `supabase/migrations/002_storage_and_policies.sql` dosyasını kopyalayın
3. **"Run"** butonuna tıklayın
4. ✅ Hata görmüyorsanız devam edin

#### Migration 3: `004_add_file_tracking_number.sql`
1. SQL Editor'de yeni bir query açın
2. `supabase/migrations/004_add_file_tracking_number.sql` dosyasını kopyalayın
3. **"Run"** butonuna tıklayın
4. ✅ Hata görmüyorsanız devam edin

#### Migration 4: `005_admin_panel_schema.sql`
1. SQL Editor'de yeni bir query açın
2. `supabase/migrations/005_admin_panel_schema.sql` dosyasını kopyalayın
3. **"Run"** butonuna tıklayın
4. ✅ Hata görmüyorsanız devam edin

#### Migration 5: `009_admin_assignment_system.sql`
1. SQL Editor'de yeni bir query açın
2. `supabase/migrations/009_admin_assignment_system.sql` dosyasını kopyalayın
3. **"Run"** butonuna tıklayın
4. ✅ Hata görmüyorsanız devam edin

#### Migration 6: `009_add_notary_and_file_expenses.sql`
1. SQL Editor'de yeni bir query açın
2. `supabase/migrations/009_add_notary_and_file_expenses.sql` dosyasını kopyalayın
3. **"Run"** butonuna tıklayın
4. ✅ Hata görmüyorsanız devam edin

#### Migration 7: `010_add_admin_name_and_roles.sql`
1. SQL Editor'de yeni bir query açın
2. `supabase/migrations/010_add_admin_name_and_roles.sql` dosyasını kopyalayın
3. **"Run"** butonuna tıklayın
4. ✅ Hata görmüyorsanız devam edin

#### Migration 8: `012_update_rls_for_assigned_cases.sql`
1. SQL Editor'de yeni bir query açın
2. `supabase/migrations/012_update_rls_for_assigned_cases.sql` dosyasını kopyalayın
3. **"Run"** butonuna tıklayın
4. ✅ Hata görmüyorsanız devam edin

#### Migration 9: `013_fix_rls_and_function_security.sql`
1. SQL Editor'de yeni bir query açın
2. `supabase/migrations/013_fix_rls_and_function_security.sql` dosyasını kopyalayın
3. **"Run"** butonuna tıklayın
4. ✅ Hata görmüyorsanız devam edin

#### Migration 10: `014_optimize_rls_policies_performance.sql`
1. SQL Editor'de yeni bir query açın
2. `supabase/migrations/014_optimize_rls_policies_performance.sql` dosyasını kopyalayın
3. **"Run"** butonuna tıklayın
4. ✅ Hata görmüyorsanız devam edin

---

## ✅ Doğrulama

### 1. Tabloları Kontrol Edin

SQL Editor'de şu sorguyu çalıştırın:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Şu tabloları görmelisiniz:
- activities
- admin_checklist
- case_admins
- cases
- customer_tasks
- customers
- documents
- notifications
- payments
- process_steps
- user_auth

### 2. Fonksiyonları Kontrol Edin

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
ORDER BY routine_name;
```

Şu fonksiyonları görmelisiniz:
- auto_assign_dosya_takip_numarasi
- generate_dosya_takip_numarasi
- get_board_stage_from_current_stage
- update_updated_at_column

### 3. Storage Bucket'ları Kontrol Edin

1. Sol menüden **"Storage"** seçin
2. Şu bucket'ları görmelisiniz:
   - `documents`
   - `case-photos`
   - `public-images`

### 4. RLS Politikalarını Kontrol Edin

```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
```

Her tablo için uygun RLS politikalarının olduğunu kontrol edin.

### 5. Trigger'ları Kontrol Edin

```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
ORDER BY event_object_table, trigger_name;
```

### 6. Index'leri Kontrol Edin

```sql
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
```

---

## 🔄 Production'dan Staging'e Veri Kopyalama (Opsiyonel)

Eğer production verilerini staging'e kopyalamak istiyorsanız:

### 1. Production'dan Veri Dışa Aktarma

Production Supabase projenizde SQL Editor'de:

```sql
-- Customers
COPY customers TO STDOUT WITH CSV HEADER;

-- Cases
COPY cases TO STDOUT WITH CSV HEADER;

-- Documents
COPY documents TO STDOUT WITH CSV HEADER;

-- Diğer tablolar için benzer şekilde...
```

### 2. Staging'e Veri İçe Aktarma

Staging Supabase projenizde SQL Editor'de:

```sql
-- Önce foreign key constraint'leri geçici olarak devre dışı bırakın
SET session_replication_role = 'replica';

-- Verileri içe aktarın
COPY customers FROM STDIN WITH CSV HEADER;
-- CSV verilerini buraya yapıştırın

-- Constraint'leri tekrar aktif edin
SET session_replication_role = 'origin';
```

**NOT**: Bu işlem karmaşık olabilir. Production verilerini staging'e kopyalamak yerine, staging'de test verileri ile çalışmanız önerilir.

---

## 🎯 Sonraki Adımlar

1. ✅ Yeni Supabase projesi oluşturuldu
2. ✅ Tüm migration'lar çalıştırıldı
3. ✅ Environment variables güncellendi
4. ✅ Doğrulama tamamlandı
5. 🔄 Uygulamanızı yeni Supabase projesine bağlayın
6. 🔄 Test kullanıcıları oluşturun
7. 🔄 Test verileri ekleyin (opsiyonel)

---

## 📞 Sorun Giderme

### Migration Hatası Alıyorsanız

1. Hata mesajını okuyun
2. Hangi migration'da hata aldığınızı not edin
3. Önceki migration'ların başarılı olduğundan emin olun
4. Gerekirse migration dosyasını düzenleyip tekrar çalıştırın

### RLS Politikası Hatası Alıyorsanız

1. İlgili tabloda RLS'in aktif olduğundan emin olun:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

2. Eksik politikaları kontrol edin ve ekleyin

### Storage Bucket Hatası Alıyorsanız

1. Storage menüsünden bucket'ların oluşturulduğunu kontrol edin
2. Gerekirse manuel olarak oluşturun:
   - Bucket ID: `documents`, `case-photos`, `public-images`
   - Public/Private ayarlarını kontrol edin

---

## 📚 Ek Kaynaklar

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Son Güncelleme**: 2025-01-29
**Hazırlayan**: AI Assistant
**Versiyon**: 1.0
