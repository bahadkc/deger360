# Deployment Guide

Bu dokümantasyon, DeğerKaybım projesinin production'a deploy edilmesi için gerekli adımları içerir.

## 📋 Ön Gereksinimler

- Node.js 20+
- npm veya yarn
- Vercel hesabı (veya alternatif hosting)
- Supabase projesi

## 🚀 Vercel Deployment

### 1. Vercel Projesi Oluşturma

1. [Vercel Dashboard](https://vercel.com/dashboard)'a giriş yapın
2. "Add New Project" butonuna tıklayın
3. GitHub repository'nizi seçin
4. Proje ayarlarını yapılandırın:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (otomatik)

### 2. Environment Variables Ekleme

Vercel Dashboard'da projenizin **Settings > Environment Variables** bölümüne gidin ve şu değişkenleri ekleyin:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX (opsiyonel)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx (opsiyonel)
NODE_ENV=production
```

**Önemli**: `SUPABASE_SERVICE_ROLE_KEY` değişkenini asla client-side'da kullanmayın!

### 3. Domain Bağlama

1. Vercel Dashboard'da projenizin **Settings > Domains** bölümüne gidin
2. Custom domain'inizi ekleyin
3. DNS ayarlarını yapın (Vercel otomatik SSL sağlar)

### 4. İlk Deploy

1. GitHub repository'nize push yapın
2. Vercel otomatik olarak deploy edecektir
3. Veya manuel olarak Vercel CLI ile:
   ```bash
   npm i -g vercel
   vercel --prod
   ```

## 🐳 Docker Deployment

### 1. Docker Image Build

```bash
docker build -t deger-kaybi-web .
```

### 2. Docker Compose ile Çalıştırma

```bash
# .env dosyası oluşturun
cp ENV_PRODUCTION_TEMPLATE.txt .env

# .env dosyasını düzenleyin ve değerleri girin

# Container'ı başlatın
docker-compose up -d
```

### 3. Health Check

```bash
curl http://localhost:3000/api/health
```

## 📊 Database Migrations

### Supabase Production'a Migration Uygulama

1. Supabase Dashboard'a giriş yapın
2. **SQL Editor**'e gidin
3. `supabase/migrations/` klasöründeki migration dosyalarını sırayla çalıştırın:
   - `001_initial_schema.sql`
   - `002_storage_and_policies.sql`
   - `003_seed_data.sql`
   - ... (diğer migration'lar)

**Veya Supabase CLI ile:**

```bash
supabase link --project-ref your-project-ref
supabase db push
```

## 🔒 Security Checklist

- [x] Security headers eklendi (middleware.ts)
- [x] Rate limiting aktif (API routes)
- [x] Environment variables güvenli şekilde saklanıyor
- [x] Service role key client-side'da kullanılmıyor
- [x] HTTPS zorunlu (Vercel otomatik)
- [x] CSP headers yapılandırıldı

## 📈 Monitoring & Analytics

### Google Analytics

1. Google Analytics hesabı oluşturun
2. Measurement ID'yi alın (G-XXXXXXXXXX)
3. Vercel environment variables'a ekleyin: `NEXT_PUBLIC_GA_ID`

### Error Tracking (Sentry)

1. Sentry hesabı oluşturun
2. DSN'i alın
3. Vercel environment variables'a ekleyin: `NEXT_PUBLIC_SENTRY_DSN`
4. Sentry paketini yükleyin:
   ```bash
   npm install @sentry/nextjs
   ```
5. `src/lib/sentry.ts` dosyasındaki yorumları kaldırın ve yapılandırın

## 🔄 CI/CD Pipeline

GitHub Actions workflow'u `.github/workflows/deploy.yml` dosyasında tanımlıdır.

### GitHub Secrets Ekleme

Repository Settings > Secrets and variables > Actions'a gidin ve şu secrets'ları ekleyin:

- `VERCEL_TOKEN`: Vercel API token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `NEXT_PUBLIC_SITE_URL`: Production site URL

### Otomatik Deploy

`main` branch'e push yapıldığında otomatik olarak:
1. Code linting yapılır
2. Build test edilir
3. Vercel'e deploy edilir

## 💾 Backup Strategy

### Supabase Database Backup

1. Supabase Dashboard > Settings > Database
2. "Backups" bölümünden otomatik backup'ları kontrol edin
3. Manuel backup için:
   ```bash
   supabase db dump -f backup.sql
   ```

### Disaster Recovery

1. Database backup'ları düzenli olarak kontrol edin
2. Environment variables'ları güvenli bir yerde saklayın (password manager)
3. Migration dosyalarını Git'te tutun

## 🧪 Post-Deployment Testing

Deploy sonrası şunları test edin:

- [ ] Ana sayfa yükleniyor mu?
- [ ] Form gönderimi çalışıyor mu?
- [ ] API endpoints çalışıyor mu?
- [ ] Authentication çalışıyor mu?
- [ ] Admin panel erişilebilir mi?
- [ ] Portal erişilebilir mi?
- [ ] SSL sertifikası aktif mi?
- [ ] Sitemap.xml erişilebilir mi? (`/sitemap.xml`)
- [ ] Robots.txt erişilebilir mi? (`/robots.txt`)
- [ ] Health check çalışıyor mu? (`/api/health`)

## 📝 Troubleshooting

### Build Hataları

```bash
# Local'de build test edin
npm run build

# Hataları kontrol edin
npm run lint
```

### Environment Variables Sorunları

- Vercel Dashboard'da environment variables'ları kontrol edin
- Production, Preview ve Development için ayrı ayrı ayarlanabilir
- Değişikliklerden sonra yeniden deploy gerekebilir

### Database Connection Sorunları

- Supabase project URL ve keys'leri kontrol edin
- Supabase project'in aktif olduğundan emin olun
- RLS (Row Level Security) policies'leri kontrol edin

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
- [Docker Documentation](https://docs.docker.com/)

## 📞 Support

Sorunlar için:
- GitHub Issues: [Repository Issues](https://github.com/your-repo/issues)
- Email: support@yourdomain.com

