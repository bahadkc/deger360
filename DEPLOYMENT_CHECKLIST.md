# Deployment Checklist

Bu checklist'i deployment öncesi ve sonrası kullanın.

## ✅ Pre-Deployment Checklist

### Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon/public key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only!)
- [ ] `NEXT_PUBLIC_SITE_URL` - Production site URL (https://yourdomain.com)
- [ ] `NEXT_PUBLIC_GA_ID` - Google Analytics ID (optional)
- [ ] `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN (optional)
- [ ] `NODE_ENV` - Set to "production"

### Database
- [ ] Supabase production database oluşturuldu
- [ ] Tüm migration'lar production'a uygulandı
- [ ] Seed data gerekliyse eklendi
- [ ] RLS (Row Level Security) policies kontrol edildi
- [ ] Test kullanıcıları oluşturuldu (gerekirse)

### Code Quality
- [ ] `npm run lint` hatasız geçti
- [ ] `npm run build` başarıyla tamamlandı
- [ ] TypeScript hataları yok
- [ ] Environment variables doğru yapılandırıldı

### Security
- [ ] Service role key client-side'da kullanılmıyor
- [ ] API routes rate limiting ile korunuyor
- [ ] Security headers aktif
- [ ] HTTPS zorunlu (Vercel otomatik)

### Files Created
- [ ] `vercel.json` oluşturuldu
- [ ] `Dockerfile` oluşturuldu (Docker deployment için)
- [ ] `docker-compose.yml` oluşturuldu (Docker deployment için)
- [ ] `.github/workflows/deploy.yml` oluşturuldu (CI/CD için)
- [ ] `DEPLOYMENT.md` dokümantasyonu hazır

## 🚀 Deployment Steps

### Vercel Deployment
1. [ ] Vercel hesabına giriş yapıldı
2. [ ] GitHub repository bağlandı
3. [ ] Environment variables eklendi
4. [ ] Build settings kontrol edildi
5. [ ] İlk deploy başlatıldı
6. [ ] Deploy başarıyla tamamlandı

### Domain Configuration
1. [ ] Custom domain eklendi
2. [ ] DNS kayıtları yapılandırıldı
3. [ ] SSL sertifikası aktif (Vercel otomatik)
4. [ ] Domain doğrulandı

## 🧪 Post-Deployment Testing

### Basic Functionality
- [ ] Ana sayfa yükleniyor (`/`)
- [ ] Tüm public sayfalar erişilebilir
- [ ] Form gönderimi çalışıyor (`/iletisim`)
- [ ] Portal girişi çalışıyor (`/portal/giris`)
- [ ] Admin panel erişilebilir (`/admin/giris`)

### API Endpoints
- [ ] `/api/health` - Health check çalışıyor
- [ ] `/api/contact` - Form submission çalışıyor
- [ ] `/api/create-lead` - Lead oluşturma çalışıyor
- [ ] Rate limiting çalışıyor (429 response test edildi)

### SEO & Metadata
- [ ] `/sitemap.xml` erişilebilir ve doğru format
- [ ] `/robots.txt` erişilebilir
- [ ] Meta tags doğru görünüyor
- [ ] Open Graph tags çalışıyor (social media preview)
- [ ] Twitter Card tags çalışıyor

### Security
- [ ] HTTPS aktif ve çalışıyor
- [ ] Security headers kontrol edildi (browser dev tools)
- [ ] CSP headers aktif
- [ ] XSS protection aktif
- [ ] HSTS header aktif (HTTPS için)

### Performance
- [ ] Google Analytics çalışıyor (eğer eklendiyse)
- [ ] Web Vitals tracking aktif (eğer eklendiyse)
- [ ] Images optimize edildi
- [ ] Bundle size makul seviyede

### Monitoring
- [ ] Error tracking aktif (Sentry eğer eklendiyse)
- [ ] Logging çalışıyor
- [ ] Health check endpoint çalışıyor

## 📊 Monitoring Setup

### Google Analytics
- [ ] Google Analytics hesabı oluşturuldu
- [ ] Measurement ID eklendi
- [ ] Events tracking çalışıyor
- [ ] Page views tracking çalışıyor

### Error Tracking (Sentry)
- [ ] Sentry hesabı oluşturuldu
- [ ] DSN eklendi
- [ ] Error tracking aktif
- [ ] Alerts yapılandırıldı

## 🔄 CI/CD

### GitHub Actions
- [ ] GitHub repository secrets eklendi
- [ ] Workflow dosyası commit edildi
- [ ] Test deploy yapıldı
- [ ] Otomatik deploy çalışıyor

## 💾 Backup

### Database Backup
- [ ] Supabase otomatik backup aktif
- [ ] Manuel backup prosedürü dokümante edildi
- [ ] Backup restore test edildi

## 📝 Documentation

- [ ] `DEPLOYMENT.md` okundu ve anlaşıldı
- [ ] Environment variables dokümante edildi
- [ ] Troubleshooting guide hazır
- [ ] Team members bilgilendirildi

## 🎯 Final Checks

- [ ] Tüm testler geçti
- [ ] Production URL çalışıyor
- [ ] SSL sertifikası aktif
- [ ] Monitoring aktif
- [ ] Backup stratejisi hazır
- [ ] Team hazır ve bilgilendirildi

---

**Deployment Tarihi:** _______________
**Deployed By:** _______________
**Production URL:** _______________

