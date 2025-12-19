# Supabase Kurulum Rehberi

Bu dosya projeyi Supabase ile nasıl bağlayacağınızı adım adım açıklar.

## 1. Supabase Projesi Oluşturma

1. [Supabase](https://supabase.com) hesabınıza giriş yapın veya yeni hesap oluşturun
2. "New Project" butonuna tıklayın
3. Proje bilgilerini doldurun:
   - Project Name: `deger360` veya istediğiniz bir isim
   - Database Password: Güçlü bir şifre oluşturun (kaydedin!)
   - Region: `Europe (Frankfurt)` - Türkiye'ye en yakın
4. "Create new project" butonuna tıklayın (2-3 dakika sürer)

## 2. Environment Variables Ayarlama

1. Supabase dashboard'unuzda "Settings" > "API" menüsüne gidin
2. Aşağıdaki değerleri kopyalayın:
   - `Project URL`
   - `anon public` key
   - `service_role` key (Show butonuna tıklayın)

3. Projenin root dizininde `.env.local` dosyası oluşturun:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**ÖNEMLİ:** `.env.local` dosyası git'e eklenmemelidir (zaten .gitignore'da var)

## 3. Database Schema Kurulumu

### SQL Editor ile Manuel Kurulum

1. Supabase dashboard'da "SQL Editor" menüsüne gidin
2. "New query" butonuna tıklayın
3. `supabase/migrations/001_initial_schema.sql` dosyasının içeriğini kopyalayın
4. SQL editöre yapıştırın ve "Run" butonuna tıklayın
5. Aynı işlemi `002_storage_and_policies.sql` ve `003_seed_data.sql` için tekrarlayın

### Supabase CLI ile Otomatik Kurulum (Opsiyonel)

```bash
# Supabase CLI kurulumu (eğer yoksa)
npm install -g supabase

# Supabase ile bağlantı kurma
supabase login

# Projenizi bağlama
supabase link --project-ref your_project_ref

# Migration'ları çalıştırma
supabase db push
```

## 4. Storage Buckets Oluşturma

Migration dosyaları storage bucket'ları otomatik oluşturur, ancak manuel kontrol için:

1. Supabase dashboard'da "Storage" menüsüne gidin
2. İki bucket görmeli siniz:
   - `documents` - PDF, JPEG, PNG dosyaları için
   - `case-photos` - Araç fotoğrafları için

## 5. Authentication Ayarları

1. "Authentication" > "Providers" menüsüne gidin
2. "Email" provider'ı aktif edin
3. "Email Templates" kısmından email şablonlarını özelleştirebilirsiniz

## 6. Test Verisi

Migration dosyaları test verisi içerir:

- **Test Müşteri:**
  - Email: ahmet@example.com
  - Dosya No: DK-2024-542

Bu test verisini görmek için:
```sql
SELECT * FROM customers;
SELECT * FROM cases;
```

## 7. Proje Çalıştırma

```bash
# Bağımlılıkları yükleyin
npm install

# Development server'ı başlatın
npm run dev
```

## 8. Database Yapısı

### Tablolar

- **customers**: Müşteri bilgileri
- **cases**: Dava/dosya bilgileri
- **documents**: Yüklenen belgeler
- **process_steps**: Süreç adımları
- **customer_tasks**: Müşteri görevleri
- **activities**: Aktivite feed
- **payments**: Ödeme kayıtları
- **notifications**: Bildirimler
- **user_auth**: Auth kullanıcı bağlantısı

### Storage Buckets

- **documents**: Tüm resmi belgeler (PDF, resimler)
- **case-photos**: Kaza ve araç fotoğrafları

## 9. Row Level Security (RLS)

Tüm tablolarda RLS aktiftir:
- Müşteriler sadece kendi dosyalarını görebilir
- Adminler tüm verileri görebilir ve düzenleyebilir
- Storage'da dosya yükleme ve indirme izinleri kontrol edilir

## 10. API Kullanımı

```typescript
import { casesApi, documentsApi } from '@/lib/supabase/api';

// Dosya bilgilerini getir
const caseData = await casesApi.getByCaseNumber('DK-2024-542');

// Belge yükle
await documentsApi.upload(file, caseNumber, 'tamir_faturası', caseId);
```

## Troubleshooting

### Hata: "Invalid API key"
- `.env.local` dosyasındaki API key'leri kontrol edin
- Development server'ı yeniden başlatın

### Hata: "relation does not exist"
- Migration dosyalarını doğru sırayla çalıştırdığınızdan emin olun
- SQL Editor'de tabloların oluştuğunu kontrol edin

### Hata: "Row Level Security policy violation"
- User authenticated mi kontrol edin
- RLS policies doğru mu kontrol edin

## Yardım ve Dokümantasyon

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
