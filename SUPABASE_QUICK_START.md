# Supabase Hızlı Başlangıç - Adım Adım

> **⚠️ ÖNEMLİ:** Eğer daha önce bir Supabase projesi oluşturduysanız ve yeniden başlamak istiyorsanız:
> 1. Supabase Dashboard'da projeyi silin (Settings > General > Delete Project)
> 2. Veya farklı bir isimle yeni proje oluşturun
> 3. Bu belgedeki adımları sıfırdan takip edin

## ✅ Hazırlanan Dosyalar

Supabase entegrasyonu için tüm dosyalar hazırlandı:

### 📁 Klasör Yapısı
```
/supabase
  /migrations
    001_initial_schema.sql       ✅ Veritabanı tabloları
    002_storage_and_policies.sql ✅ Storage ve güvenlik
    003_seed_data.sql            ✅ Test verileri
  config.toml                    ✅ Supabase config

/src/lib/supabase
  client.ts                      ✅ Supabase client
  database.types.ts              ✅ TypeScript types
  api.ts                         ✅ API fonksiyonları
  auth.ts                        ✅ Auth fonksiyonları
  hooks.ts                       ✅ React hooks
  server.ts                      ✅ Server-side client

/src
  middleware.ts                  ✅ Route protection
```

## 🚀 SİZİN YAPMANIZ GEREKENLER

### Adım 1: Supabase Projesi Oluşturun

1. https://supabase.com adresine gidin
2. "Start your project" > "New Project" tıklayın
3. Bilgileri doldurun:
   - **Name:** `deger360`
   - **Database Password:** Güçlü bir şifre (kaydedin!)
   - **Region:** `Europe (Frankfurt)`
4. "Create new project" butonuna tıklayın (2-3 dakika bekleyin)

### Adım 2: API Keys'leri Alın

