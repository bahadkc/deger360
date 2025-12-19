# 🔐 Admin Panel Giriş Bilgileri

Admin paneline giriş yapmak için önce bir admin kullanıcı oluşturmanız gerekiyor.

## 📋 Adım Adım Admin Kullanıcı Oluşturma

### 1. Supabase Authentication'da Kullanıcı Oluşturun

1. **Supabase Dashboard**'a gidin: https://supabase.com/dashboard
2. Projenizi seçin
3. Sol menüden **"Authentication"** > **"Users"** seçin
4. **"Add user"** > **"Create new user"** butonuna tıklayın
5. Formu doldurun:
   - **Email:** `admin@deger360.com` (veya istediğiniz email)
   - **Password:** `Admin123!` (veya güçlü bir şifre - en az 6 karakter)
   - ✅ **Auto Confirm User** işaretleyin
6. **"Create user"** butonuna tıklayın

### 2. User ID'yi Kopyalayın

1. Oluşturulan kullanıcıyı bulun
2. **User ID**'yi kopyalayın (UUID formatında, örn: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### 3. SQL Editor'de Admin Rolü Atayın

1. Supabase Dashboard'da **"SQL Editor"** menüsüne gidin
2. **"New query"** butonuna tıklayın
3. Aşağıdaki SQL'i yapıştırın ve `USER_ID_BURAYA` kısmını kopyaladığınız User ID ile değiştirin:

```sql
-- Admin kullanıcı oluşturma
INSERT INTO user_auth (id, customer_id, role)
VALUES (
  'USER_ID_BURAYA',  -- Buraya Authentication'dan kopyaladığınız User ID
  NULL,              -- Admin'in customer_id'si yok
  'admin'            -- Role: 'admin' veya 'lawyer'
);
```

**Örnek:**
```sql
INSERT INTO user_auth (id, customer_id, role)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  NULL,
  'admin'
);
```

4. **"Run"** butonuna tıklayın
5. ✅ "INSERT 0 1" mesajını görmelisiniz

### 4. Admin Paneline Giriş Yapın

1. Tarayıcınızda şu adrese gidin: `http://localhost:3000/admin/giris`
2. Giriş bilgilerini girin:
   - **E-posta:** `admin@deger360.com` (Adım 1'de oluşturduğunuz email)
   - **Şifre:** `Admin123!` (Adım 1'de belirlediğiniz şifre)
3. **"Giriş Yap"** butonuna tıklayın
4. Admin paneline yönlendirileceksiniz! 🎉

## 🔑 Varsayılan Admin Bilgileri (Test İçin)

Eğer hızlı test için varsayılan bir admin kullanıcı oluşturmak isterseniz:

**Email:** `admin@deger360.com`  
**Password:** `Admin123!`

**ÖNEMLİ:** Production ortamında mutlaka güçlü bir şifre kullanın!

## 🛠️ Sorun Giderme

### "Bu hesap admin yetkisine sahip değil" hatası alıyorsanız:

1. `user_auth` tablosunda kullanıcınızın `role` alanının `'admin'` veya `'lawyer'` olduğundan emin olun
2. SQL Editor'de şu sorguyu çalıştırın:

```sql
SELECT * FROM user_auth WHERE id = 'USER_ID_BURAYA';
```

3. Eğer kayıt yoksa veya `role` yanlışsa, yukarıdaki INSERT komutunu tekrar çalıştırın

### Kullanıcı oluşturuldu ama giriş yapamıyorum:

1. Email ve şifrenin doğru olduğundan emin olun
2. Supabase Authentication'da kullanıcının **"Email Confirmed"** durumunun `true` olduğunu kontrol edin
3. Kullanıcı oluştururken **"Auto Confirm User"** seçeneğini işaretlediğinizden emin olun

## 📝 Birden Fazla Admin Kullanıcı Oluşturma

Aynı adımları takip ederek istediğiniz kadar admin kullanıcı oluşturabilirsiniz. Her kullanıcı için:
1. Authentication'da kullanıcı oluşturun
2. User ID'yi kopyalayın
3. `user_auth` tablosuna `role='admin'` ile ekleyin

## 🔒 Güvenlik Notları

- ✅ Production ortamında güçlü şifreler kullanın
- ✅ Admin şifrelerini düzenli olarak değiştirin
- ✅ Her admin kullanıcısı için ayrı email kullanın
- ✅ Gereksiz admin hesaplarını silin veya devre dışı bırakın
