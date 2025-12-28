# 🚀 Vercel Deployment Rehberi - Adım Adım

Bu rehber, yeni Vercel hesabıyla projenizi deploy etmeniz için gerekli tüm adımları içerir.

## 📋 Ön Hazırlık

Deploy etmeden önce şunlara ihtiyacınız var:
- ✅ GitHub repository'niz hazır (https://github.com/bahadkc/deger360)
- ✅ Vercel hesabı açıldı
- ✅ Supabase projeniz hazır ve URL/key'leriniz var

---

## 🎯 ADIM 1: Vercel'e GitHub Bağlama

1. **Vercel'e giriş yapın**
   - https://vercel.com adresine gidin
   - "Sign Up" veya "Log In" yapın
   - GitHub hesabınızla giriş yapmanızı öneririz (daha kolay)

2. **GitHub hesabınızı bağlayın**
   - Vercel Dashboard'da "Add New Project" butonuna tıklayın
   - Eğer GitHub bağlı değilse, GitHub hesabınızı bağlamanız istenecek
   - "Continue with GitHub" butonuna tıklayın
   - GitHub'da Vercel'e izin verin

---

## 🎯 ADIM 2: Proje Oluşturma

1. **Repository seçin**
   - Vercel Dashboard'da "Add New Project" butonuna tıklayın
   - Repository listesinden `bahadkc/deger360` repository'sini bulun
   - "Import" butonuna tıklayın

2. **Proje ayarlarını yapılandırın**
   - **Project Name**: `deger360` (veya istediğiniz isim)
   - **Framework Preset**: `Next.js` (otomatik algılanacak)
   - **Root Directory**: `./` (değiştirmeyin)
   - **Build Command**: `npm run build` (otomatik)
   - **Output Directory**: `.next` (otomatik)
   - **Install Command**: `npm install` (otomatik)

3. **"Deploy" butonuna tıklamayın henüz!** 
   - Önce Environment Variables eklememiz gerekiyor

---

## 🎯 ADIM 3: Environment Variables Ekleme (ÇOK ÖNEMLİ!)

Environment Variables eklemeden deploy ederseniz, uygulama çalışmaz!

### 3.1. Supabase Bilgilerinizi Alın

1. **Supabase Dashboard'a gidin**
   - https://supabase.com/dashboard
   - Projenizi açın

2. **Settings > API** bölümüne gidin**
   - **Project URL**: `https://xxxxx.supabase.co` (kopyalayın)
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (kopyalayın)
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (kopyalayın)
     - ⚠️ **DİKKAT**: service_role key'i asla client-side'da kullanmayın!

### 3.2. Vercel'e Environment Variables Ekleyin

1. **Vercel proje ayarlarına gidin**
   - Proje oluşturma sayfasında "Environment Variables" bölümüne gidin
   - Veya deploy sonrası: Project Settings > Environment Variables

