-- Optimize RLS Policies Performance
-- Bu migration tüm RLS policy'lerindeki auth.uid() çağrılarını (select auth.uid()) ile optimize eder
-- Bu sayede her satır için yeniden değerlendirme yapılmaz ve performans artar

-- ============================================
-- 1. CASE_ADMINS Policies
-- ============================================

DROP POLICY IF EXISTS "Admins can insert case_admins" ON case_admins;
CREATE POLICY "Admins can insert case_admins"
  ON case_admins FOR INSERT
  WITH CHECK (
    (select auth.uid()) IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer')
    )
  );

DROP POLICY IF EXISTS "Admins can view case_admins" ON case_admins;
CREATE POLICY "Admins can view case_admins"
  ON case_admins FOR SELECT
  USING (
    -- Superadmin sees all assignments
    (select auth.uid()) IN (
      SELECT id FROM user_auth 
      WHERE role = 'superadmin'
    )
    OR
    -- Admin, lawyer, acente see only their own assignments
    (
      (select auth.uid()) IN (
        SELECT id FROM user_auth 
        WHERE role IN ('admin', 'lawyer', 'acente')
      )
      AND admin_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can update case_admins" ON case_admins;
CREATE POLICY "Admins can update case_admins"
  ON case_admins FOR UPDATE
  USING (
    -- Only superadmin, admin, lawyer can update (acente cannot)
    (select auth.uid()) IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer')
    )
  );

DROP POLICY IF EXISTS "Admins can delete case_admins" ON case_admins;
CREATE POLICY "Admins can delete case_admins"
  ON case_admins FOR DELETE
  USING (
    -- Only superadmin, admin, lawyer can delete (acente cannot)
    (select auth.uid()) IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer')
    )
  );

-- ============================================
-- 2. CASES Policies
-- ============================================

