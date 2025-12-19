-- Admin Checklist RLS Policies

ALTER TABLE admin_checklist ENABLE ROW LEVEL SECURITY;

-- Admins can view all checklists
CREATE POLICY "Admins can view all checklists"
  ON admin_checklist FOR SELECT
  USING (auth.uid() IN (SELECT id FROM user_auth WHERE role IN ('admin', 'lawyer')));

-- Admins can insert checklists
CREATE POLICY "Admins can insert checklists"
  ON admin_checklist FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM user_auth WHERE role IN ('admin', 'lawyer')));

-- Admins can update checklists
CREATE POLICY "Admins can update checklists"
  ON admin_checklist FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM user_auth WHERE role IN ('admin', 'lawyer')));

-- Admins can delete checklists
CREATE POLICY "Admins can delete checklists"
  ON admin_checklist FOR DELETE
  USING (auth.uid() IN (SELECT id FROM user_auth WHERE role IN ('admin', 'lawyer')));
