# Değer Kaybı Danışmanlık Websitesi

Araç değer kaybı davalarında danışmanlık ve avukatlık hizmeti sunan bir platform. Müşteriler kaza sonrası mağduriyetinde onları uğraştırmadan hakkını almalarını sağlıyoruz, bütün süreci kendi avukatlarımızla yönetiyoruz.

## 🚀 Başlangıç

### Gereksinimler

- Node.js 18+ 
- npm veya yarn

### Kurulum

```bash
# Bağımlılıkları yükleyin
npm install

# Development server'ı başlatın
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

### Build

```bash
# Production build
npm run build

# Production server'ı başlatın
npm start
```

## 📁 Proje Yapısı

```
/src
  /app
    /page.tsx                    # Ana sayfa
    /hizmetlerimiz/page.tsx
    /surec/page.tsx
    /hakkimizda/page.tsx
    /sss/page.tsx
    /iletisim/page.tsx
    /tesekkurler/page.tsx        # Form sonrası
    /portal                       # Müşteri portalı
      /page.tsx                   # Dashboard
      /giris/page.tsx            # Portal girişi
      /dosya-durumu/page.tsx
      /belgeler/page.tsx
      /finansal/page.tsx
      /ayarlar/page.tsx
      /yardim/page.tsx
    /api
      /contact/route.ts          # Form submission API
    /layout.tsx
    /globals.css
  /components
    /ui                          # Temel UI bileşenleri
    /sections                    # Sayfa bölümleri
    /forms                       # Form bileşenleri
    /layout                      # Layout bileşenleri
    /portal                      # Portal bileşenleri
  /lib
    /utils.ts                    # Yardımcı fonksiyonlar
    /analytics.ts                # Analytics tracking
    /supabase                    # Supabase entegrasyonu
      /client.ts                 # Supabase client
      /api.ts                    # API helpers
      /database.types.ts         # TypeScript types
  /supabase
    /migrations                  # Database migration dosyaları
```

## 🎨 Teknoloji Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Hook Form** - Form yönetimi
- **Zod** - Form validation
- **Framer Motion** - Animasyonlar
- **Lucide React** - İkonlar

## 🔑 Özellikler

- ✅ Responsive tasarım (Mobile-first)
- ✅ Form validation (Zod ile)
- ✅ SEO optimizasyonu
- ✅ Analytics tracking hazır
- ✅ Smooth scroll animasyonları
- ✅ Sticky mobile CTA
- ✅ KVKK uyumlu form

## 🗄️ Database - Supabase

Proje Supabase ile entegre edilmiştir. **Hızlı başlangıç için:**

👉 **[SUPABASE_QUICK_START.md](./SUPABASE_QUICK_START.md)** - Adım adım kurulum (5 dakika)

Detaylı bilgi için:
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Tam teknik dokümantasyon

### Kurulum Özeti
1. Supabase hesabı oluşturun
2. Yeni proje oluşturun
3. `.env.local` dosyası oluşturup API keys ekleyin
4. Migration dosyalarını SQL Editor'de çalıştırın
5. Test kullanıcısı oluşturun

## 📝 Form API

Form gönderimi `/api/contact` endpoint'ine POST isteği yapar. Supabase entegrasyonu için `src/lib/supabase/api.ts` dosyasını kullanın.

## 🎯 Önemli Notlar

1. **Form en önemli element** - Her sayfada erişilebilir olmalı
2. **Mobile-first yaklaşım** - Responsive tasarım kritik
3. **Analytics** - Google Analytics için `NEXT_PUBLIC_GA_ID` environment variable ekleyin
4. **Email gönderimi** - Resend, SendGrid veya başka bir servis entegre edin

## 🌐 Deployment

### Vercel

```bash
vercel --prod
```

### Environment Variables

`.env.local` dosyası oluşturun:

```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SITE_URL=https://degerkaybim.com
```

## 📄 Lisans

Bu proje özel bir projedir.

