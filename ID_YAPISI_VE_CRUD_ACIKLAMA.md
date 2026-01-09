# ID Yapısı ve CRUD Operasyonları Açıklaması

**Tarih:** 2025-01-XX  
**Amaç:** ID'lerin neden farklı olduğunu ve CRUD operasyonlarının ne demek olduğunu açıklamak

---

## 📚 CRUD Operasyonları Nedir?

**CRUD**, veritabanı işlemlerinin temel 4 işlemini ifade eder:

### C - **CREATE** (Oluştur)
Yeni bir kayıt eklemek.

**Örnek:**
```javascript
// Yeni müşteri oluştur
await db.customers.insert({
  full_name: "Ahmet Yılmaz",
  email: "ahmet@example.com",
  phone: "0555 123 45 67"
});
```

**SQL Karşılığı:**
```sql
INSERT INTO customers (full_name, email, phone)
VALUES ('Ahmet Yılmaz', 'ahmet@example.com', '0555 123 45 67');
```

---

### R - **READ** (Okuma)
Kayıtları okumak, sorgulamak.

**Örnek:**
```javascript
// Tüm müşterileri getir
const customers = await db.customers.getAll();

// ID'ye göre müşteri getir
const customer = await db.customers.getById('123');

// Email'e göre müşteri getir
const customer = await db.customers.getByEmail('ahmet@example.com');
```

**SQL Karşılığı:**
```sql
-- Tüm müşteriler
SELECT * FROM customers;

-- ID'ye göre
SELECT * FROM customers WHERE id = '123';

-- Email'e göre
SELECT * FROM customers WHERE email = 'ahmet@example.com';
```

---

### U - **UPDATE** (Güncelleme)
Mevcut bir kaydı güncellemek.

**Örnek:**
```javascript
// Müşteri bilgilerini güncelle
await db.customers.update('123', {
  phone: "0555 999 88 77",
  address: "Yeni adres"
});
```

**SQL Karşılığı:**
```sql
UPDATE customers
SET phone = '0555 999 88 77', address = 'Yeni adres'
WHERE id = '123';
```

---

### D - **DELETE** (Silme)
Bir kaydı silmek.

**Örnek:**
```javascript
// Müşteriyi sil
await db.customers.delete('123');
```

**SQL Karşılığı:**
```sql
DELETE FROM customers WHERE id = '123';
```

---

## 🆔 Neden Farklı ID'ler Var?

Her tablonun kendi benzersiz ID'si vardır. Bunun nedenleri:

### 1. **Her Tablo Bağımsız Bir Varlıktır**

```
customers tablosu → customer.id
cases tablosu → case.id
user_auth tablosu → user_auth.id
documents tablosu → document.id
```

Her tablo kendi kayıtlarını yönetir ve her kayıt benzersiz bir ID'ye sahiptir.

---

### 2. **Gerçek Veri Örneği**

Aşağıdaki gerçek verilerden bir örnek:

```json
{
  "customer_id": "e729d294-eefd-4914-880e-be489362bc51",
  "full_name": "Freshport Tarım Gıda İhr.İth.San.Tic.Ltd.Şti.",
  "email": "123@gmail.com",
  "case_id": "4b8a1f18-864c-477f-8be4-e113566f5238",
  "case_number": "DK-2026-179",
  "user_auth_id": "db07bf4d-feb5-4d28-8d27-524f9ff3eea7",
  "role": "customer"
}
```

**Burada:**
- `customer_id`: Müşterinin benzersiz ID'si
- `case_id`: Case'in (dava/dosya) benzersiz ID'si
- `user_auth_id`: Kullanıcı yetkilendirme kaydının benzersiz ID'si

---

### 3. **ID'lerin İlişkileri**

#### **customers.id** (Müşteri ID'si)
```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Bu tablonun kendi benzersiz ID'si
  full_name TEXT,
  email TEXT,
  ...
);
```

**Kullanım:**
- Müşteriyi benzersiz olarak tanımlar
- `cases.customer_id` ile ilişkilendirilir
- `user_auth.customer_id` ile ilişkilendirilir

---

#### **cases.id** (Case ID'si)
```sql
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Bu tablonun kendi benzersiz ID'si
  customer_id UUID REFERENCES customers(id),
  -- Hangi müşteriye ait olduğunu gösterir
  case_number TEXT UNIQUE,
  ...
);
```

**Kullanım:**
- Case'i (dava/dosya) benzersiz olarak tanımlar
- `documents.case_id` ile ilişkilendirilir
- `admin_checklist.case_id` ile ilişkilendirilir
- `payments.case_id` ile ilişkilendirilir

**Önemli:** `cases.id` ile `cases.customer_id` farklı şeylerdir:
- `cases.id`: Case'in kendi benzersiz ID'si
- `cases.customer_id`: Bu case'in hangi müşteriye ait olduğunu gösterir

---

