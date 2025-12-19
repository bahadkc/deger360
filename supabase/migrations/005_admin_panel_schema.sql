-- Admin Panel için gerekli şema güncellemeleri

-- 1. Customers tablosuna IBAN ve ödeme yapılacak kişi ekle
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS iban TEXT,
ADD COLUMN IF NOT EXISTS payment_person_name TEXT;

-- 2. Cases tablosuna board_stage ekle (board sütununu belirlemek için)
-- board_stage: 'basvuru_alindi', 'ilk_gorusme', 'evrak_ekspertiz', 'sigorta_basvurusu', 'muzakere', 'odeme'
ALTER TABLE cases
ADD COLUMN IF NOT EXISTS board_stage TEXT DEFAULT 'basvuru_alindi';

-- Index ekle
CREATE INDEX IF NOT EXISTS idx_cases_board_stage ON cases(board_stage);

-- 3. Admin Checklist tablosu (yapılacaklar listesi)
CREATE TABLE IF NOT EXISTS admin_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  
  -- Checklist item bilgileri
  task_key TEXT NOT NULL, -- unique identifier for each task
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  completed_by TEXT, -- admin user who completed it
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(case_id, task_key)
);

-- Index ekle
CREATE INDEX IF NOT EXISTS idx_admin_checklist_case_id ON admin_checklist(case_id);
CREATE INDEX IF NOT EXISTS idx_admin_checklist_completed ON admin_checklist(completed);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_admin_checklist_updated_at ON admin_checklist;
CREATE TRIGGER update_admin_checklist_updated_at BEFORE UPDATE ON admin_checklist
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Cases tablosuna eksik alanlar ekle (eğer yoksa)
-- Toplam değer kaybı için value_loss_amount zaten var
-- Beklenen net tutar için estimated_compensation zaten var
-- Yapılacak toplam ödeme için yeni alan ekle
ALTER TABLE cases
ADD COLUMN IF NOT EXISTS total_payment_amount DECIMAL(10,2);

-- 5. Documents tablosuna uploaded_by_name ekle (kim tarafından yüklendiği için)
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS uploaded_by_name TEXT;

-- 6. Board stage mapping için helper function
CREATE OR REPLACE FUNCTION get_board_stage_from_current_stage(current_stage TEXT)
RETURNS TEXT AS $$
BEGIN
  CASE current_stage
    WHEN 'başvuru' THEN RETURN 'basvuru_alindi';
    WHEN 'evrak' THEN RETURN 'evrak_ekspertiz';
    WHEN 'ekspertiz' THEN RETURN 'evrak_ekspertiz';
    WHEN 'sigorta' THEN RETURN 'sigorta_basvurusu';
    WHEN 'tahkim' THEN RETURN 'muzakere';
    WHEN 'mahkeme' THEN RETURN 'muzakere';
    WHEN 'ödeme' THEN RETURN 'odeme';
    ELSE RETURN 'basvuru_alindi';
  END CASE;
END;
$$ LANGUAGE plpgsql;
