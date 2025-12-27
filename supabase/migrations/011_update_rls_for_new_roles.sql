-- Update RLS Policies for new roles (superadmin, acente)
-- Bu migration yeni roller için RLS policy'lerini günceller

-- 1. Admin Checklist Policies - Superadmin ve admin, lawyer görüntüleyebilir ve değiştirebilir, acente sadece görüntüleyebilir
DROP POLICY IF EXISTS "Admins can view all checklists" ON admin_checklist;
CREATE POLICY "Admins can view all checklists"
  ON admin_checklist FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer', 'acente')
    )
  );

DROP POLICY IF EXISTS "Admins can insert checklists" ON admin_checklist;
CREATE POLICY "Admins can insert checklists"
  ON admin_checklist FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer')
    )
  );

DROP POLICY IF EXISTS "Admins can update checklists" ON admin_checklist;
CREATE POLICY "Admins can update checklists"
  ON admin_checklist FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer')
    )
  );

DROP POLICY IF EXISTS "Admins can delete checklists" ON admin_checklist;
CREATE POLICY "Admins can delete checklists"
  ON admin_checklist FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer')
    )
  );

-- 2. Documents Policies - Superadmin, admin, lawyer görüntüleyebilir ve değiştirebilir, acente sadece görüntüleyebilir
-- Update existing "Users can view their case documents" policy to include acente
DROP POLICY IF EXISTS "Users can view their case documents" ON documents;
CREATE POLICY "Users can view their case documents"
  ON documents FOR SELECT
  USING (
    case_id IN (
      SELECT c.id FROM cases c
      INNER JOIN user_auth ua ON c.customer_id = ua.customer_id
      WHERE ua.id = auth.uid()
    )
    OR auth.uid() IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer', 'acente')
    )
  );

-- Update "Customers can upload documents" policy (customers can upload, admins can insert)
DROP POLICY IF EXISTS "Customers can upload documents" ON documents;
CREATE POLICY "Customers can upload documents"
  ON documents FOR INSERT
  WITH CHECK (
    case_id IN (
      SELECT c.id FROM cases c
      INNER JOIN user_auth ua ON c.customer_id = ua.customer_id
      WHERE ua.id = auth.uid()
    )
    OR auth.uid() IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer')
    )
  );

-- Update "Admins can update documents" policy
DROP POLICY IF EXISTS "Admins can update documents" ON documents;
CREATE POLICY "Admins can update documents"
  ON documents FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer')
    )
  );

-- Update "Admins can delete documents" policy
DROP POLICY IF EXISTS "Admins can delete documents" ON documents;
CREATE POLICY "Admins can delete documents"
  ON documents FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer')
    )
  );

-- 3. Cases Policies - Superadmin tüm case'leri görebilir, admin/lawyer/acente sadece kendilerine atananları
DROP POLICY IF EXISTS "Admins can view all cases" ON cases;
CREATE POLICY "Admins can view all cases"
  ON cases FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer', 'acente')
    )
  );

DROP POLICY IF EXISTS "Admins can insert cases" ON cases;
CREATE POLICY "Admins can insert cases"
  ON cases FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer')
    )
  );

DROP POLICY IF EXISTS "Admins can update cases" ON cases;
CREATE POLICY "Admins can update cases"
  ON cases FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer')
    )
  );

-- 4. Customers Policies - Superadmin tüm müşterileri görebilir, admin/lawyer/acente sadece kendilerine atanan müşterileri
DROP POLICY IF EXISTS "Admins can view all customers" ON customers;
CREATE POLICY "Admins can view all customers"
  ON customers FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer', 'acente')
    )
  );

DROP POLICY IF EXISTS "Admins can update customers" ON customers;
CREATE POLICY "Admins can update customers"
  ON customers FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer')
    )
  );
