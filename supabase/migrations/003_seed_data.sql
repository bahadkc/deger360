-- Test müşterisi oluşturma
INSERT INTO customers (id, email, phone, full_name, address, tc_kimlik)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'ahmet@example.com',
  '0532 123 45 67',
  'Ahmet Yılmaz',
  'İstanbul, Türkiye',
  '12345678901'
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

-- Süreç adımları oluşturma
INSERT INTO process_steps (case_id, step_order, title, description, status, start_date, end_date, duration_days, completed_tasks)
VALUES
  ('22222222-2222-2222-2222-222222222222', 1, 'Başvuru Alındı', 'Formunuz başarıyla alındı', 'completed', '2024-11-15', '2024-11-15', 1, ARRAY['Form gönderildi', 'İlk değerlendirme yapıldı']),
  ('22222222-2222-2222-2222-222222222222', 2, 'İlk Görüşme', 'Av. Ayşe Demir ile görüşmeniz yapıldı', 'completed', '2024-11-16', '2024-11-16', 1, ARRAY['Telefon görüşmesi tamamlandı', 'Dosya bilgileri alındı']),
  ('22222222-2222-2222-2222-222222222222', 3, 'Evrak Toplama ve Ekspertiz', 'Kaza tutanağı ve faturalar bekleniyor', 'active', '2024-11-17', NULL, NULL, ARRAY['Kaza tutanağı alındı', 'Ekspertiz raporu hazırlandı', 'Değer kaybı: 38.500 TL tespit edildi']),
  ('22222222-2222-2222-2222-222222222222', 4, 'Sigorta Başvurusu', 'Evraklar tamamlandıktan sonra', 'waiting', NULL, NULL, NULL, ARRAY[]::TEXT[]),
  ('22222222-2222-2222-2222-222222222222', 5, 'Müzakere', 'Sigorta şirketi ile anlaşma süreci', 'waiting', NULL, NULL, NULL, ARRAY[]::TEXT[]),
  ('22222222-2222-2222-2222-222222222222', 6, 'Ödeme', 'Para transferi ve komisyon kesintisi', 'waiting', NULL, NULL, NULL, ARRAY[]::TEXT[]);

-- Müşteri görevleri oluşturma
INSERT INTO customer_tasks (case_id, title, description, task_type, status, completed, urgent, deadline)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'Tamir faturasını yükle', 'Tamir faturası belgesini sisteme yükleyin', 'document_upload', 'pending', FALSE, TRUE, NOW() + INTERVAL '2 days'),
  ('22222222-2222-2222-2222-222222222222', 'Araç fotoğraflarını yükle', 'Kaza sonrası çekilen araç fotoğraflarını ekleyin', 'photo_upload', 'pending', FALSE, TRUE, NOW() + INTERVAL '3 days'),
  ('22222222-2222-2222-2222-222222222222', 'Ruhsat fotokopisi yükle', 'Araç ruhsatının fotokopisini sisteme ekleyin', 'document_upload', 'completed', TRUE, FALSE, NULL);

-- Aktiviteler oluşturma
INSERT INTO activities (case_id, type, title, description, performed_by, user_name, created_at)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'milestone', 'Dosyanız oluşturuldu', NULL, 'system', NULL, NOW() - INTERVAL '5 days'),
  ('22222222-2222-2222-2222-222222222222', 'status', 'Kaza tespit tutanağı onaylandı', NULL, 'admin', 'Av. Ayşe Demir', NOW() - INTERVAL '3 days'),
  ('22222222-2222-2222-2222-222222222222', 'message', 'Av. Ayşe Demir bir mesaj gönderdi', 'Ekspertiz raporunuz hazır...', 'admin', 'Av. Ayşe Demir', NOW() - INTERVAL '1 day'),
  ('22222222-2222-2222-2222-222222222222', 'document', 'Yeni belge eklendi: "Tamir Faturası.pdf"', NULL, 'customer', NULL, NOW() - INTERVAL '2 hours');

-- Bildirimler oluşturma
INSERT INTO notifications (customer_id, case_id, title, message, type, read)
VALUES
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Ekspertiz Raporu Hazır', 'Araç değer kaybı ekspertiz raporunuz hazırlandı. 38.500 TL değer kaybı tespit edildi.', 'success', FALSE),
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Belge Yükleme Gerekli', 'Tamir faturanızı en geç 2 gün içinde yüklemeniz gerekmektedir.', 'warning', FALSE);

-- Ödeme kaydı oluşturma
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
