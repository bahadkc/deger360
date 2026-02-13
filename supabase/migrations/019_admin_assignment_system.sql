-- Admin Assignment System Migration
-- Bu migration admin/müşteri atama sistemini oluşturur ve superadmin role'ü ekler

-- 1. case_admins tablosu oluştur (many-to-many ilişki)
CREATE TABLE IF NOT EXISTS case_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(case_id, admin_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_case_admins_case_id ON case_admins(case_id);
CREATE INDEX IF NOT EXISTS idx_case_admins_admin_id ON case_admins(admin_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_case_admins_updated_at ON case_admins;
CREATE TRIGGER update_case_admins_updated_at BEFORE UPDATE ON case_admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. user_auth tablosuna superadmin role desteği ekle (zaten TEXT olduğu için ekstra bir şey yapmaya gerek yok)
-- Ancak mevcut admin'leri kontrol edelim ve info@deger360.net'i superadmin yapalım

-- Önce info@deger360.net kullanıcısını bul ve superadmin yap
-- NOT: Bu kullanıcının auth.users tablosunda olması gerekiyor
DO $$
DECLARE
  superadmin_user_id UUID;
BEGIN
  -- info@deger360.net kullanıcısını bul
  SELECT id INTO superadmin_user_id
  FROM auth.users
  WHERE email = 'info@deger360.net'
  LIMIT 1;

  -- Eğer kullanıcı bulunduysa, user_auth tablosunda superadmin yap
  IF superadmin_user_id IS NOT NULL THEN
    -- Önce user_auth kaydı var mı kontrol et
    IF EXISTS (SELECT 1 FROM user_auth WHERE id = superadmin_user_id) THEN
      -- Varsa güncelle
      UPDATE user_auth
      SET role = 'superadmin'
      WHERE id = superadmin_user_id;
    ELSE
      -- Yoksa oluştur
      INSERT INTO user_auth (id, customer_id, role)
      VALUES (superadmin_user_id, NULL, 'superadmin');
    END IF;
  END IF;
END $$;

-- 3. RLS Policies for case_admins
ALTER TABLE case_admins ENABLE ROW LEVEL SECURITY;

-- Superadmin ve admin'ler tüm case_admins kayıtlarını görebilir
CREATE POLICY "Admins can view case_admins"
  ON case_admins FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer')
    )
  );

-- Superadmin ve admin'ler case_admins ekleyebilir
CREATE POLICY "Admins can insert case_admins"
  ON case_admins FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer')
    )
  );

-- Superadmin ve admin'ler case_admins güncelleyebilir
CREATE POLICY "Admins can update case_admins"
  ON case_admins FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer')
    )
  );

-- Superadmin ve admin'ler case_admins silebilir
CREATE POLICY "Admins can delete case_admins"
  ON case_admins FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer')
    )
  );
