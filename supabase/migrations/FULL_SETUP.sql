-- ============================================
-- FULL DATABASE SETUP FOR DEGER360
-- Tüm migration'ları içeren tek dosya
-- ============================================

-- 1. Cleanup (000_cleanup.sql)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS customer_tasks CASCADE;
DROP TABLE IF EXISTS process_steps CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS user_auth CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- 2. Initial Schema (001_initial_schema.sql)

-- Müşteriler tablosu
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  full_name TEXT NOT NULL,
  address TEXT,
  tc_kimlik TEXT,
  dosya_takip_numarasi TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dosyalar/Davalar tablosu
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  case_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  
  -- Araç bilgileri
  vehicle_plate TEXT NOT NULL,
  vehicle_brand_model TEXT NOT NULL,
  accident_date DATE NOT NULL,
  accident_location TEXT,
  
  -- Finansal bilgiler
  damage_amount DECIMAL(10,2),
  value_loss_amount DECIMAL(10,2),
  fault_rate INTEGER DEFAULT 0,
  estimated_compensation DECIMAL(10,2),
  commission_rate INTEGER DEFAULT 20,
  
  -- Süreç bilgileri
  current_stage TEXT DEFAULT 'başvuru',
  assigned_lawyer TEXT,
  
  -- Tarihler
  start_date TIMESTAMPTZ DEFAULT NOW(),
  estimated_completion_date TIMESTAMPTZ,
  completion_date TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Belgeler tablosu
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  
  category TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  
  uploaded_by TEXT DEFAULT 'customer',
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  
  description TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Süreç adımları tablosu
CREATE TABLE IF NOT EXISTS process_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  
  step_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'waiting',
  
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  duration_days INTEGER,
  
  completed_tasks TEXT[],
  missing_items TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(case_id, step_order)
);

