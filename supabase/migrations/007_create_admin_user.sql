-- Admin kullanıcı oluşturma scripti
-- Bu script'i çalıştırmadan önce Supabase Authentication'da bir kullanıcı oluşturmanız gerekiyor

-- ADIMLAR:
-- 1. Supabase Dashboard > Authentication > Users > Add user > Create new user
-- 2. Email: admin@deger360.com (veya istediğiniz email)
-- 3. Password: Admin123! (veya güçlü bir şifre)
-- 4. Auto Confirm User: ✅ işaretleyin
-- 5. Kullanıcı oluşturulduktan sonra USER ID'yi kopyalayın
-- 6. Aşağıdaki SQL'i çalıştırın ve USER_ID'yi değiştirin

-- ÖRNEK: Admin kullanıcı oluşturma
-- Aşağıdaki USER_ID'yi Authentication'dan aldığınız gerçek user ID ile değiştirin

-- INSERT INTO user_auth (id, customer_id, role)
-- VALUES (
--   'USER_ID_BURAYA',  -- Authentication'dan kopyaladığınız user ID
--   NULL,              -- Admin'in customer_id'si yok
--   'admin'            -- Role: 'admin' veya 'lawyer'
-- );

-- NOT: Eğer test için hızlı bir admin kullanıcı oluşturmak istiyorsanız:
-- 1. Authentication'da kullanıcı oluşturun
-- 2. User ID'yi kopyalayın
-- 3. Yukarıdaki INSERT komutunu çalıştırın
