-- Import 40 sample customers and cases
-- Assign all cases to acente account: yz@gmail.com (id: 8c295fe5-c5d2-40a4-8858-3e42d57b3455)

-- Ensure insurance_company column exists (may be missing in some migration paths)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS insurance_company TEXT;
COMMENT ON COLUMN customers.insurance_company IS 'Müşterinin sigorta şirketi adı';

DO $$
DECLARE
    customer_id_val UUID;
    case_id_val UUID;
    acente_admin_id UUID;
BEGIN
    -- Use first admin/superadmin from auth if exists (new projects may not have ornekacente)
    SELECT id INTO acente_admin_id FROM user_auth WHERE role IN ('superadmin', 'admin', 'acente') LIMIT 1;
    IF acente_admin_id IS NULL THEN
        SELECT id INTO acente_admin_id FROM auth.users LIMIT 1;
    END IF;
    -- Helper function to insert customer and case
    -- Customer 1: Ahmet Yılmaz
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('ahmet.yilmaz@example.com', '05321234567', 'Ahmet Yılmaz', 'İstanbul Kadıköy', '12345678901', 'DK-2024-001', 'TR330006100519786457841326', 'Ahmet Yılmaz', 'Anadolu Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'ahmet.yilmaz@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-001', '34ABC123', 'Toyota Corolla', '2024-01-15', 'Kadıköy Bağdat Caddesi', 50000, 45000, 0, 36000, 20, 'başvuru', 'basvuru_alindi', 'Av. Mehmet Demir', 'active', 45000, 500, 'accepted')
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-001';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 2: Fatma Kaya
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('fatma.kaya@example.com', '05329876543', 'Fatma Kaya', 'Ankara Çankaya', '98765432109', 'DK-2024-002', 'TR330006100519786457841327', 'Fatma Kaya', 'Allianz Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'fatma.kaya@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-002', '06XYZ789', 'Honda Civic', '2024-02-20', 'Çankaya Kızılay', 75000, 70000, 10, 63000, 20, 'evrak', 'evrak_ekspertiz', 'Av. Ayşe Yıldız', 'active', 70000, 750, 'rejected')
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-002';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 3: Mehmet Demir
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('mehmet.demir@example.com', '05321112233', 'Mehmet Demir', 'İzmir Bornova', '11223344556', 'DK-2024-003', 'TR330006100519786457841328', 'Mehmet Demir', 'Aksigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'mehmet.demir@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-003', '35DEF456', 'Ford Focus', '2024-03-10', 'Bornova Ege Üniversitesi', 60000, 55000, 20, 44000, 20, 'ekspertiz', 'evrak_ekspertiz', 'Av. Mehmet Demir', 'active', 55000, 600, NULL)
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-003';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 4: Ayşe Şahin
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('ayse.sahin@example.com', '05324445566', 'Ayşe Şahin', 'Bursa Nilüfer', '22334455667', 'DK-2024-004', 'TR330006100519786457841329', 'Ayşe Şahin', 'Groupama Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'ayse.sahin@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-004', '16GHI789', 'Volkswagen Golf', '2024-04-05', 'Nilüfer Özlüce', 80000, 75000, 0, 60000, 20, 'sigorta', 'sigorta_basvurusu', 'Av. Ayşe Yıldız', 'active', 75000, 800, 'accepted')
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-004';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 5: Ali Veli
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('ali.veli@example.com', '05327778899', 'Ali Veli', 'Antalya Muratpaşa', '33445566778', 'DK-2024-005', 'TR330006100519786457841330', 'Ali Veli', 'Ray Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'ali.veli@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-005', '07JKL012', 'Hyundai Elantra', '2024-05-12', 'Muratpaşa Lara', 55000, 50000, 30, 35000, 20, 'muzakere', 'muzakere', 'Av. Mehmet Demir', 'active', 50000, 550, 'rejected')
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-005';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 6: Sinem Gür
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('sinem.gur6@example.com', '05169064511', 'Sinem Gür', 'Mersin Yenişehir', '79439391177', 'DK-2024-006', 'TR028296628849512534809825', 'Sinem Gür', 'Güneş Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'sinem.gur6@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-006', '33TPA4022', 'Peugeot 3008', '2024-05-16', 'Mersin Cumhuriyet Caddesi', 135380, 69312, 0, 69312, 25, 'başvuru', 'muzakere', 'Av. Elif Karaca', 'active', 68312, 1000, 'rejected')
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-006';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 7: Can Yavuz
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('can.yavuz7@example.com', '05745486253', 'Can Yavuz', 'İstanbul Ataşehir', '78802895833', 'DK-2024-007', 'TR446016492048121594624296', 'Can Yavuz', 'Anadolu Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'can.yavuz7@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-007', '35NJJ2420', 'Volkswagen Golf', '2024-10-01', 'İstanbul İnönü Bulvarı', 150524, 39427, 20, 35484, 20, 'tahkim', 'basvuru_alindi', 'Av. Elif Karaca', 'active', 34984, 500, NULL)
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-007';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 8: Mert Sönmez
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('mert.sonmez8@example.com', '05818991431', 'Mert Sönmez', 'Ankara Çankaya', '10087395380', 'DK-2024-008', 'TR270462945088665889434534', 'Mert Sönmez', 'Türkiye Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'mert.sonmez8@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-008', '7LEB9671', 'Opel Astra', '2025-11-03', 'Ankara Bağdat Caddesi', 166951, 78146, 10, 74238, 20, 'ödeme', 'basvuru_alindi', 'Av. Elif Karaca', 'active', 73738, 500, NULL)
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-008';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 9: Onur Gür
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('onur.gur9@example.com', '05662637892', 'Onur Gür', 'İstanbul Kadıköy', '54348641065', 'DK-2024-009', 'TR637502759393622179717190', 'Onur Gür', 'Türkiye Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'onur.gur9@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-009', '41JX4866', 'Toyota Corolla', '2024-05-22', 'İstanbul E5 Üzeri', 28584, 13108, 30, 11141, 15, 'mahkeme', 'evrak_ekspertiz', 'Av. Onur Doğan', 'active', 11141, 0, NULL)
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-009';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 10: Sinem Kılıç
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('sinem.kilic10@example.com', '05036581573', 'Sinem Kılıç', 'Antalya Muratpaşa', '10803517588', 'DK-2024-010', 'TR515109739682016411588105', 'Sinem Kılıç', 'AXA Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'sinem.kilic10@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-010', '55VQX1726', 'Nissan Qashqai', '2024-08-08', 'Antalya Organize Sanayi Bölgesi', 139357, 104493, 20, 94043, 20, 'ekspertiz', 'evrak_ekspertiz', 'Av. Elif Karaca', 'active', 93043, 1000, NULL)
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-010';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 11: Berk Kaya
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('berk.kaya11@example.com', '05797174856', 'Berk Kaya', 'Ankara Mamak', '87676754478', 'DK-2024-011', 'TR386352696782458436766238', 'Berk Kaya', 'Allianz Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'berk.kaya11@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-011', '1VR8021', 'Mercedes C200', '2024-01-05', 'Ankara İnönü Bulvarı', 53235, 29992, 40, 23993, 20, 'sigorta', 'evrak_ekspertiz', 'Av. Zeynep Kaya', 'active', 22993, 1000, 'rejected')
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-011';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 12: Naz Kaplan
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('naz.kaplan12@example.com', '05110193427', 'Naz Kaplan', 'Kocaeli İzmit', '95364797814', 'DK-2024-012', 'TR139942728388805912495585', 'Naz Kaplan', 'Anadolu Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'naz.kaplan12@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-012', '1LY8219', 'Volkswagen Golf', '2024-11-18', 'Kocaeli Organize Sanayi Bölgesi', 52133, 16872, 20, 15184, 20, 'mahkeme', 'evrak_ekspertiz', 'Av. Onur Doğan', 'active', 14934, 250, NULL)
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-012';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 13: Furkan Çetin
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('furkan.cetin13@example.com', '05451939045', 'Furkan Çetin', 'Kocaeli Gebze', '67186428339', 'DK-2024-013', 'TR951481659907549588484469', 'Furkan Çetin', 'Allianz Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'furkan.cetin13@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-013', '33DK1080', 'Renault Clio', '2023-08-23', 'Kocaeli İnönü Bulvarı', 29139, 19018, 0, 19018, 25, 'başvuru', 'tamamlandi', 'Av. Onur Doğan', 'completed', 18268, 750, NULL)
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-013';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 14: Buse Aslan
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('buse.aslan14@example.com', '05666108169', 'Buse Aslan', 'Kocaeli İzmit', '87069901463', 'DK-2024-014', 'TR972956794436584430885783', 'Buse Aslan', 'Doğa Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'buse.aslan14@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-014', '1HNE1492', 'Opel Astra', '2024-09-06', 'Kocaeli Sahil Yolu', 36573, 9558, 20, 8602, 20, 'ekspertiz', 'evrak_ekspertiz', 'Av. Cem Kılıç', 'active', 8602, 0, NULL)
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-014';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 15: Derya Karaca
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('derya.karaca15@example.com', '05150321527', 'Derya Karaca', 'Bursa Nilüfer', '75461198174', 'DK-2024-015', 'TR339181623203162373213301', 'Derya Karaca', 'Türkiye Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'derya.karaca15@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-015', '34AGW7568', 'BMW 320i', '2023-08-06', 'Bursa Sahil Yolu', 174673, 90913, 10, 86367, 25, 'mahkeme', 'tahkim', 'Av. Hakan Yavuz', 'active', 85367, 1000, NULL)
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-015';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 16: Oğuz Çetin
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('oguz.cetin16@example.com', '05121955845', 'Oğuz Çetin', 'Kocaeli Gebze', '85237909256', 'DK-2024-016', 'TR649040299407903152797592', 'Oğuz Çetin', 'Sompo Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'oguz.cetin16@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-016', '33VS88', 'Citroen C4', '2024-11-05', 'Kocaeli E5 Üzeri', 140701, 68536, 40, 54828, 20, 'başvuru', 'tamamlandi', 'Av. Hakan Yavuz', 'completed', 54578, 250, NULL)
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-016';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 17: İrem Korkmaz
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('irem.korkmaz17@example.com', '05312670651', 'İrem Korkmaz', 'İstanbul Şişli', '97871955501', 'DK-2024-017', 'TR615337459448936523664237', 'İrem Korkmaz', 'Zurich Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'irem.korkmaz17@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-017', '55BNX9661', 'BMW 320i', '2024-03-22', 'İstanbul Atatürk Caddesi', 54871, 29743, 50, 22307, 15, 'evrak', 'basvuru_alindi', 'Av. Hakan Yavuz', 'active', 21557, 750, NULL)
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-017';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 18: Onur Aslan
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('onur.aslan18@example.com', '05730933970', 'Onur Aslan', 'Mersin Mezitli', '55308820688', 'DK-2024-018', 'TR330274200155947882217694', 'Onur Aslan', 'Neova Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'onur.aslan18@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-018', '1HD3482', 'Skoda Octavia', '2025-01-25', 'Mersin Cumhuriyet Caddesi', 127448, 90255, 20, 81229, 25, 'başvuru', 'evrak_ekspertiz', 'Av. Zeynep Kaya', 'active', 80229, 1000, NULL)
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-018';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 19: Gizem Polat
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('gizem.polat19@example.com', '05017370424', 'Gizem Polat', 'Bursa Yıldırım', '80883043751', 'DK-2024-019', 'TR255613441269418780211274', 'Gizem Polat', 'AXA Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'gizem.polat19@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-019', '26XP7222', 'Dacia Duster', '2025-07-08', 'Bursa Bağdat Caddesi', 141318, 84829, 10, 80587, 25, 'başvuru', 'basvuru_alindi', 'Av. Selin Arslan', 'active', 79587, 1000, NULL)
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-019';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 20: Mert Koç
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('mert.koc20@example.com', '05233767852', 'Mert Koç', 'Bursa Yıldırım', '22554413506', 'DK-2024-020', 'TR590401520882739834446868', 'Mert Koç', 'Aksigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'mert.koc20@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-020', '41RHM6399', 'Volvo S60', '2023-10-27', 'Bursa İnönü Bulvarı', 60058, 33229, 30, 28244, 20, 'başvuru', 'odeme', 'Av. Mehmet Demir', 'active', 27994, 250, 'rejected')
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-020';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 21: Onur Aydın
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('onur.aydin21@example.com', '05029408581', 'Onur Aydın', 'Eskişehir Tepebaşı', '50485736559', 'DK-2024-021', 'TR696977260356572121744053', 'Onur Aydın', 'Güneş Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'onur.aydin21@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-021', '6FWJ6314', 'Ford Focus', '2023-11-29', 'Eskişehir Cumhuriyet Caddesi', 42162, 19826, 30, 16852, 20, 'sigorta', 'sigorta_basvurusu', 'Av. Elif Karaca', 'active', 16352, 500, 'accepted')
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-021';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 22: Tolga Karaca
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('tolga.karaca22@example.com', '05914616865', 'Tolga Karaca', 'Mersin Yenişehir', '20822210432', 'DK-2024-022', 'TR234834703983761277363989', 'Tolga Karaca', 'HDI Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'tolga.karaca22@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-022', '34JYP249', 'Seat Leon', '2024-07-08', 'Mersin Bağdat Caddesi', 87177, 34011, 10, 32310, 25, 'tahkim', 'odeme', 'Av. Hakan Yavuz', 'active', 31310, 1000, 'accepted')
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-022';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 23: Burak Tuna
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('burak.tuna23@example.com', '05050925047', 'Burak Tuna', 'İzmir Konak', '20969458828', 'DK-2024-023', 'TR063881336661446634801434', 'Burak Tuna', 'Allianz Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'burak.tuna23@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-023', '33KY9069', 'Nissan Qashqai', '2025-02-05', 'İzmir D100 Karayolu', 151874, 111490, 50, 83617, 20, 'tahkim', 'evrak_ekspertiz', 'Av. Derya Aksoy', 'active', 83117, 500, NULL)
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-023';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 24: Sinem Avcı
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('sinem.avci24@example.com', '05737776496', 'Sinem Avcı', 'İstanbul Şişli', '52640722765', 'DK-2024-024', 'TR650710856465725301412759', 'Sinem Avcı', 'Doğa Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'sinem.avci24@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-024', '1TJT414', 'Nissan Qashqai', '2024-06-12', 'İstanbul İnönü Bulvarı', 175818, 57104, 40, 45683, 15, 'başvuru', 'sigorta_basvurusu', 'Av. Selin Arslan', 'active', 44683, 1000, 'rejected')
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-024';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 25: Ceren Bulut
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('ceren.bulut25@example.com', '05504337266', 'Ceren Bulut', 'Samsun Atakum', '71328087801', 'DK-2024-025', 'TR474260805165099783942596', 'Ceren Bulut', 'Neova Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'ceren.bulut25@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-025', '7SPN1415', 'Opel Astra', '2025-05-30', 'Samsun E5 Üzeri', 59633, 23790, 30, 20221, 15, 'tahkim', 'muzakere', 'Av. Hakan Yavuz', 'active', 20221, 0, 'accepted')
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-025';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 26: Derya Kaplan
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('derya.kaplan26@example.com', '05953429280', 'Derya Kaplan', 'Mersin Yenişehir', '40351139598', 'DK-2024-026', 'TR340339455965498016799428', 'Derya Kaplan', 'Aksigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'derya.kaplan26@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-026', '1QL8524', 'Kia Sportage', '2023-12-17', 'Mersin Cumhuriyet Caddesi', 33735, 18905, 30, 16069, 20, 'sigorta', 'evrak_ekspertiz', 'Av. Cem Kılıç', 'active', 15569, 500, NULL)
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-026';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 27: Selin Karaca
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('selin.karaca27@example.com', '05332444650', 'Selin Karaca', 'Adana Çukurova', '92151991940', 'DK-2024-027', 'TR235495370731890401748287', 'Selin Karaca', 'Aksigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'selin.karaca27@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-027', '1DR9400', 'Seat Leon', '2025-01-12', 'Adana Organize Sanayi Bölgesi', 161097, 78526, 20, 70673, 25, 'sigorta', 'muzakere', 'Av. Derya Aksoy', 'active', 70423, 250, 'rejected')
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-027';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 28: Mert Tuna
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('mert.tuna28@example.com', '05258651456', 'Mert Tuna', 'Adana Çukurova', '50955540407', 'DK-2024-028', 'TR621804188125628575950328', 'Mert Tuna', 'Sompo Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'mert.tuna28@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-028', '7GTQ3573', 'BMW 320i', '2025-02-17', 'Adana Bağdat Caddesi', 44842, 16544, 20, 14889, 20, 'mahkeme', 'tahkim', 'Av. Onur Doğan', 'active', 13889, 1000, NULL)
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-028';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 29: Burak Korkmaz
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('burak.korkmaz29@example.com', '05965448527', 'Burak Korkmaz', 'Ankara Çankaya', '64403465976', 'DK-2024-029', 'TR217888749429556599564972', 'Burak Korkmaz', 'Türkiye Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'burak.korkmaz29@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-029', '7CFM6805', 'Mazda 3', '2024-06-27', 'Ankara Bağdat Caddesi', 140524, 99958, 10, 94960, 15, 'mahkeme', 'evrak_ekspertiz', 'Av. Onur Doğan', 'active', 94710, 250, NULL)
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-029';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 30: Deniz Polat
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('deniz.polat30@example.com', '05559565327', 'Deniz Polat', 'Kocaeli İzmit', '91425898081', 'DK-2024-030', 'TR241491548429115581503036', 'Deniz Polat', 'Sompo Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'deniz.polat30@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-030', '16UM7509', 'Kia Sportage', '2024-06-22', 'Kocaeli Atatürk Caddesi', 126085, 79405, 0, 79405, 20, 'sigorta', 'tamamlandi', 'Av. Derya Aksoy', 'completed', 78655, 750, 'accepted')
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-030';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 31: Mert Yıldız
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('mert.yildiz31@example.com', '05987215477', 'Mert Yıldız', 'Bursa Yıldırım', '55775605582', 'DK-2024-031', 'TR404956916238198151363208', 'Mert Yıldız', 'Güneş Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'mert.yildiz31@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-031', '1DT697', 'Opel Astra', '2024-06-11', 'Bursa E5 Üzeri', 119807, 45251, 10, 42988, 15, 'ödeme', 'tamamlandi', 'Av. Elif Karaca', 'completed', 42988, 0, NULL)
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-031';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 32: Arda Tuna
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('arda.tuna32@example.com', '05936630477', 'Arda Tuna', 'Eskişehir Tepebaşı', '82947358498', 'DK-2024-032', 'TR505327410307899780516253', 'Arda Tuna', 'Güneş Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'arda.tuna32@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-032', '7YAW8386', 'Volkswagen Golf', '2024-01-12', 'Eskişehir Organize Sanayi Bölgesi', 111862, 48713, 30, 41406, 15, 'ödeme', 'evrak_ekspertiz', 'Av. Mehmet Demir', 'active', 40906, 500, 'accepted')
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-032';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 33: Deniz Erdem
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('deniz.erdem33@example.com', '05655478318', 'Deniz Erdem', 'Ankara Çankaya', '99514214656', 'DK-2024-033', 'TR192147888664372348290742', 'Deniz Erdem', 'Güneş Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'deniz.erdem33@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-033', '6QRV1454', 'Skoda Octavia', '2025-11-09', 'Ankara Bağdat Caddesi', 37025, 9787, 40, 7829, 25, 'sigorta', 'muzakere', 'Av. Cem Kılıç', 'active', 6829, 1000, 'accepted')
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-033';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 34: Oğuz Ergin
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('oguz.ergin34@example.com', '05254796109', 'Oğuz Ergin', 'Bursa Nilüfer', '91706313202', 'DK-2024-034', 'TR610440457789239743208551', 'Oğuz Ergin', 'Anadolu Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'oguz.ergin34@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-034', '35NGK4792', 'Dacia Duster', '2025-08-07', 'Bursa İnönü Bulvarı', 134870, 73978, 40, 59182, 20, 'başvuru', 'evrak_ekspertiz', 'Av. Selin Arslan', 'active', 59182, 0, NULL)
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-034';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 35: Esra Avcı
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('esra.avci35@example.com', '05288530627', 'Esra Avcı', 'Samsun İlkadım', '31909576506', 'DK-2024-035', 'TR368344175236964960922010', 'Esra Avcı', 'Türkiye Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'esra.avci35@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-035', '1GRN4755', 'Dacia Duster', '2023-11-14', 'Samsun Atatürk Caddesi', 171184, 54839, 20, 49355, 20, 'evrak', 'tahkim', 'Av. Derya Aksoy', 'active', 49105, 250, NULL)
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-035';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 36: Eren Kaplan
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('eren.kaplan36@example.com', '05906796623', 'Eren Kaplan', 'Adana Seyhan', '28755386534', 'DK-2024-036', 'TR994550537864736062370805', 'Eren Kaplan', 'Türkiye Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'eren.kaplan36@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-036', '16KHW434', 'Hyundai i20', '2024-05-17', 'Adana Atatürk Caddesi', 178350, 110513, 20, 99461, 15, 'başvuru', 'basvuru_alindi', 'Av. Zeynep Kaya', 'active', 99461, 0, NULL)
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-036';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 37: Yusuf Aslan
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('yusuf.aslan37@example.com', '05257866193', 'Yusuf Aslan', 'Bursa Osmangazi', '68854538476', 'DK-2024-037', 'TR577439829156852162521788', 'Yusuf Aslan', 'Sompo Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'yusuf.aslan37@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-037', '41AQQ4717', 'Volvo S60', '2025-02-08', 'Bursa Sahil Yolu', 122994, 33965, 20, 30568, 25, 'evrak', 'tahkim', 'Av. Cem Kılıç', 'active', 29568, 1000, NULL)
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-037';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 38: Gizem Aydın
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('gizem.aydin38@example.com', '05024618968', 'Gizem Aydın', 'Mersin Yenişehir', '21879759909', 'DK-2024-038', 'TR002704798409445481188568', 'Gizem Aydın', 'Türkiye Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'gizem.aydin38@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-038', '33PF5323', 'Kia Sportage', '2025-06-16', 'Mersin Atatürk Caddesi', 40777, 22671, 50, 17003, 20, 'mahkeme', 'evrak_ekspertiz', 'Av. Cem Kılıç', 'active', 16253, 750, NULL)
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-038';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 39: Emre Polat
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('emre.polat39@example.com', '05528686314', 'Emre Polat', 'Antalya Muratpaşa', '40203799502', 'DK-2024-039', 'TR066667197472223376423201', 'Emre Polat', 'AXA Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'emre.polat39@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-039', '16VGF3279', 'Toyota Corolla', '2023-11-18', 'Antalya Sahil Yolu', 99942, 29682, 30, 25229, 20, 'ödeme', 'tahkim', 'Av. Zeynep Kaya', 'active', 24729, 500, 'accepted')
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-039';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

    -- Customer 40: Leyla Toprak
    INSERT INTO customers (email, phone, full_name, address, tc_kimlik, dosya_takip_numarasi, iban, payment_person_name, insurance_company)
    VALUES ('leyla.toprak40@example.com', '05216740282', 'Leyla Toprak', 'Samsun Atakum', '25035751206', 'DK-2024-040', 'TR570943262233289822930434', 'Leyla Toprak', 'Doğa Sigorta')
    ON CONFLICT (email) DO UPDATE SET phone = EXCLUDED.phone, full_name = EXCLUDED.full_name
    RETURNING id INTO customer_id_val;
    
    SELECT id INTO customer_id_val FROM customers WHERE email = 'leyla.toprak40@example.com';
    
    INSERT INTO cases (customer_id, case_number, vehicle_plate, vehicle_brand_model, accident_date, accident_location, damage_amount, value_loss_amount, fault_rate, estimated_compensation, commission_rate, current_stage, board_stage, assigned_lawyer, status, total_payment_amount, notary_and_file_expenses, insurance_response)
    VALUES (customer_id_val, 'DK-2024-040', '55NVW2994', 'Mercedes C200', '2024-12-31', 'Samsun E5 Üzeri', 155599, 78422, 20, 70579, 20, 'ödeme', 'odeme', 'Av. Zeynep Kaya', 'active', 70579, 0, 'rejected')
    ON CONFLICT (case_number) DO UPDATE SET customer_id = EXCLUDED.customer_id
    RETURNING id INTO case_id_val;
    
    SELECT id INTO case_id_val FROM cases WHERE case_number = 'DK-2024-040';
    IF acente_admin_id IS NOT NULL THEN
      INSERT INTO case_admins (case_id, admin_id) VALUES (case_id_val, acente_admin_id) ON CONFLICT DO NOTHING;
    END IF;

END $$;
