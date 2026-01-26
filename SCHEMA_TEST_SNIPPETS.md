# Google Rich Results Test - Schema Code Snippets

Bu dosya, Google Rich Results Test aracında test etmek için hazırlanmış JSON-LD code snippet'lerini içerir.

## Test Adresi
🔗 **Google Rich Results Test:** https://search.google.com/test/rich-results

---

## 1. LegalService Schema (Ana Sayfa)

**Test Sayfası:** Ana sayfa (`/` veya `https://deger360.net`)

**Code Snippet (HTML formatında):**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LegalService",
  "name": "Değer360",
  "image": "https://deger360.net/icon.png",
  "description": "Araç değer kaybı, kaza tazminatı ve sigorta hukuku konularında uzman danışmanlık hizmeti.",
  "telephone": "+90 505 705 33 05",
  "priceRange": "Ücretsiz Danışmanlık",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Türkiye",
    "addressCountry": "TR"
  },
  "url": "https://deger360.net"
}
</script>
```

**Test Yöntemi:**
1. Google Rich Results Test sayfasına gidin
2. "Test by URL" sekmesini seçin
3. URL: `https://deger360.net` yazın
4. VEYA "Test by Code" sekmesini seçin ve yukarıdaki HTML kodunu yapıştırın
5. "Test URL" veya "Test Code" butonuna tıklayın
6. ✅ Yeşil tik görünmeli: "LegalService" etiketi valid olmalı

---

## 2. FAQPage Schema (SSS Sayfası)

**Test Sayfası:** SSS sayfası (`/sss` veya `https://deger360.net/sss`)

**Code Snippet (HTML formatında):**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Değer kaybı tazminatı nedir?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Kaza sonrası aracınızın piyasa değerinde oluşan düşüşün tazminatıdır. Tamir edilmiş olsa bile, kaza geçirmiş araçların değeri düşer ve bu farkı karşı tarafın sigortasından alabilirsiniz."
      }
    },
    {
      "@type": "Question",
      "name": "Ne kadar tazminat alabilirim?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Tazminat tutarı aracınızın markası, modeli, yaşı, hasar tutarı ve piyasa değerine göre değişir."
      }
    },
    {
      "@type": "Question",
      "name": "Ön ödeme yapmam gerekiyor mu?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Hayır! Biz ön ödeme almıyoruz. Masraflar bizde. Kendi ücretimizi sadece size tazminatı gönderirken alıyoruz. Risk tamamen bizde."
      }
    },
    {
      "@type": "Question",
      "name": "Süreç ne kadar sürer?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ortalama 3-6 ay içinde sonuçlanır. İlk başvurudan sonra 2 saat içinde sizinle iletişime geçeriz ve süreci başlatırız."
      }
    },
    {
      "@type": "Question",
      "name": "Hangi evraklara ihtiyacım var?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Kaza tutanağı, ekspertiz raporu, tamir faturası ve araç ruhsatı gibi temel evraklar yeterli. Eksik evrakları biz topluyoruz."
      }
    },
    {
      "@type": "Question",
      "name": "Kazanma garantisi var mı?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "%97 başarı oranımız ve 750+ başarılı davamız var. Ücretsiz değerlendirme ile durumunuzu öğrenebilirsiniz."
      }
    },
    {
      "@type": "Question",
      "name": "Araç değer kaybı başvurusu için zaman aşımı süresi nedir?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Kaza tarihinden itibaren 2 yıl içerisinde başvuru yapılması gerekmektedir. Bu süreyi geçiren dosyalar zaman aşımına uğrar."
      }
    },
    {
      "@type": "Question",
      "name": "Değer360 ile değer kaybı başvurusu ücretli mi?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Hayır, ön inceleme ve başvuru süreci tamamen ücretsizdir. Sadece tazminat başarıyla alındığında, önceden belirlenen oran üzerinden hizmet bedeli alınır."
      }
    }
  ]
}
</script>
```

**Test Yöntemi:**
1. Google Rich Results Test sayfasına gidin
2. "Test by URL" sekmesini seçin
3. URL: `https://deger360.net/sss` yazın
4. VEYA "Test by Code" sekmesini seçin ve yukarıdaki HTML kodunu yapıştırın
5. "Test URL" veya "Test Code" butonuna tıklayın
6. ✅ Yeşil tik görünmeli: "FAQPage" etiketi valid olmalı
7. ✅ 8 soru görünmeli ve her biri valid olmalı

---

## 3. HowTo Schema (Süreç Sayfası)

