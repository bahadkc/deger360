-- Örnek müşteri ve dosya ekleme
-- Bu migration örnek bir müşteri ve dosya oluşturur

-- ÖNEMLİ: Önce 005_admin_panel_schema.sql migration'ını çalıştırın!
-- Eğer çalıştırmadıysanız, aşağıdaki kolonları ekleyin:

-- Customers tablosuna eksik kolonları ekle (eğer yoksa)
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS iban TEXT,
ADD COLUMN IF NOT EXISTS payment_person_name TEXT;

-- Cases tablosuna eksik kolonları ekle (eğer yoksa)
ALTER TABLE cases
ADD COLUMN IF NOT EXISTS board_stage TEXT DEFAULT 'basvuru_alindi',
ADD COLUMN IF NOT EXISTS total_payment_amount DECIMAL(10,2);

-- Documents tablosuna eksik kolonları ekle (eğer yoksa)
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS uploaded_by_name TEXT;

-- Index ekle (eğer yoksa)
CREATE INDEX IF NOT EXISTS idx_cases_board_stage ON cases(board_stage);

-- Admin Checklist tablosu (eğer yoksa)
CREATE TABLE IF NOT EXISTS admin_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  task_key TEXT NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  completed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(case_id, task_key)
);

CREATE INDEX IF NOT EXISTS idx_admin_checklist_case_id ON admin_checklist(case_id);
CREATE INDEX IF NOT EXISTS idx_admin_checklist_completed ON admin_checklist(completed);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_admin_checklist_updated_at ON admin_checklist;
CREATE TRIGGER update_admin_checklist_updated_at BEFORE UPDATE ON admin_checklist
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Örnek müşteri
INSERT INTO customers (id, email, phone, full_name, address, tc_kimlik, iban, payment_person_name, dosya_takip_numarasi)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'mehmet.demir@example.com',
  '0533 987 65 43',
  'Mehmet Demir',
  'Ankara, Çankaya, Kızılay Mah. Atatürk Bulvarı No:123',
  '98765432109',
  'TR33 0006 2000 0000 0006 1234 56',
  'Mehmet Demir',
  '100002'
)
ON CONFLICT (id) DO NOTHING;

-- Örnek dosya
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
  total_payment_amount,
  commission_rate,
  current_stage,
  board_stage,
  assigned_lawyer,
  start_date,
  estimated_completion_date
)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  '33333333-3333-3333-3333-333333333333',
  'DK-2024-789',
  'active',
  '06 ABC 456',
  'Volkswagen Golf 1.6 TDI',
  '2024-10-15',
  'Ankara, Etimesgut, Bağlıca Kavşağı',
  52000.00,
  45000.00,
  100,
  45000.00,
  36000.00,
  20,
  'evrak',
  'evrak_ekspertiz',
  'Av. Fatma Yılmaz',
  '2024-10-20',
  '2025-02-20'
)
ON CONFLICT (id) DO NOTHING;

-- Örnek süreç adımları
INSERT INTO process_steps (case_id, step_order, title, description, status, start_date, end_date, duration_days, completed_tasks, missing_items)
VALUES
  ('44444444-4444-4444-4444-444444444444', 1, 'Başvuru Alındı', 'Müşteri başvurusu alındı ve değerlendirildi', 'completed', '2024-10-20', '2024-10-20', 1, ARRAY['Başvuru formu alındı', 'İlk değerlendirme yapıldı'], ARRAY[]::TEXT[]),
  ('44444444-4444-4444-4444-444444444444', 2, 'İlk Görüşme', 'Av. Fatma Yılmaz ile telefon görüşmesi yapıldı', 'completed', '2024-10-21', '2024-10-21', 1, ARRAY['Telefon görüşmesi tamamlandı', 'Dosya bilgileri alındı', 'Müşteri bilgilendirildi'], ARRAY[]::TEXT[]),
  ('44444444-4444-4444-4444-444444444444', 3, 'Evrak Toplama ve Ekspertiz', 'Belgeler toplanıyor ve ekspertiz süreci devam ediyor', 'active', '2024-10-22', NULL, NULL, ARRAY['Kaza tespit tutanağı alındı', 'Ruhsat fotokopisi alındı', 'Kimlik fotokopisi alındı', 'Eksper atandı'], ARRAY['Tamir faturası', 'Araç fotoğrafları', 'Ekspertiz raporu']),
  ('44444444-4444-4444-4444-444444444444', 4, 'Sigorta Başvurusu', 'Evraklar tamamlandıktan sonra sigorta şirketine başvuru yapılacak', 'waiting', NULL, NULL, NULL, ARRAY[]::TEXT[], ARRAY[]::TEXT[]),
  ('44444444-4444-4444-4444-444444444444', 5, 'Müzakere', 'Sigorta şirketi ile anlaşma süreci', 'waiting', NULL, NULL, NULL, ARRAY[]::TEXT[], ARRAY[]::TEXT[]),
  ('44444444-4444-4444-4444-444444444444', 6, 'Ödeme', 'Para transferi ve komisyon kesintisi', 'waiting', NULL, NULL, NULL, ARRAY[]::TEXT[], ARRAY[]::TEXT[])