1. Sol menüden **"Settings"** > **"API"** seçin
2. Şu bilgileri kopyalayın:
   - **Project URL** (örn: https://xxxxx.supabase.co)
   - **anon public** key
   - **service_role** key (Show butonuna tıklayın)

### Adım 3: Environment Variables Oluşturun

Projenizin kök dizininde `.env.local` dosyası oluşturun:

```bash
NEXT_PUBLIC_SUPABASE_URL=buraya_project_url_yapıştırın
NEXT_PUBLIC_SUPABASE_ANON_KEY=buraya_anon_key_yapıştırın
SUPABASE_SERVICE_ROLE_KEY=buraya_service_role_key_yapıştırın
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Adım 4: Database Schema'yı Kurun

**ÖNEMLİ:** Migration dosyalarını **mutlaka sırayla** çalıştırın!

1. Supabase dashboard'da **"SQL Editor"** menüsüne gidin
2. **"New query"** butonuna tıklayın

**4.1) İlk Migration - Database Schema**
3. `supabase/migrations/001_initial_schema.sql` dosyasını açın
4. Tüm içeriği kopyalayıp SQL editor'e yapıştırın
5. **"Run"** butonuna tıklayın
6. ✅ Hata görmüyorsanız devam edin

**4.2) İkinci Migration - Storage ve Güvenlik**
7. SQL Editor'de yeni bir query açın
8. `supabase/migrations/002_storage_and_policies.sql` dosyasını kopyalayın
9. **"Run"** butonuna tıklayın
10. ✅ Hata görmüyorsanız devam edin

**4.3) Üçüncü Migration - Test Verileri**
11. SQL Editor'de yeni bir query açın
12. `supabase/migrations/003_seed_data.sql` dosyasını kopyalayın
13. **"Run"** butonuna tıklayın
14. ✅ "INSERT 0 1" gibi mesajlar görmelisiniz

### Adım 5: Storage Bucket'ları Kontrol Edin

1. Sol menüden **"Storage"** seçin
2. İki bucket görmeli siniz:
   - `documents`
   - `case-photos`
3. Eğer görünmüyorsa, SQL Editor'de tekrar `002_storage_and_policies.sql` çalıştırın

### Adım 6: Test Kullanıcısı Oluşturun

1. **"Authentication"** > **"Users"** menüsüne gidin
2. **"Add user"** > **"Create new user"** tıklayın
3. Test kullanıcısı oluşturun:
   - Email: `ahmet@example.com`
   - Password: `test123456` (en az 6 karakter)
   - Auto Confirm User: ✅ (işaretleyin)

4. Kullanıcı oluşturulduktan sonra **kullanıcı ID'sini kopyalayın** (UUID formatında, örn: `a1b2c3d4-...`)

5. **SQL Editor**'e gidin ve şu komutu çalıştırın (XXXXX yerine kopyaladığınız ID'yi yapıştırın):

```sql
-- Test kullanıcısını müşteri ile bağla
INSERT INTO user_auth (id, customer_id, role)
VALUES (
  'XXXXX-XXXXX-XXXXX-XXXXX-XXXXX',  -- Buraya Authentication'dan kopyaladığınız user ID
  '11111111-1111-1111-1111-111111111111',  -- Seed data'daki test customer ID
  'customer'
);
```

**ÖNEMLİ:** Kullanıcı ID'sini doğru kopyaladığınızdan emin olun!

### Adım 7: Development Server'ı Yeniden Başlatın

```bash
# Ctrl+C ile server'ı durdurun
# Sonra yeniden başlatın
npm run dev
```

## 🎯 Test Etme

1. http://localhost:3000/portal/giris adresine gidin
2. Giriş bilgileri:
   - **Dosya Takip Numarası:** `DK-2024-542`
   - **Şifre:** `test123456` (Adım 6'da oluşturduğunuz)
3. Giriş yapın ve portal sayfalarını test edin

## 📊 Veritabanı Yapısı

### Tablolar

| Tablo | Açıklama |
|-------|----------|
| `customers` | Müşteri bilgileri (ad, email, telefon, adres) |
| `cases` | Dava/dosya bilgileri (araç, kaza, finansal bilgiler) |
| `documents` | Yüklenen belgeler |
| `process_steps` | Süreç adımları (başvuru, evrak, ekspertiz, vb.) |
| `customer_tasks` | Müşteri görevleri (belge yükle, form doldur) |
| `activities` | Aktivite feed (son hareketler) |
| `payments` | Ödeme kayıtları |
| `notifications` | Bildirimler |
| `user_auth` | Kullanıcı-müşteri bağlantısı |

### Storage Buckets

- **documents**: Resmi belgeler (PDF, resimler)
- **case-photos**: Kaza fotoğrafları

## 🔐 Güvenlik

- Row Level Security (RLS) tüm tablolarda aktif
- Müşteriler sadece kendi dosyalarını görebilir
- Adminler tüm verilere erişebilir
- Storage'da dosya erişim kontrolleri var

## 🛠️ Sonraki Adımlar

Supabase kurulumunu tamamladıktan sonra:

1. ✅ Portal sayfaları Supabase'den veri çekecek
2. ✅ Belge yükleme Supabase Storage'a gidecek
3. ✅ Müşteri görevleri database'de güncellenecek
4. 🔜 Admin panel oluşturulacak
5. 🔜 Email bildirimleri eklenecek

## ❓ Sorun Giderme

### "Invalid API key" hatası
- `.env.local` dosyasını kontrol edin
- API key'lerde boşluk veya fazladan karakter olmadığından emin olun
- Server'ı yeniden başlatın (Ctrl+C ile durdurup `npm run dev`)

### "relation does not exist" hatası
- Migration dosyalarını sırasıyla çalıştırdığınızdan emin olun
- SQL Editor'de kontrol komutu çalıştırın:
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' 
  ORDER BY table_name;
  ```
- Tablolar yoksa migration'ları yeniden çalıştırın

### "Row level security policy violation" hatası
- Kullanıcı giriş yapmış mı kontrol edin
- `user_auth` tablosunda kullanıcı kaydı var mı kontrol edin:
  ```sql
  SELECT * FROM user_auth;
  ```
- Eğer kayıt yoksa Adım 6'daki user_auth INSERT komutunu çalıştırın

### "trigger already exists" hatası
- Veritabanında eski veriler var demektir
- `supabase/migrations/000_cleanup.sql` dosyasını çalıştırın
- Sonra migration'ları sırayla yeniden yükleyin

### Storage bucket'lar görünmüyor
1. SQL Editor'de kontrol edin:
   ```sql
   SELECT * FROM storage.buckets;
   ```
2. Eğer görünmüyorsa `002_storage_and_policies.sql` dosyasını tekrar çalıştırın
3. Veya manuel oluşturun:
   - Storage > New bucket > "documents" (Private)
   - Storage > New bucket > "case-photos" (Private)

## 📞 Yardım

Detaylı bilgi için:
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Tam kurulum rehberi
- [Supabase Docs](https://supabase.com/docs) - Resmi dokümantasyon