-- Müşteri görevleri tablosu
CREATE TABLE IF NOT EXISTS customer_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL,
  
  status TEXT DEFAULT 'pending',
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  
  related_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  
  deadline TIMESTAMPTZ,
  urgent BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aktivite/Hareketler tablosu
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  
  performed_by TEXT,
  user_name TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Finansal işlemler tablosu
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  
  amount DECIMAL(10,2) NOT NULL,
  payment_type TEXT NOT NULL,
  payment_method TEXT,
  
  status TEXT DEFAULT 'pending',
  payment_date TIMESTAMPTZ,
  
  iban TEXT,
  account_holder TEXT,
  
  description TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bildirimler tablosu
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auth kullanıcıları için müşteri bağlantısı
CREATE TABLE IF NOT EXISTS user_auth (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'customer',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(customer_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cases_customer_id ON cases(customer_id);
CREATE INDEX IF NOT EXISTS idx_cases_case_number ON cases(case_number);
CREATE INDEX IF NOT EXISTS idx_customers_dosya_takip_numarasi ON customers(dosya_takip_numarasi);
CREATE INDEX IF NOT EXISTS idx_documents_case_id ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_process_steps_case_id ON process_steps(case_id);
CREATE INDEX IF NOT EXISTS idx_activities_case_id ON activities(case_id);
CREATE INDEX IF NOT EXISTS idx_customer_tasks_case_id ON customer_tasks(case_id);
CREATE INDEX IF NOT EXISTS idx_notifications_customer_id ON notifications(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_case_id ON payments(case_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
DROP TRIGGER IF EXISTS update_cases_updated_at ON cases;
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
DROP TRIGGER IF EXISTS update_process_steps_updated_at ON process_steps;
DROP TRIGGER IF EXISTS update_customer_tasks_updated_at ON customer_tasks;
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
DROP TRIGGER IF EXISTS update_user_auth_updated_at ON user_auth;

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_steps_updated_at BEFORE UPDATE ON process_steps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_tasks_updated_at BEFORE UPDATE ON customer_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_auth_updated_at BEFORE UPDATE ON user_auth
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Dosya Takip Numarası Fonksiyonları

-- Dosya takip numarası üretme fonksiyonu
CREATE OR REPLACE FUNCTION generate_dosya_takip_numarasi()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- 100000 ile 999999 arası rastgele 6 haneli numara üret
    new_number := LPAD((FLOOR(RANDOM() * 900000) + 100000)::TEXT, 6, '0');
    
    -- Bu numaranın kullanılıp kullanılmadığını kontrol et
    SELECT EXISTS(SELECT 1 FROM customers WHERE dosya_takip_numarasi = new_number) INTO exists_check;
    
    -- Eğer kullanılmamışsa döndür
    IF NOT exists_check THEN
      RETURN new_number;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Yeni müşteri eklendiğinde otomatik dosya takip numarası ata
CREATE OR REPLACE FUNCTION auto_assign_dosya_takip_numarasi()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.dosya_takip_numarasi IS NULL THEN
    NEW.dosya_takip_numarasi := generate_dosya_takip_numarasi();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger oluştur
DROP TRIGGER IF EXISTS trigger_auto_assign_dosya_takip_numarasi ON customers;
CREATE TRIGGER trigger_auto_assign_dosya_takip_numarasi
  BEFORE INSERT ON customers
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_dosya_takip_numarasi();

-- 4. Seed Data (003_seed_data.sql)

-- Test müşterisi oluşturma
INSERT INTO customers (id, email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'ahmet@example.com',
  '0532 123 45 67',
  'Ahmet Yılmaz',
  'İstanbul, Türkiye',
  '12345678901',
  '100001'
);

-- Test davası oluşturma
INSERT INTO cases (
  id,
  customer_id,
  case_number,
  status,
  vehicle_plate,
  vehicle_brand_model,
  accident_date,
  accident_location,
  damage_amount,
  value_loss_amount,
  fault_rate,
  estimated_compensation,
  commission_rate,
  current_stage,
  assigned_lawyer,
  start_date,
  estimated_completion_date
)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'DK-2024-542',
  'active',
  '34 ABC 123',
  'Renault Megane',
  '2024-08-05',
  'İstanbul, Beşiktaş',
  45000.00,
  38500.00,
  100,
  38500.00,
  20,
  'evrak',
  'Av. Ayşe Demir',
  '2024-11-15',
  '2025-03-15'
);

-- Süreç adımları
INSERT INTO process_steps (case_id, step_order, title, description, status, start_date, end_date, duration_days, completed_tasks)
VALUES
  ('22222222-2222-2222-2222-222222222222', 1, 'Başvuru Alındı', 'Formunuz başarıyla alındı', 'completed', '2024-11-15', '2024-11-15', 1, ARRAY['Form gönderildi', 'İlk değerlendirme yapıldı']),
  ('22222222-2222-2222-2222-222222222222', 2, 'İlk Görüşme', 'Av. Ayşe Demir ile görüşmeniz yapıldı', 'completed', '2024-11-16', '2024-11-16', 1, ARRAY['Telefon görüşmesi tamamlandı', 'Dosya bilgileri alındı']),
  ('22222222-2222-2222-2222-222222222222', 3, 'Evrak Toplama ve Ekspertiz', 'Kaza tutanağı ve faturalar bekleniyor', 'active', '2024-11-17', NULL, NULL, ARRAY['Kaza tutanağı alındı', 'Ekspertiz raporu hazırlandı', 'Değer kaybı: 38.500 TL tespit edildi']),
  ('22222222-2222-2222-2222-222222222222', 4, 'Sigorta Başvurusu', 'Evraklar tamamlandıktan sonra', 'waiting', NULL, NULL, NULL, ARRAY[]::TEXT[]),
  ('22222222-2222-2222-2222-222222222222', 5, 'Müzakere', 'Sigorta şirketi ile anlaşma süreci', 'waiting', NULL, NULL, NULL, ARRAY[]::TEXT[]),
  ('22222222-2222-2222-2222-222222222222', 6, 'Ödeme', 'Para transferi ve komisyon kesintisi', 'waiting', NULL, NULL, NULL, ARRAY[]::TEXT[]);

-- Müşteri görevleri
INSERT INTO customer_tasks (case_id, title, description, task_type, status, completed, urgent, deadline)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'Tamir faturasını yükle', 'Tamir faturası belgesini sisteme yükleyin', 'document_upload', 'pending', FALSE, TRUE, NOW() + INTERVAL '2 days'),
  ('22222222-2222-2222-2222-222222222222', 'Araç fotoğraflarını yükle', 'Kaza sonrası çekilen araç fotoğraflarını ekleyin', 'photo_upload', 'pending', FALSE, TRUE, NOW() + INTERVAL '3 days'),
  ('22222222-2222-2222-2222-222222222222', 'Ruhsat fotokopisi yükle', 'Araç ruhsatının fotokopisini sisteme ekleyin', 'document_upload', 'completed', TRUE, FALSE, NULL);

-- Aktiviteler
INSERT INTO activities (case_id, type, title, description, performed_by, user_name, created_at)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'milestone', 'Dosyanız oluşturuldu', NULL, 'system', NULL, NOW() - INTERVAL '5 days'),
  ('22222222-2222-2222-2222-222222222222', 'status', 'Kaza tespit tutanağı onaylandı', NULL, 'admin', 'Av. Ayşe Demir', NOW() - INTERVAL '3 days'),
  ('22222222-2222-2222-2222-222222222222', 'message', 'Av. Ayşe Demir bir mesaj gönderdi', 'Ekspertiz raporunuz hazır...', 'admin', 'Av. Ayşe Demir', NOW() - INTERVAL '1 day'),
  ('22222222-2222-2222-2222-222222222222', 'document', 'Yeni belge eklendi: "Tamir Faturası.pdf"', NULL, 'customer', NULL, NOW() - INTERVAL '2 hours');

-- Bildirimler
INSERT INTO notifications (customer_id, case_id, title, message, type, read)
VALUES
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Ekspertiz Raporu Hazır', 'Araç değer kaybı ekspertiz raporunuz hazırlandı. 38.500 TL değer kaybı tespit edildi.', 'success', FALSE),
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Belge Yükleme Gerekli', 'Tamir faturanızı en geç 2 gün içinde yüklemeniz gerekmektedir.', 'warning', FALSE);

-- Ödeme kaydı
INSERT INTO payments (
  case_id,
  amount,
  payment_type,
  payment_method,
  status,
  payment_date,
  iban,
  account_holder,
  description
)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  5930.40,
  'commission',
  'bank_transfer',
  'completed',
  '2024-02-07',
  'TR37 0003 2000 0000 0050 3798 91',
  'Ferhan Dikici',
  'İlk ödeme - komisyon kesintisi'
);