ON CONFLICT DO NOTHING;

-- Örnek belgeler
INSERT INTO documents (case_id, name, file_path, file_size, file_type, category, status, uploaded_by, uploaded_by_name, uploaded_at)
VALUES
  ('44444444-4444-4444-4444-444444444444', 'Kaza Tespit Tutanağı.pdf', 'documents/44444444-4444-4444-4444-444444444444/kaza_tespit_tutanagi_1234567890.pdf', 245760, 'pdf', 'kaza_tespit_tutanagi', 'approved', 'customer', 'Mehmet Demir', '2024-10-22 10:30:00'),
  ('44444444-4444-4444-4444-444444444444', 'Ruhsat Fotokopisi.pdf', 'documents/44444444-4444-4444-4444-444444444444/ruhsat_fotokopisi_1234567891.pdf', 189440, 'pdf', 'ruhsat_fotokopisi', 'approved', 'customer', 'Mehmet Demir', '2024-10-22 11:15:00'),
  ('44444444-4444-4444-4444-444444444444', 'Kimlik Fotokopisi.pdf', 'documents/44444444-4444-4444-4444-444444444444/kimlik_fotokopisi_1234567892.pdf', 156672, 'pdf', 'kimlik_fotokopisi', 'approved', 'customer', 'Mehmet Demir', '2024-10-22 11:20:00')
ON CONFLICT DO NOTHING;

-- Örnek müşteri görevleri
INSERT INTO customer_tasks (case_id, title, description, task_type, status, completed, urgent, deadline)
VALUES
  ('44444444-4444-4444-4444-444444444444', 'Tamir faturasını yükle', 'Araç tamir faturasını sisteme yükleyin', 'document_upload', 'pending', FALSE, TRUE, NOW() + INTERVAL '3 days'),
  ('44444444-4444-4444-4444-444444444444', 'Araç fotoğraflarını yükle', 'Kaza sonrası çekilen araç fotoğraflarını ekleyin', 'photo_upload', 'pending', FALSE, TRUE, NOW() + INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- Örnek admin checklist (bazı görevler tamamlanmış)
INSERT INTO admin_checklist (case_id, task_key, title, completed, completed_at, completed_by)
VALUES
  ('44444444-4444-4444-4444-444444444444', 'musteri_arac_bilgileri', 'Müşteri ve araç bilgileri toplandı', TRUE, '2024-10-21 14:00:00', 'Av. Fatma Yılmaz'),
  ('44444444-4444-4444-4444-444444444444', 'kaza_tespit_tutanagi', 'Kaza tespit tutanağı alındı', TRUE, '2024-10-22 10:30:00', 'Av. Fatma Yılmaz'),
  ('44444444-4444-4444-4444-444444444444', 'ruhsat_fotokopisi', 'Ruhsat fotokopisi alındı', TRUE, '2024-10-22 11:15:00', 'Av. Fatma Yılmaz'),
  ('44444444-4444-4444-4444-444444444444', 'kimlik_fotokopisi', 'Kimlik fotokopisi alındı', TRUE, '2024-10-22 11:20:00', 'Av. Fatma Yılmaz'),
  ('44444444-4444-4444-4444-444444444444', 'eksper_atandi', 'Eksper atandı', TRUE, '2024-10-23 09:00:00', 'Av. Fatma Yılmaz'),
  ('44444444-4444-4444-4444-444444444444', 'arac_fotograflari', 'Araç fotoğrafları alındı', FALSE, NULL, NULL),
  ('44444444-4444-4444-4444-444444444444', 'tamir_yapildi', 'Tamir yapıldı', FALSE, NULL, NULL),
  ('44444444-4444-4444-4444-444444444444', 'tamir_faturasi', 'Tamir faturası alındı', FALSE, NULL, NULL)
ON CONFLICT DO NOTHING;

-- Örnek aktiviteler
INSERT INTO activities (case_id, type, title, description, performed_by, user_name, created_at)
VALUES
  ('44444444-4444-4444-4444-444444444444', 'milestone', 'Dosya oluşturuldu', 'Müşteri dosyası sisteme kaydedildi', 'system', NULL, '2024-10-20 09:00:00'),
  ('44444444-4444-4444-4444-444444444444', 'status', 'İlk görüşme tamamlandı', 'Av. Fatma Yılmaz ile telefon görüşmesi yapıldı', 'admin', 'Av. Fatma Yılmaz', '2024-10-21 14:30:00'),
  ('44444444-4444-4444-4444-444444444444', 'document', 'Kaza tespit tutanağı yüklendi', 'Müşteri tarafından kaza tespit tutanağı sisteme yüklendi', 'customer', 'Mehmet Demir', '2024-10-22 10:30:00'),
  ('44444444-4444-4444-4444-444444444444', 'status', 'Eksper atandı', 'Bağımsız eksper ataması yapıldı', 'admin', 'Av. Fatma Yılmaz', '2024-10-23 09:00:00')
ON CONFLICT DO NOTHING;