2. **Aşağıdaki değişkenleri tek tek ekleyin:**

   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: https://xxxxx.supabase.co
   Environment: Production, Preview, Development (hepsini seçin)
   ```

   ```
   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (tam key'i yapıştırın)
   Environment: Production, Preview, Development (hepsini seçin)
   ```

   ```
   Name: SUPABASE_SERVICE_ROLE_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (tam key'i yapıştırın)
   Environment: Production, Preview, Development (hepsini seçin)
   ```

   ```
   Name: NEXT_PUBLIC_SITE_URL
   Value: https://deger360.vercel.app (veya custom domain'iniz)
   Environment: Production, Preview, Development (hepsini seçin)
   ```

   ```
   Name: NODE_ENV
   Value: production
   Environment: Production (sadece production)
   ```

3. **Her değişkeni ekledikten sonra "Save" butonuna tıklayın**

---

## 🎯 ADIM 4: İlk Deploy

1. **"Deploy" butonuna tıklayın**
   - Vercel otomatik olarak:
     - GitHub'dan kodu çekecek
     - `npm install` çalıştıracak
     - `npm run build` çalıştıracak
     - Deploy edecek

2. **Build loglarını izleyin**
   - Deploy sırasında build loglarını görebilirsiniz
   - Hata olursa buradan görebilirsiniz
   - Genellikle 2-3 dakika sürer

3. **Deploy tamamlandığında**
   - "Congratulations!" mesajı göreceksiniz
   - Projenizin URL'si: `https://deger360-xxxxx.vercel.app`
   - Bu URL'yi kopyalayın ve `NEXT_PUBLIC_SITE_URL` olarak güncelleyin (gerekirse)

---

## 🎯 ADIM 5: Deploy Sonrası Kontroller

### 5.1. Site Çalışıyor mu?

1. **Ana sayfayı açın**
   - Vercel'den verilen URL'yi tarayıcıda açın
   - Ana sayfa yükleniyor mu kontrol edin

2. **API endpoints test edin**
   - `https://your-site.vercel.app/api/health` - Health check
   - `https://your-site.vercel.app/sitemap.xml` - Sitemap
   - `https://your-site.vercel.app/robots.txt` - Robots.txt

### 5.2. Environment Variables Kontrolü

Eğer site çalışmıyorsa:

1. **Vercel Dashboard > Project Settings > Environment Variables**
2. Tüm değişkenlerin doğru eklendiğini kontrol edin
3. **"Redeploy"** butonuna tıklayın (değişkenlerden sonra yeniden deploy gerekir)

### 5.3. Build Loglarını Kontrol Edin

1. **Vercel Dashboard > Deployments**
2. Son deployment'a tıklayın
3. "Build Logs" sekmesine bakın
4. Hata varsa buradan görebilirsiniz

---

## 🔄 Otomatik Deploy (GitHub Integration)

Vercel, GitHub repository'nize bağlandıktan sonra:

- ✅ Her `main` branch'e push'ta otomatik deploy yapar
- ✅ Pull Request'lerde preview deployment oluşturur
- ✅ Deploy durumunu GitHub'da gösterir

**Test etmek için:**
```bash
# Küçük bir değişiklik yapın
echo "# Test" >> README.md
git add .
git commit -m "Test deploy"
git push origin main
```

Vercel otomatik olarak deploy edecektir!

---

## 🌐 Custom Domain Ekleme (Opsiyonel)

1. **Vercel Dashboard > Project Settings > Domains**
2. Domain'inizi ekleyin (örn: `deger360.com`)
3. Vercel size DNS ayarlarını verecek
4. Domain sağlayıcınızda DNS kayıtlarını yapın
5. SSL sertifikası otomatik olarak oluşturulacak (5-10 dakika)

---

## 🐛 Sorun Giderme

### Build Hatası

**Sorun**: Build başarısız oluyor

**Çözüm**:
1. Local'de test edin: `npm run build`
2. Build loglarını kontrol edin
3. Environment variables'ları kontrol edin
4. TypeScript hatalarını kontrol edin: `npx tsc --noEmit`

### Environment Variables Çalışmıyor

**Sorun**: Site açılıyor ama Supabase bağlantısı yok

**Çözüm**:
1. Vercel Dashboard > Environment Variables kontrol edin
2. Değişkenlerin doğru olduğundan emin olun
3. **"Redeploy"** yapın (Environment variables değişikliklerinden sonra gerekir)
4. Browser console'da hataları kontrol edin

### Database Connection Hatası

**Sorun**: Database'e bağlanamıyor

**Çözüm**:
1. Supabase project'inizin aktif olduğundan emin olun
2. Supabase Dashboard > Settings > API'den key'leri kontrol edin
3. RLS (Row Level Security) policies'lerin doğru olduğundan emin olun
4. Supabase project URL'inin doğru olduğundan emin olun

---

## 📊 Monitoring

### Vercel Analytics

1. **Vercel Dashboard > Analytics**
2. Ücretsiz plan'da temel analytics var
3. Daha detaylı analytics için Pro plan gerekir

### Logs

1. **Vercel Dashboard > Deployments > [Deployment] > Logs**
2. Runtime loglarını görebilirsiniz
3. Hata ayıklama için çok faydalı

---

## ✅ Deployment Checklist

Deploy etmeden önce kontrol edin:

- [ ] GitHub repository hazır ve güncel
- [ ] Supabase project hazır
- [ ] Supabase URL ve key'ler hazır
- [ ] Environment variables Vercel'e eklendi
- [ ] Build command doğru (`npm run build`)
- [ ] Framework preset doğru (Next.js)
- [ ] Root directory doğru (`./`)

Deploy sonrası kontrol edin:

- [ ] Site açılıyor mu?
- [ ] Ana sayfa yükleniyor mu?
- [ ] API endpoints çalışıyor mu? (`/api/health`)
- [ ] Form gönderimi çalışıyor mu?
- [ ] Portal girişi çalışıyor mu?
- [ ] Admin panel erişilebilir mi?
- [ ] SSL sertifikası aktif mi? (https://)

---

## 🎉 Tebrikler!

Deploy başarılı olduysa, artık projeniz canlıda! 

**Sonraki Adımlar:**
1. Custom domain ekleyin (opsiyonel)
2. Google Analytics ekleyin (opsiyonel)
3. Sentry error tracking ekleyin (opsiyonel)
4. Post-deployment testleri yapın
5. Team members'ı ekleyin (Vercel Dashboard > Team)

---

## 📞 Yardım

Sorun yaşarsanız:
- Vercel Documentation: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- GitHub Issues: Repository'nizde issue açın

---

**İyi deploylar! 🚀**

