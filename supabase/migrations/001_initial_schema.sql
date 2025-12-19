-- Müşteriler tablosu
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  full_name TEXT NOT NULL,
  address TEXT,
  tc_kimlik TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dosyalar/Davalar tablosu
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  case_number TEXT UNIQUE NOT NULL, -- DK-2024-542 gibi
  status TEXT NOT NULL DEFAULT 'active', -- active, completed, cancelled
  
  -- Araç bilgileri
  vehicle_plate TEXT NOT NULL,
  vehicle_brand_model TEXT NOT NULL,
  accident_date DATE NOT NULL,
  accident_location TEXT,
  
  -- Finansal bilgiler
  damage_amount DECIMAL(10,2),
  value_loss_amount DECIMAL(10,2),
  fault_rate INTEGER DEFAULT 0, -- 0-100 arası
  estimated_compensation DECIMAL(10,2),
  commission_rate INTEGER DEFAULT 20, -- yüzde olarak
  
  -- Süreç bilgileri
  current_stage TEXT DEFAULT 'başvuru', -- başvuru, evrak, ekspertiz, sigorta, tahkim, mahkeme, ödeme
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
  
  -- Belge bilgileri
  name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Supabase storage path
  file_size INTEGER, -- bytes
  file_type TEXT, -- pdf, jpg, png, etc.
  
  -- Kategori ve durum
  category TEXT NOT NULL, -- kaza_tutanağı, tamir_faturası, ruhsat, kimlik, ekspertiz, vs
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  
  -- Yükleme bilgileri
  uploaded_by TEXT DEFAULT 'customer', -- customer, admin, system
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- İçerik ve notlar
  description TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Süreç adımları tablosu
CREATE TABLE IF NOT EXISTS process_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  
  -- Adım bilgileri
  step_order INTEGER NOT NULL, -- 1, 2, 3, ...
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'waiting', -- completed, active, waiting, warning
  
  -- Tarih bilgileri
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  duration_days INTEGER,
  
  -- Tamamlanma bilgileri
  completed_tasks TEXT[], -- JSON array of completed tasks
  missing_items TEXT[], -- JSON array of missing items
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(case_id, step_order)
);

-- Müşteri görevleri tablosu
CREATE TABLE IF NOT EXISTS customer_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  
  -- Görev bilgileri
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL, -- document_upload, photo_upload, form_fill, etc.
  
  -- Durum
  status TEXT DEFAULT 'pending', -- pending, completed, cancelled
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  
  -- İlişkili belge
  related_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  
  -- Deadline
  deadline TIMESTAMPTZ,
  urgent BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aktivite/Hareketler tablosu
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  
  -- Aktivite bilgileri
  type TEXT NOT NULL, -- document, message, status, milestone
  title TEXT NOT NULL,
  description TEXT,
  
  -- Kullanıcı bilgisi
  performed_by TEXT, -- admin, customer, system
  user_name TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Finansal işlemler tablosu
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  
  -- Ödeme bilgileri
  amount DECIMAL(10,2) NOT NULL,
  payment_type TEXT NOT NULL, -- insurance_payment, commission, refund
  payment_method TEXT, -- bank_transfer, cash, etc.
  
  -- Durum
  status TEXT DEFAULT 'pending', -- pending, completed, failed
  payment_date TIMESTAMPTZ,
  
  -- Banka bilgileri
  iban TEXT,
  account_holder TEXT,
  
  -- Notlar
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
  
  -- Bildirim içeriği
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- info, success, warning, error
  
  -- Durum
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auth kullanıcıları için müşteri bağlantısı
CREATE TABLE IF NOT EXISTS user_auth (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'customer', -- customer, admin, lawyer
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(customer_id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cases_customer_id ON cases(customer_id);
CREATE INDEX IF NOT EXISTS idx_cases_case_number ON cases(case_number);
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

-- Drop triggers first if they exist (to avoid "already exists" errors)
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
DROP TRIGGER IF EXISTS update_cases_updated_at ON cases;
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
DROP TRIGGER IF EXISTS update_process_steps_updated_at ON process_steps;
DROP TRIGGER IF EXISTS update_customer_tasks_updated_at ON customer_tasks;
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
DROP TRIGGER IF EXISTS update_user_auth_updated_at ON user_auth;

-- Create triggers
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
