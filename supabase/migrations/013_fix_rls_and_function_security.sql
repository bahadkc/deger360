-- Fix RLS Issues and Function Security
-- Bu migration tüm RLS sorunlarını çözer ve function security'yi düzeltir

-- ============================================
-- 1. RLS ENABLE - Tüm tablolarda RLS'i aktifleştir
-- ============================================

-- Admin Checklist
ALTER TABLE admin_checklist ENABLE ROW LEVEL SECURITY;

-- Cases
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- Customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Process Steps
ALTER TABLE process_steps ENABLE ROW LEVEL SECURITY;

-- Customer Tasks
ALTER TABLE customer_tasks ENABLE ROW LEVEL SECURITY;

-- Activities
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- User Auth
ALTER TABLE user_auth ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. FUNCTION SECURITY - search_path düzeltmeleri
-- ============================================

-- update_updated_at_column function - search_path'i sabitle
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- generate_dosya_takip_numarasi function - search_path'i sabitle
CREATE OR REPLACE FUNCTION generate_dosya_takip_numarasi()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- auto_assign_dosya_takip_numarasi function - search_path'i sabitle
CREATE OR REPLACE FUNCTION auto_assign_dosya_takip_numarasi()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.dosya_takip_numarasi IS NULL THEN
    NEW.dosya_takip_numarasi := generate_dosya_takip_numarasi();
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================
-- 3. EKSİK POLİCYLERİ KONTROL ET VE EKLE
-- ============================================

-- Process Steps için eksik policyleri ekle (eğer yoksa)
DO $$
BEGIN
  -- INSERT policy yoksa ekle
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'process_steps' 
    AND policyname = 'Admins can insert process steps'
  ) THEN
    CREATE POLICY "Admins can insert process steps"
      ON process_steps FOR INSERT
      WITH CHECK (auth.uid() IN (
        SELECT id FROM user_auth 
        WHERE role IN ('superadmin', 'admin', 'lawyer')
      ));
  END IF;

  -- UPDATE policy yoksa ekle
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'process_steps' 
    AND policyname = 'Admins can update process steps'
  ) THEN
    CREATE POLICY "Admins can update process steps"
      ON process_steps FOR UPDATE
      USING (auth.uid() IN (
        SELECT id FROM user_auth 
        WHERE role IN ('superadmin', 'admin', 'lawyer')
      ));
  END IF;

  -- DELETE policy yoksa ekle
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'process_steps' 
    AND policyname = 'Admins can delete process steps'
  ) THEN
    CREATE POLICY "Admins can delete process steps"
      ON process_steps FOR DELETE
      USING (auth.uid() IN (
        SELECT id FROM user_auth 
        WHERE role IN ('superadmin', 'admin', 'lawyer')
      ));
  END IF;
END $$;

-- Activities için eksik policyleri ekle (eğer yoksa)
DO $$
BEGIN
  -- UPDATE policy yoksa ekle
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'activities' 
    AND policyname = 'Admins can update activities'
  ) THEN
    CREATE POLICY "Admins can update activities"
      ON activities FOR UPDATE
      USING (auth.uid() IN (
        SELECT id FROM user_auth 
        WHERE role IN ('superadmin', 'admin', 'lawyer')
      ));
  END IF;

  -- DELETE policy yoksa ekle
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'activities' 
    AND policyname = 'Admins can delete activities'
  ) THEN
    CREATE POLICY "Admins can delete activities"
      ON activities FOR DELETE
      USING (auth.uid() IN (
        SELECT id FROM user_auth 
        WHERE role IN ('superadmin', 'admin', 'lawyer')
      ));
  END IF;
END $$;

-- Payments için eksik policyleri ekle (eğer yoksa)
DO $$
BEGIN
  -- INSERT policy yoksa ekle
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'payments' 
    AND policyname = 'Admins can insert payments'
  ) THEN
    CREATE POLICY "Admins can insert payments"
      ON payments FOR INSERT
      WITH CHECK (auth.uid() IN (
        SELECT id FROM user_auth 
        WHERE role IN ('superadmin', 'admin', 'lawyer')
      ));
  END IF;

  -- UPDATE policy yoksa ekle (eğer "Admins can manage payments" yoksa)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'payments' 
    AND policyname = 'Admins can update payments'
  ) THEN
    CREATE POLICY "Admins can update payments"
      ON payments FOR UPDATE
      USING (auth.uid() IN (
        SELECT id FROM user_auth 
        WHERE role IN ('superadmin', 'admin', 'lawyer')
      ));
  END IF;

  -- DELETE policy yoksa ekle
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'payments' 
    AND policyname = 'Admins can delete payments'
  ) THEN
    CREATE POLICY "Admins can delete payments"
      ON payments FOR DELETE
      USING (auth.uid() IN (
        SELECT id FROM user_auth 
        WHERE role IN ('superadmin', 'admin', 'lawyer')
      ));
  END IF;
END $$;

-- Customer Tasks için eksik policyleri ekle (eğer yoksa)
DO $$
BEGIN
  -- INSERT policy yoksa ekle
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'customer_tasks' 
    AND policyname = 'Admins can insert tasks'
  ) THEN
    CREATE POLICY "Admins can insert tasks"
      ON customer_tasks FOR INSERT
      WITH CHECK (auth.uid() IN (
        SELECT id FROM user_auth 
        WHERE role IN ('superadmin', 'admin', 'lawyer')
      ));
  END IF;

  -- DELETE policy yoksa ekle
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'customer_tasks' 
    AND policyname = 'Admins can delete tasks'
  ) THEN
    CREATE POLICY "Admins can delete tasks"
      ON customer_tasks FOR DELETE
      USING (auth.uid() IN (
        SELECT id FROM user_auth 
        WHERE role IN ('superadmin', 'admin', 'lawyer')
      ));
  END IF;
END $$;

-- Notifications için eksik policyleri ekle (eğer yoksa)
DO $$
BEGIN
  -- DELETE policy yoksa ekle
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'notifications' 
    AND policyname = 'Admins can delete notifications'
  ) THEN
    CREATE POLICY "Admins can delete notifications"
      ON notifications FOR DELETE
      USING (auth.uid() IN (
        SELECT id FROM user_auth 
        WHERE role IN ('superadmin', 'admin', 'lawyer')
      ));
  END IF;
END $$;

-- User Auth için eksik policyleri ekle (eğer yoksa)
DO $$
BEGIN
  -- UPDATE policy yoksa ekle
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_auth' 
    AND policyname = 'Admins can update user auth'
  ) THEN
    CREATE POLICY "Admins can update user auth"
      ON user_auth FOR UPDATE
      USING (auth.uid() IN (
        SELECT id FROM user_auth 
        WHERE role IN ('superadmin', 'admin', 'lawyer')
      ));
  END IF;

  -- INSERT policy yoksa ekle (sadece admin tarafından)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_auth' 
    AND policyname = 'Admins can insert user auth'
  ) THEN
    CREATE POLICY "Admins can insert user auth"
      ON user_auth FOR INSERT
      WITH CHECK (auth.uid() IN (
        SELECT id FROM user_auth 
        WHERE role IN ('superadmin', 'admin', 'lawyer')
      ));
  END IF;
END $$;