#### **user_auth.id** (Kullanıcı Yetkilendirme ID'si)
```sql
CREATE TABLE user_auth (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  -- Supabase Auth sistemindeki kullanıcı ID'si ile aynı
  customer_id UUID REFERENCES customers(id),
  -- Hangi müşteriye ait olduğunu gösterir (müşteriler için)
  role TEXT DEFAULT 'customer',
  ...
);
```

**Kullanım:**
- Kullanıcı yetkilendirme kaydını benzersiz olarak tanımlar
- `auth.users.id` ile aynıdır (Supabase Auth sistemi)
- Müşteriler için: `customer_id` dolu
- Adminler için: `customer_id = NULL`

---

#### **documents.id** (Belge ID'si)
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Bu tablonun kendi benzersiz ID'si
  case_id UUID REFERENCES cases(id),
  -- Hangi case'e ait olduğunu gösterir
  name TEXT,
  file_path TEXT,
  ...
);
```

**Kullanım:**
- Belgeyi benzersiz olarak tanımlar
- `case_id` ile hangi case'e ait olduğunu gösterir

---

## 🔗 İlişki Şeması

### Basit Örnek

Bir müşteri, bir case ve bir belge için:

```
┌─────────────────────┐
│   customers         │
│   id: "abc-123"     │ ← customer_id
│   full_name: "Ahmet"│
└──────────┬──────────┘
           │
           │ customer_id ile bağlanır
           │
           ▼
┌─────────────────────┐
│   cases             │
│   id: "def-456"     │ ← case_id
│   customer_id: "abc-123" │
│   case_number: "DK-2025-001" │
└──────────┬──────────┘
           │
           │ case_id ile bağlanır
           │
           ▼
┌─────────────────────┐
│   documents         │
│   id: "ghi-789"     │ ← document_id
│   case_id: "def-456"│
│   name: "belge.pdf" │
└─────────────────────┘
```

---

### Karmaşık Örnek (Müşteri + Case + Auth)

```
┌─────────────────────┐
│   auth.users        │
│   id: "auth-111"    │ ← Supabase Auth ID
│   email: "ahmet@..."│
└──────────┬──────────┘
           │
           │ id ile aynı
           │
           ▼
┌─────────────────────┐
│   user_auth         │
│   id: "auth-111"    │ ← user_auth.id (auth.users.id ile aynı)
│   customer_id: "abc-123" │
│   role: "customer" │
└──────────┬──────────┘
           │
           │ customer_id ile bağlanır
           │
           ▼
┌─────────────────────┐
│   customers         │
│   id: "abc-123"     │ ← customer_id
│   full_name: "Ahmet"│
│   email: "ahmet@..."│
└──────────┬──────────┘
           │
           │ customer_id ile bağlanır
           │
           ▼
┌─────────────────────┐
│   cases             │
│   id: "def-456"     │ ← case_id
│   customer_id: "abc-123" │
│   case_number: "DK-2025-001" │
└─────────────────────┘
```

---

## 📊 Case'ler Müşterinin Bütün Bilgileri Mi?

**Hayır!** Case'ler müşterinin **sadece bir dava/dosyası**dır. İşte fark:

### **customers** Tablosu (Müşteri Bilgileri)
```sql
customers:
  - id (UUID)
  - full_name (Ad Soyad)
  - email (E-posta)
  - phone (Telefon)
  - address (Adres)
  - tc_kimlik (TC Kimlik No)
  - iban (IBAN)
  - payment_person_name (Ödeme Yapılacak Kişi)
  - dosya_takip_numarasi (Dosya Takip No)
```

**Bu bilgiler müşterinin kişisel bilgileridir.**

---

### **cases** Tablosu (Dava/Dosya Bilgileri)
```sql
cases:
  - id (UUID)
  - customer_id (Hangi müşteriye ait)
  - case_number (Dosya numarası: DK-2025-001)
  - vehicle_plate (Araç plakası)
  - vehicle_brand_model (Araç marka/model)
  - accident_date (Kaza tarihi)
  - accident_location (Kaza yeri)
  - damage_amount (Hasar tutarı)
  - value_loss_amount (Değer kaybı)
  - fault_rate (Kusur oranı)
  - estimated_compensation (Tahmini tazminat)
  - board_stage (Durum: basvuru_alindi, evrak_ekspertiz, vb.)
  - assigned_lawyer (Atanan avukat)