DROP POLICY IF EXISTS "Admins can view all cases" ON cases;
CREATE POLICY "Admins can view all cases"
  ON cases FOR SELECT
  USING (
    -- Superadmin sees all cases
    (select auth.uid()) IN (
      SELECT id FROM user_auth 
      WHERE role = 'superadmin'
    )
    OR
    -- Admin, lawyer, acente see only assigned cases
    (
      (select auth.uid()) IN (
        SELECT id FROM user_auth 
        WHERE role IN ('admin', 'lawyer', 'acente')
      )
      AND id IN (
        SELECT case_id FROM case_admins 
        WHERE admin_id = (select auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Admins can insert cases" ON cases;
CREATE POLICY "Admins can insert cases"
  ON cases FOR INSERT
  WITH CHECK (
    (select auth.uid()) IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer')
    )
  );

DROP POLICY IF EXISTS "Admins can update cases" ON cases;
CREATE POLICY "Admins can update cases"
  ON cases FOR UPDATE
  USING (
    -- Superadmin can update all cases
    (select auth.uid()) IN (
      SELECT id FROM user_auth 
      WHERE role = 'superadmin'
    )
    OR
    -- Admin and lawyer can update only assigned cases
    (
      (select auth.uid()) IN (
        SELECT id FROM user_auth 
        WHERE role IN ('admin', 'lawyer')
      )
      AND id IN (
        SELECT case_id FROM case_admins 
        WHERE admin_id = (select auth.uid())
      )
    )
  );

-- ============================================
-- 3. CUSTOMERS Policies
-- ============================================

DROP POLICY IF EXISTS "Admins can view all customers" ON customers;
CREATE POLICY "Admins can view all customers"
  ON customers FOR SELECT
  USING (
    -- Superadmin sees all customers
    (select auth.uid()) IN (
      SELECT id FROM user_auth 
      WHERE role = 'superadmin'
    )
    OR
    -- Admin, lawyer, acente see only customers with assigned cases
    (
      (select auth.uid()) IN (
        SELECT id FROM user_auth 
        WHERE role IN ('admin', 'lawyer', 'acente')
      )
      AND id IN (
        SELECT DISTINCT c.customer_id 
        FROM cases c
        INNER JOIN case_admins ca ON c.id = ca.case_id
        WHERE ca.admin_id = (select auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Admins can update customers" ON customers;
CREATE POLICY "Admins can update customers"
  ON customers FOR UPDATE
  USING (
    -- Superadmin can update all customers
    (select auth.uid()) IN (
      SELECT id FROM user_auth 
      WHERE role = 'superadmin'
    )
    OR
    -- Admin and lawyer can update only customers with assigned cases
    (
      (select auth.uid()) IN (
        SELECT id FROM user_auth 
        WHERE role IN ('admin', 'lawyer')
      )
      AND id IN (
        SELECT DISTINCT c.customer_id 
        FROM cases c
        INNER JOIN case_admins ca ON c.id = ca.case_id
        WHERE ca.admin_id = (select auth.uid())
      )
    )
  );

-- ============================================
-- 4. ADMIN_CHECKLIST Policies
-- ============================================

DROP POLICY IF EXISTS "Admins can view all checklists" ON admin_checklist;
CREATE POLICY "Admins can view all checklists"
  ON admin_checklist FOR SELECT
  USING (
    -- Superadmin sees all checklists
    (select auth.uid()) IN (
      SELECT id FROM user_auth 
      WHERE role = 'superadmin'
    )
    OR
    -- Admin, lawyer, acente see only checklists for assigned cases
    (
      (select auth.uid()) IN (
        SELECT id FROM user_auth 
        WHERE role IN ('admin', 'lawyer', 'acente')
      )
      AND case_id IN (
        SELECT case_id FROM case_admins 
        WHERE admin_id = (select auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Admins can insert checklists" ON admin_checklist;
CREATE POLICY "Admins can insert checklists"
  ON admin_checklist FOR INSERT
  WITH CHECK (
    -- Superadmin can insert for all cases
    (select auth.uid()) IN (
      SELECT id FROM user_auth 
      WHERE role = 'superadmin'
    )
    OR
    -- Admin and lawyer can insert only for assigned cases
    (
      (select auth.uid()) IN (
        SELECT id FROM user_auth 
        WHERE role IN ('admin', 'lawyer')
      )
      AND case_id IN (
        SELECT case_id FROM case_admins 
        WHERE admin_id = (select auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Admins can update checklists" ON admin_checklist;
CREATE POLICY "Admins can update checklists"
  ON admin_checklist FOR UPDATE
  USING (
    -- Superadmin can update all checklists
    (select auth.uid()) IN (
      SELECT id FROM user_auth 
      WHERE role = 'superadmin'
    )
    OR
    -- Admin and lawyer can update only checklists for assigned cases
    (
      (select auth.uid()) IN (
        SELECT id FROM user_auth 
        WHERE role IN ('admin', 'lawyer')
      )
      AND case_id IN (
        SELECT case_id FROM case_admins 
        WHERE admin_id = (select auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Admins can delete checklists" ON admin_checklist;
CREATE POLICY "Admins can delete checklists"
  ON admin_checklist FOR DELETE
  USING (
    -- Superadmin can delete all checklists
    (select auth.uid()) IN (
      SELECT id FROM user_auth 
      WHERE role = 'superadmin'
    )
    OR
    -- Admin and lawyer can delete only checklists for assigned cases
    (
      (select auth.uid()) IN (
        SELECT id FROM user_auth 
        WHERE role IN ('admin', 'lawyer')
      )
      AND case_id IN (
        SELECT case_id FROM case_admins 
        WHERE admin_id = (select auth.uid())
      )
    )
  );

-- ============================================
-- 5. DOCUMENTS Policies
-- ============================================

DROP POLICY IF EXISTS "Users can view their case documents" ON documents;
CREATE POLICY "Users can view their case documents"
  ON documents FOR SELECT
  USING (
    -- Customers can view their own documents
    case_id IN (
      SELECT c.id FROM cases c
      INNER JOIN user_auth ua ON c.customer_id = ua.customer_id
      WHERE ua.id = (select auth.uid())
    )
    OR
    -- Superadmin sees all documents
    (select auth.uid()) IN (
      SELECT id FROM user_auth 
      WHERE role = 'superadmin'
    )
    OR
    -- Admin, lawyer, acente see only documents for assigned cases
    (
      (select auth.uid()) IN (
        SELECT id FROM user_auth 
        WHERE role IN ('admin', 'lawyer', 'acente')
      )
      AND case_id IN (
        SELECT case_id FROM case_admins 
        WHERE admin_id = (select auth.uid())
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
      WHERE ua.id = (select auth.uid())
    )
    OR
    -- Superadmin can insert for all cases
    (select auth.uid()) IN (
      SELECT id FROM user_auth 
      WHERE role = 'superadmin'
    )
    OR
    -- Admin and lawyer can insert only for assigned cases
    (
      (select auth.uid()) IN (
        SELECT id FROM user_auth 
        WHERE role IN ('admin', 'lawyer')
      )
      AND case_id IN (
        SELECT case_id FROM case_admins 
        WHERE admin_id = (select auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Admins can update documents" ON documents;
CREATE POLICY "Admins can update documents"
  ON documents FOR UPDATE
  USING (
    -- Superadmin can update all documents
    (select auth.uid()) IN (
      SELECT id FROM user_auth 
      WHERE role = 'superadmin'
    )
    OR
    -- Admin and lawyer can update only documents for assigned cases
    (
      (select auth.uid()) IN (
        SELECT id FROM user_auth 
        WHERE role IN ('admin', 'lawyer')
      )
      AND case_id IN (
        SELECT case_id FROM case_admins 
        WHERE admin_id = (select auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Admins can delete documents" ON documents;
CREATE POLICY "Admins can delete documents"
  ON documents FOR DELETE
  USING (
    -- Superadmin can delete all documents
    (select auth.uid()) IN (
      SELECT id FROM user_auth 
      WHERE role = 'superadmin'
    )
    OR
    -- Admin and lawyer can delete only documents for assigned cases
    (
      (select auth.uid()) IN (
        SELECT id FROM user_auth 
        WHERE role IN ('admin', 'lawyer')
      )
      AND case_id IN (
        SELECT case_id FROM case_admins 
        WHERE admin_id = (select auth.uid())
      )
    )
  );

-- ============================================
-- 6. PROCESS_STEPS Policies
-- ============================================

DROP POLICY IF EXISTS "Admins can insert process steps" ON process_steps;
CREATE POLICY "Admins can insert process steps"
  ON process_steps FOR INSERT
  WITH CHECK (
    (select auth.uid()) IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer')
    )
  );

DROP POLICY IF EXISTS "Admins can update process steps" ON process_steps;
CREATE POLICY "Admins can update process steps"
  ON process_steps FOR UPDATE
  USING (
    (select auth.uid()) IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer')
    )
  );

DROP POLICY IF EXISTS "Admins can delete process steps" ON process_steps;
CREATE POLICY "Admins can delete process steps"
  ON process_steps FOR DELETE
  USING (
    (select auth.uid()) IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer')
    )
  );

-- ============================================
-- 7. ACTIVITIES Policies
-- ============================================

DROP POLICY IF EXISTS "Admins can update activities" ON activities;
CREATE POLICY "Admins can update activities"
  ON activities FOR UPDATE
  USING (
    (select auth.uid()) IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer')
    )
  );

DROP POLICY IF EXISTS "Admins can delete activities" ON activities;
CREATE POLICY "Admins can delete activities"
  ON activities FOR DELETE
  USING (
    (select auth.uid()) IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer')
    )
  );

-- ============================================
-- 8. PAYMENTS Policies
-- ============================================

DROP POLICY IF EXISTS "Admins can insert payments" ON payments;
CREATE POLICY "Admins can insert payments"
  ON payments FOR INSERT
  WITH CHECK (
    (select auth.uid()) IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer')
    )
  );

DROP POLICY IF EXISTS "Admins can update payments" ON payments;
CREATE POLICY "Admins can update payments"
  ON payments FOR UPDATE
  USING (
    (select auth.uid()) IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer')
    )
  );

DROP POLICY IF EXISTS "Admins can delete payments" ON payments;
CREATE POLICY "Admins can delete payments"
  ON payments FOR DELETE
  USING (
    (select auth.uid()) IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer')
    )
  );

-- ============================================
-- 9. CUSTOMER_TASKS Policies
-- ============================================

DROP POLICY IF EXISTS "Admins can insert tasks" ON customer_tasks;
CREATE POLICY "Admins can insert tasks"
  ON customer_tasks FOR INSERT
  WITH CHECK (
    (select auth.uid()) IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer')
    )
  );

DROP POLICY IF EXISTS "Admins can delete tasks" ON customer_tasks;
CREATE POLICY "Admins can delete tasks"
  ON customer_tasks FOR DELETE
  USING (
    (select auth.uid()) IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer')
    )
  );

-- ============================================
-- 10. NOTIFICATIONS Policies
-- ============================================

DROP POLICY IF EXISTS "Admins can delete notifications" ON notifications;
CREATE POLICY "Admins can delete notifications"
  ON notifications FOR DELETE
  USING (
    (select auth.uid()) IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer')
    )
  );

-- ============================================
-- 11. USER_AUTH Policies
-- ============================================

DROP POLICY IF EXISTS "Admins can update user auth" ON user_auth;
CREATE POLICY "Admins can update user auth"
  ON user_auth FOR UPDATE
  USING (
    (select auth.uid()) IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer')
    )
  );

DROP POLICY IF EXISTS "Admins can insert user auth" ON user_auth;
CREATE POLICY "Admins can insert user auth"
  ON user_auth FOR INSERT
  WITH CHECK (
    (select auth.uid()) IN (
      SELECT id FROM user_auth 
      WHERE role IN ('superadmin', 'admin', 'lawyer')
    )
  );

