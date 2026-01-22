# Müşteri Veri Formatı Açıklaması

Bu dosya, 30-40 örnek müşteri verisini sisteme yüklemek için kullanılacak format açıklamasını içerir.

## Format Seçenekleri

İki format seçeneğiniz var:
1. **CSV Formatı** (`musteri_ornek_format.csv`) - Excel'de kolayca doldurulabilir
2. **JSON Formatı** (`musteri_ornek_format.json`) - Programatik kullanım için

## Zorunlu Alanlar (Müşteri)

- `full_name`: Müşterinin tam adı (örn: "Ahmet Yılmaz")
- `email`: E-posta adresi (benzersiz olmalı, örn: "ahmet.yilmaz@example.com")
- `case_number`: Dava numarası (benzersiz olmalı, örn: "DK-2024-001")
- `vehicle_plate`: Araç plakası (örn: "34ABC123")
- `vehicle_brand_model`: Araç marka ve modeli (örn: "Toyota Corolla")
- `accident_date`: Kaza tarihi (YYYY-MM-DD formatında, örn: "2024-01-15")

## Opsiyonel Alanlar (Müşteri)

- `phone`: Telefon numarası (örn: "05321234567")
- `address`: Adres (örn: "İstanbul Kadıköy")
- `tc_kimlik`: TC Kimlik No (11 haneli)
- `dosya_takip_numarasi`: Dosya takip numarası (benzersiz, boş bırakılırsa otomatik oluşturulur)
- `iban`: IBAN numarası (örn: "TR330006100519786457841326")
- `payment_person_name`: Ödeme yapılacak kişi adı
- `insurance_company`: Sigorta şirketi adı (örn: "Anadolu Sigorta")

## Dava Bilgileri

### Zorunlu Alanlar
- `case_number`: Dava numarası (yukarıda belirtildi)
- `vehicle_plate`: Araç plakası (yukarıda belirtildi)
- `vehicle_brand_model`: Araç marka/model (yukarıda belirtildi)
- `accident_date`: Kaza tarihi (yukarıda belirtildi)
- `accident_location`: Kaza yeri (örn: "Kadıköy Bağdat Caddesi")
- `damage_amount`: Hasar tutarı (TL, örn: 50000)
- `fault_rate`: Kusur oranı (0-100 arası, örn: 100, 80, 70, 90)
- `notary_and_file_expenses`: Noter ve dosya masrafları (TL, örn: 3500)
- `assigned_lawyer`: Atanmış avukat (örn: "Av. Mehmet Demir")

## Dava Aşamaları

### `current_stage` (Mevcut Aşama)
Şu değerlerden biri olmalı:
- `başvuru`
- `evrak`
- `ekspertiz`
- `sigorta`
- `tahkim`
- `mahkeme`
- `ödeme`

### `board_stage` (Board Aşaması)
Şu değerlerden biri olmalı:
- `basvuru_alindi` - Başvuru Alındı
- `evrak_ekspertiz` - Evrak Toplama ve Eksper
- `sigorta_basvurusu` - Sigorta Başvurusu
- `muzakere` - Müzakere
- `tahkim` - Tahkim
- `odeme` - Ödeme
- `tamamlandi` - Tamamlandı

### `insurance_response` (Sigorta Cevabı)
- `accepted` - Sigorta kabul etti
- `rejected` - Sigorta reddetti
- Boş bırakılabilir (henüz cevap verilmediyse)

## Örnek Kullanım

### CSV Formatında:
```csv
full_name,email,phone,case_number,vehicle_plate,vehicle_brand_model,accident_date,board_stage
Ahmet Yılmaz,ahmet@example.com,05321234567,DK-2024-001,34ABC123,Toyota Corolla,2024-01-15,basvuru_alindi
```

### JSON Formatında:
```json
{
  "full_name": "Ahmet Yılmaz",
  "email": "ahmet@example.com",
  "phone": "05321234567",
  "case_number": "DK-2024-001",
  "vehicle_plate": "34ABC123",
  "vehicle_brand_model": "Toyota Corolla",
  "accident_date": "2024-01-15",
  "board_stage": "basvuru_alindi"
}
```

## Önemli Notlar

1. **Email ve case_number benzersiz olmalı** - Sistemde zaten varsa hata verir
2. **dosya_takip_numarasi benzersiz olmalı** - Boş bırakılırsa otomatik oluşturulur
3. **Tarih formatı**: YYYY-MM-DD (örn: 2024-01-15)
4. **Tutarlar**: Sayısal değerler (nokta ile ondalık, örn: 50000.50)
5. **Acente ataması**: Verileri gönderdiğinizde hangi acente hesabına atanacağını belirtmeniz gerekecek

## Sonraki Adımlar

1. CSV veya JSON dosyasını doldurun (30-40 müşteri için)
2. Dosyayı bana gönderin
3. Hangi acente hesabına atanacağını belirtin (email veya admin_id)
4. Ben verileri Supabase'e yükleyeceğim ve acente atamasını yapacağım