**Test Sayfası:** Süreç sayfası (`/surec` veya `https://deger360.net/surec`)

**Code Snippet (HTML formatında):**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "6 Adımda Araç Değer Kaybı Alma Süreci",
  "description": "Değer360 ile araç değer kaybı tazminatı alma sürecinin adım adım rehberi. Tüm yasal işlemleri profesyonel ekibimiz yönetiyor.",
  "step": [
    {
      "@type": "HowToStep",
      "name": "İlk Başvuru & Değerlendirme",
      "text": "Formunuzu doldurduğunuzda, uzman ekibimiz 2 saat içinde sizinle iletişime geçer.",
      "position": 1
    },
    {
      "@type": "HowToStep",
      "name": "Evrak Toplama & Ekspertiz",
      "text": "Gerekli tüm evrakları sizin için toplarız. Profesyonel ekspertiz raporunuzu hazırlarız.",
      "position": 2
    },
    {
      "@type": "HowToStep",
      "name": "Sigorta Başvurusu",
      "text": "Karşı tarafın sigortasına resmi başvurumuzu yaparız.",
      "position": 3
    },
    {
      "@type": "HowToStep",
      "name": "Müzakere & Takip",
      "text": "Sigorta şirketi ile müzakereleri gerçekleştiriz. Her adımı size bildiririz.",
      "position": 4
    },
    {
      "@type": "HowToStep",
      "name": "Tahkim/Dava Süreci",
      "text": "Gerekirse hukuki süreci başlatırız. Tüm işlemler bizim sorumluluğumuzda.",
      "position": 5
    },
    {
      "@type": "HowToStep",
      "name": "Ödeme & Sonuç",
      "text": "Süreç sonunda hak ediş tutarınız hesabınıza gönderilir.",
      "position": 6
    }
  ]
}
</script>
```

**Test Yöntemi:**
1. Google Rich Results Test sayfasına gidin
2. "Test by URL" sekmesini seçin
3. URL: `https://deger360.net/surec` yazın
4. VEYA "Test by Code" sekmesini seçin ve yukarıdaki HTML kodunu yapıştırın
5. "Test URL" veya "Test Code" butonuna tıklayın
6. ✅ Yeşil tik görünmeli: "HowTo" etiketi valid olmalı
7. ✅ 6 adım görünmeli ve her biri valid olmalı

---

## Test Sonuçları Kontrol Listesi

Her test için şunları kontrol edin:

### ✅ LegalService Schema
- [ ] Schema türü: "LegalService" görünüyor mu?
- [ ] Name: "Değer360" görünüyor mu?
- [ ] Telephone: "+90 505 705 33 05" görünüyor mu?
- [ ] PriceRange: "Ücretsiz Danışmanlık" görünüyor mu?
- [ ] Address: Türkiye bilgisi görünüyor mu?
- [ ] Hata mesajı yok mu?

### ✅ FAQPage Schema
- [ ] Schema türü: "FAQPage" görünüyor mu?
- [ ] Toplam 8 soru görünüyor mu?
- [ ] Her soru için "Question" ve "Answer" yapısı doğru mu?
- [ ] Hata mesajı yok mu?

### ✅ HowTo Schema
- [ ] Schema türü: "HowTo" görünüyor mu?
- [ ] Toplam 6 adım görünüyor mu?
- [ ] Her adım için "position" numarası doğru mu?
- [ ] Her adım için "name" ve "text" alanları dolu mu?
- [ ] Hata mesajı yok mu?

---

## Önemli Notlar

1. **Canlıya almadan önce test edin:** Kodları production'a almadan önce mutlaka test edin
2. **URL testi tercih edilir:** Eğer siteniz canlıdaysa, URL ile test etmek daha doğru sonuç verir
3. **Code snippet testi:** Eğer site henüz canlı değilse, code snippet ile test edebilirsiniz
4. **Hata durumunda:** Eğer hata görürseniz, hata mesajını okuyun ve gerekli düzeltmeleri yapın
5. **Google'ın indekslemesi:** Test başarılı olsa bile, Google'ın bu şemaları indekslemesi birkaç gün sürebilir

---

## Ek Kaynaklar

- 📖 [Google Rich Results Test](https://search.google.com/test/rich-results)
- 📖 [Schema.org LegalService](https://schema.org/LegalService)
- 📖 [Schema.org FAQPage](https://schema.org/FAQPage)
- 📖 [Schema.org HowTo](https://schema.org/HowTo)