```

**Bu bilgiler belirli bir dava/dosya ile ilgilidir.**

---

### İlişki

```
1 Müşteri (customer) → N Case (dava/dosya)
```

**Örnek:**
- Ahmet Yılmaz (1 müşteri)
  - Case 1: 2024'teki kaza (DK-2024-001)
  - Case 2: 2025'teki kaza (DK-2025-002)

Her case ayrı bir dava/dosyadır, ama aynı müşteriye ait olabilir.

---

## 🎯 ID'lerin Kullanım Senaryoları

### Senaryo 1: Müşteri Bilgilerini Güncelleme

```javascript
// Müşterinin telefonunu güncelle
await db.customers.update(customer_id, {
  phone: "0555 999 88 77"
});
```

**Bu işlem:**
- `customers` tablosundaki kaydı günceller
- `cases` tablosuna dokunmaz
- Sadece müşterinin kişisel bilgilerini değiştirir

---

### Senaryo 2: Case Bilgilerini Güncelleme

```javascript
// Case'in durumunu güncelle
await db.cases.update(case_id, {
  board_stage: "evrak_ekspertiz"
});
```

**Bu işlem:**
- `cases` tablosundaki kaydı günceller
- `customers` tablosuna dokunmaz
- Sadece bu case'in durumunu değiştirir

---

### Senaryo 3: Müşterinin Case'lerini Getirme

```javascript
// Müşterinin tüm case'lerini getir
const cases = await db.cases.getByCustomerId(customer_id);
```

**Bu işlem:**
- `cases` tablosunda `customer_id` eşleşen kayıtları getirir
- Müşterinin tüm davalarını/dosyalarını gösterir

---

## 📋 Özet Tablo

| ID Türü | Tablo | Amaç | Örnek Değer |
|---------|-------|------|-------------|
| `customer_id` | `customers.id` | Müşteriyi benzersiz tanımlar | `e729d294-eefd-4914-880e-be489362bc51` |
| `case_id` | `cases.id` | Case'i benzersiz tanımlar | `4b8a1f18-864c-477f-8be4-e113566f5238` |
| `user_auth_id` | `user_auth.id` | Kullanıcı yetkilendirmesini tanımlar | `db07bf4d-feb5-4d28-8d27-524f9ff3eea7` |
| `document_id` | `documents.id` | Belgeyi benzersiz tanımlar | `ghi-789-...` |

---

## 🔍 Neden Bu Yapı?

### 1. **Normalizasyon (Veritabanı Tasarımı)**
Her tablo kendi sorumluluğuna sahiptir:
- `customers`: Müşteri bilgileri
- `cases`: Dava/dosya bilgileri
- `documents`: Belge bilgileri

### 2. **Esneklik**
- Bir müşterinin birden fazla case'i olabilir
- Bir case'in birden fazla belgesi olabilir
- İlişkiler foreign key'lerle yönetilir

### 3. **Performans**
- Her tablo kendi index'lerine sahiptir
- Sadece ihtiyaç duyulan veriler çekilir
- İlişkiler hızlı sorgulanır

### 4. **Bakım Kolaylığı**
- Müşteri bilgisi değişirse sadece `customers` güncellenir
- Case bilgisi değişirse sadece `cases` güncellenir
- Her tablo bağımsız yönetilebilir

---

## 💡 Pratik Örnekler

### Örnek 1: Yeni Müşteri ve Case Oluşturma

```javascript
// 1. Müşteri oluştur (CREATE)
const customer = await db.customers.insert({
  full_name: "Ahmet Yılmaz",
  email: "ahmet@example.com"
});
// customer.id = "abc-123" (otomatik oluşturuldu)

// 2. Case oluştur (CREATE)
const case = await db.cases.insert({
  customer_id: customer.id,  // ← Müşteriye bağla
  case_number: "DK-2025-001",
  vehicle_plate: "34ABC123"
});
// case.id = "def-456" (otomatik oluşturuldu)
```

**Sonuç:**
- `customer.id` = "abc-123"
- `case.id` = "def-456"
- `case.customer_id` = "abc-123" (ilişki)

---

### Örnek 2: Müşterinin Case'lerini Okuma (READ)

```javascript
// Müşterinin ID'si ile case'leri getir
const cases = await db.cases.getByCustomerId("abc-123");
```

**SQL:**
```sql
SELECT * FROM cases WHERE customer_id = 'abc-123';
```

**Sonuç:**
- Müşterinin tüm case'leri döner
- Her case'in kendi `id`'si vardır
- Hepsi aynı `customer_id`'ye sahiptir

---

### Örnek 3: Case Bilgilerini Güncelleme (UPDATE)

```javascript
// Case'in durumunu güncelle
await db.cases.update("def-456", {
  board_stage: "evrak_ekspertiz"
});
```

**SQL:**
```sql
UPDATE cases
SET board_stage = 'evrak_ekspertiz'
WHERE id = 'def-456';
```

**Sonuç:**
- Sadece `cases` tablosu güncellenir
- `customers` tablosu etkilenmez
- Case'in kendi ID'si kullanılır

---

## 🎓 Öğrenme Noktaları

1. **Her tablo kendi ID'sine sahiptir** - Bu normal ve doğru bir yaklaşımdır
2. **Foreign key'ler ilişkileri kurar** - `cases.customer_id` müşteriye bağlar
3. **CRUD operasyonları temel işlemlerdir** - Her veritabanı sisteminde vardır
4. **Case ≠ Müşteri** - Case bir dava/dosyadır, müşteri kişidir
5. **ID'ler benzersizdir** - Her kayıt kendi benzersiz kimliğine sahiptir

---

**Not:** Bu yapı standart veritabanı tasarım prensiplerine uygundur ve profesyonel uygulamalarda yaygın olarak kullanılır.
