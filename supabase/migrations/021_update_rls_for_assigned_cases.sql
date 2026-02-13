-- Update RLS Policies to filter by case_admins assignments
-- Admin, lawyer, and acente can only see/edit cases assigned to them via case_admins table
-- Superadmin can see/edit all cases

-- 1. Cases Policies - Filter by case_admins for admin/lawyer/acente
DROP POLICY IF EXISTS "Admins can view all cases" ON cases;
CREATE POLICY "Admins can view all cases"
  ON cases FOR SELECT
  USING (
    -- Superadmin sees all cases
    auth.uid() IN (
      SELECT id FROM user_auth 
      WHERE role = 'superadmin'
    )
    OR
    -- Admin, lawyer, acente see only assigned cases
    (
      auth.uid() IN (
        SELECT id FROM user_auth 
        WHERE role IN ('admin', 'lawyer', 'acente')
      )
      AND id IN (
        SELECT case_id FROM case_admins 
        WHERE admin_id = auth.uid()
      )
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
    -- Superadmin can update all cases
    auth.uid() IN (
      SELECT id FROM user_auth 
      WHERE role = 'superadmin'
    )
    OR
    -- Admin and lawyer can update only assigned cases
    (
      auth.uid() IN (
        SELECT id FROM user_auth 
        WHERE role IN ('admin', 'lawyer')
      )
      AND id IN (
        SELECT case_id FROM case_admins 
        WHERE admin_id = auth.uid()
      )
    )
  );

-- 2. Customers Policies - Filter by case_admins for admin/lawyer/acente
DROP POLICY IF EXISTS "Admins can view all customers" ON customers;
CREATE POLICY "Admins can view all customers"
  ON customers FOR SELECT
  USING (
    -- Superadmin sees all customers
    auth.uid() IN (
      SELECT id FROM user_auth 
      WHERE role = 'superadmin'
    )
    OR
    -- Admin, lawyer, acente see only customers with assigned cases
    (
      auth.uid() IN (
        SELECT id FROM user_auth 
        WHERE role IN ('admin', 'lawyer', 'acente')
      )
      AND id IN (
        SELECT DISTINCT c.customer_id 
        FROM cases c
        INNER JOIN case_admins ca ON c.id = ca.case_id
        WHERE ca.admin_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Admins can update customers" ON customers;
CREATE POLICY "Admins can update customers"
  ON customers FOR UPDATE
  USING (
    -- Superadmin can update all customers
    auth.uid() IN (
      SELECT id FROM user_auth 
      WHERE role = 'superadmin'
    )
    OR
    -- Admin and lawyer can update only customers with assigned cases
    (
      auth.uid() IN (
        SELECT id FROM user_auth 
        WHERE role IN ('admin', 'lawyer')
      )
      AND id IN (
        SELECT DISTINCT c.customer_id 
        FROM cases c
        INNER JOIN case_admins ca ON c.id = ca.case_id
        WHERE ca.admin_id = auth.uid()
      )
    )
  );

-- 3. Admin Checklist Policies - Filter by case_admins for admin/lawyer/acente
DROP POLICY IF EXISTS "Admins can view all checklists" ON admin_checklist;
CREATE POLICY "Admins can view all checklists"
  ON admin_checklist FOR SELECT
  USING (
    -- Superadmin sees all checklists
    auth.uid() IN (
      SELECT id FROM user_auth 
      WHERE role = 'superadmin'
    )
    OR
    -- Admin, lawyer, acente see only checklists for assigned cases
    (
      auth.uid() IN (
        SELECT id FROM user_auth 
        WHERE role IN ('admin', 'lawyer', 'acente')
      )
      AND case_id IN (
        SELECT case_id FROM case_admins 
        WHERE admin_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Admins can insert checklists" ON admin_checklist;
CREATE POLICY "Admins can insert checklists"
  ON admin_checklist FOR INSERT
  WITH CHECK (
    -- Superadmin can insert for all cases
    auth.uid() IN (
      SELECT id FROM user_auth 
      WHERE role = 'superadmin'
    )
    OR
    -- Admin and lawyer can insert only for assigned cases
    (
      auth.uid() IN (
        SELECT id FROM user_auth 
        WHERE role IN ('admin', 'lawyer')
      )
      AND case_id IN (
        SELECT case_id FROM case_admins 
        WHERE admin_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Admins can update checklists" ON admin_checklist;
CREATE POLICY "Admins can update checklists"
  ON admin_checklist FOR UPDATE
  USING (
    -- Superadmin can update all checklists
    auth.uid() IN (
      SELECT id FROM user_auth 
      WHERE role = 'superadmin'
    )
    OR
    -- Admin and lawyer can update only checklists for assigned cases
    (
      auth.uid() IN (
        SELECT id FROM user_auth 
        WHERE role IN ('admin', 'lawyer')
      )
      AND case_id IN (
        SELECT case_id FROM case_admins 
        WHERE admin_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Admins can delete checklists" ON admin_checklist;
CREATE POLICY "Admins can delete checklists"
  ON admin_checklist FOR DELETE
  USING (
    -- Superadmin can delete all checklists
    auth.uid() IN (
      SELECT id FROM user_auth 
      WHERE role = 'superadmin'
    )
    OR
    -- Admin and lawyer can delete only checklists for assigned cases
    (
      auth.uid() IN (
        SELECT id FROM user_auth 
        WHERE role IN ('admin', 'lawyer')
      )
      AND case_id IN (
        SELECT case_id FROM case_admins 
        WHERE admin_id = auth.uid()
      )
    )
  );

-- 4. case_admins Policies - Allow acente to view their assignments (but not modify)
DROP POLICY IF EXISTS "Admins can view case_admins" ON case_admins;
CREATE POLICY "Admins can view case_admins"
  ON case_admins FOR SELECT
  USING (
    -- Superadmin sees all assignments
    auth.uid() IN (
      SELECT id FROM user_auth 
      WHERE role = 'superadmin'
    )
    OR
    -- Admin, lawyer, acente see only their own assignments
    (
      auth.uid() IN (
        SELECT id FROM user_auth 
        WHERE role IN ('admin', 'lawyer', 'acente')
      )
      AND admin_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can insert case_admins" ON case_admins;
CREATE POLICY "Admins can insert case_admins"
  ON case_admins FOR INSERT
  WITH CHECK (
    -- Only superadmin, admin, lawyer can insert (acente cannot)
    auth.uid() IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer')
    )
  );

DROP POLICY IF EXISTS "Admins can update case_admins" ON case_admins;
CREATE POLICY "Admins can update case_admins"
  ON case_admins FOR UPDATE
  USING (
    -- Only superadmin, admin, lawyer can update (acente cannot)
    auth.uid() IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer')
    )
  );

DROP POLICY IF EXISTS "Admins can delete case_admins" ON case_admins;
CREATE POLICY "Admins can delete case_admins"
  ON case_admins FOR DELETE
  USING (
    -- Only superadmin, admin, lawyer can delete (acente cannot)
    auth.uid() IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer')
    )
  );

-- 5. Documents Policies - Filter by case_admins for admin/lawyer/acente
DROP POLICY IF EXISTS "Users can view their case documents" ON documents;
CREATE POLICY "Users can view their case documents"
  ON documents FOR SELECT
  USING (
    -- Customers can view their own documents
    case_id IN (
      SELECT c.id FROM cases c
      INNER JOIN user_auth ua ON c.customer_id = ua.customer_id
      WHERE ua.id = auth.uid()
    )
    OR
    -- Superadmin sees all documents
    auth.uid() IN (
      SELECT id FROM user_auth 
      WHERE role = 'superadmin'
    )
    OR
    -- Admin, lawyer, acente see only documents for assigned cases
    (
      auth.uid() IN (
        SELECT id FROM user_auth 
        WHERE role IN ('admin', 'lawyer', 'acente')
      )
      AND case_id IN (
        SELECT case_id FROM case_admins 
        WHERE admin_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Customers can upload documents" ON documents;
CREATE POLICY "Customers can upload documents"
  ON documents FOR INSERT
  WITH CHECK (
    -- Customers can upload their own documents
    case_id IN (
      SELECT c.id FROM cases c
      INNER JOIN user_auth ua ON c.customer_id = ua.customer_id
      WHERE ua.id = auth.uid()
    )
    OR
    -- Superadmin can insert for all cases
    auth.uid() IN (
      SELECT id FROM user_auth 
      WHERE role = 'superadmin'
    )
    OR
    -- Admin and lawyer can insert only for assigned cases
    (
      auth.uid() IN (
        SELECT id FROM user_auth 
        WHERE role IN ('admin', 'lawyer')
      )
      AND case_id IN (
        SELECT case_id FROM case_admins 
        WHERE admin_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Admins can update documents" ON documents;
CREATE POLICY "Admins can update documents"
  ON documents FOR UPDATE
  USING (
    -- Superadmin can update all documents
    auth.uid() IN (
      SELECT id FROM user_auth 
      WHERE role = 'superadmin'
    )
    OR
    -- Admin and lawyer can update only documents for assigned cases
    (
      auth.uid() IN (
        SELECT id FROM user_auth 
        WHERE role IN ('admin', 'lawyer')
      )
      AND case_id IN (
        SELECT case_id FROM case_admins 
        WHERE admin_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Admins can delete documents" ON documents;
CREATE POLICY "Admins can delete documents"
  ON documents FOR DELETE
  USING (
    -- Superadmin can delete all documents
    auth.uid() IN (
      SELECT id FROM user_auth 
      WHERE role = 'superadmin'
    )
    OR
    -- Admin and lawyer can delete only documents for assigned cases
    (
      auth.uid() IN (
        SELECT id FROM user_auth 
        WHERE role IN ('admin', 'lawyer')
      )
      AND case_id IN (
        SELECT case_id FROM case_admins 
        WHERE admin_id = auth.uid()
      )
    )
  );
