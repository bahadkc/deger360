-- Storage Buckets oluşturma
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('documents', 'documents', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]),
  ('case-photos', 'case-photos', false, 52428800, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[])
ON CONFLICT (id) DO NOTHING;

-- Row Level Security (RLS) Policies

-- Customers table policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view their own data"
  ON customers FOR SELECT
  USING (auth.uid() IN (SELECT id FROM user_auth WHERE customer_id = customers.id));

CREATE POLICY "Admins can view all customers"
  ON customers FOR SELECT
  USING (auth.uid() IN (SELECT id FROM user_auth WHERE role IN ('admin', 'lawyer')));

CREATE POLICY "Admins can update customers"
  ON customers FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM user_auth WHERE role IN ('admin', 'lawyer')));

-- Cases table policies
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view their own cases"
  ON cases FOR SELECT
  USING (
    customer_id IN (
      SELECT customer_id FROM user_auth WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all cases"
  ON cases FOR SELECT
  USING (auth.uid() IN (SELECT id FROM user_auth WHERE role IN ('admin', 'lawyer')));

CREATE POLICY "Admins can insert cases"
  ON cases FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM user_auth WHERE role IN ('admin', 'lawyer')));

CREATE POLICY "Admins can update cases"
  ON cases FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM user_auth WHERE role IN ('admin', 'lawyer')));

-- Documents table policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their case documents"
  ON documents FOR SELECT
  USING (
    case_id IN (
      SELECT c.id FROM cases c
      INNER JOIN user_auth ua ON c.customer_id = ua.customer_id
      WHERE ua.id = auth.uid()
    )
    OR auth.uid() IN (SELECT id FROM user_auth WHERE role IN ('admin', 'lawyer'))
  );

CREATE POLICY "Customers can upload documents"
  ON documents FOR INSERT
  WITH CHECK (
    case_id IN (
      SELECT c.id FROM cases c
      INNER JOIN user_auth ua ON c.customer_id = ua.customer_id
      WHERE ua.id = auth.uid()
    )
    OR auth.uid() IN (SELECT id FROM user_auth WHERE role IN ('admin', 'lawyer'))
  );

CREATE POLICY "Admins can update documents"
  ON documents FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM user_auth WHERE role IN ('admin', 'lawyer')));

CREATE POLICY "Admins can delete documents"
  ON documents FOR DELETE
  USING (auth.uid() IN (SELECT id FROM user_auth WHERE role IN ('admin', 'lawyer')));

-- Process steps policies
ALTER TABLE process_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their case process steps"
  ON process_steps FOR SELECT
  USING (
    case_id IN (
      SELECT c.id FROM cases c
      INNER JOIN user_auth ua ON c.customer_id = ua.customer_id
      WHERE ua.id = auth.uid()
    )
    OR auth.uid() IN (SELECT id FROM user_auth WHERE role IN ('admin', 'lawyer'))
  );

CREATE POLICY "Admins can manage process steps"
  ON process_steps FOR ALL
  USING (auth.uid() IN (SELECT id FROM user_auth WHERE role IN ('admin', 'lawyer')));

-- Customer tasks policies
ALTER TABLE customer_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view their tasks"
  ON customer_tasks FOR SELECT
  USING (
    case_id IN (
      SELECT c.id FROM cases c
      INNER JOIN user_auth ua ON c.customer_id = ua.customer_id
      WHERE ua.id = auth.uid()
    )
    OR auth.uid() IN (SELECT id FROM user_auth WHERE role IN ('admin', 'lawyer'))
  );

CREATE POLICY "Customers can update their task completion"
  ON customer_tasks FOR UPDATE
  USING (
    case_id IN (
      SELECT c.id FROM cases c
      INNER JOIN user_auth ua ON c.customer_id = ua.customer_id
      WHERE ua.id = auth.uid()
    )
  )
  WITH CHECK (
    -- Customers can update their own tasks
    case_id IN (
      SELECT c.id FROM cases c
      INNER JOIN user_auth ua ON c.customer_id = ua.customer_id
      WHERE ua.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage tasks"
  ON customer_tasks FOR ALL
  USING (auth.uid() IN (SELECT id FROM user_auth WHERE role IN ('admin', 'lawyer')));

-- Activities policies
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their case activities"
  ON activities FOR SELECT
  USING (
    case_id IN (
      SELECT c.id FROM cases c
      INNER JOIN user_auth ua ON c.customer_id = ua.customer_id
      WHERE ua.id = auth.uid()
    )
    OR auth.uid() IN (SELECT id FROM user_auth WHERE role IN ('admin', 'lawyer'))
  );

CREATE POLICY "Admins can insert activities"
  ON activities FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM user_auth WHERE role IN ('admin', 'lawyer')));

-- Payments policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their case payments"
  ON payments FOR SELECT
  USING (
    case_id IN (
      SELECT c.id FROM cases c
      INNER JOIN user_auth ua ON c.customer_id = ua.customer_id
      WHERE ua.id = auth.uid()
    )
    OR auth.uid() IN (SELECT id FROM user_auth WHERE role IN ('admin', 'lawyer'))
  );

CREATE POLICY "Admins can manage payments"
  ON payments FOR ALL
  USING (auth.uid() IN (SELECT id FROM user_auth WHERE role IN ('admin', 'lawyer')));

-- Notifications policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  USING (customer_id IN (SELECT customer_id FROM user_auth WHERE id = auth.uid()));

CREATE POLICY "Users can update their notifications (mark as read)"
  ON notifications FOR UPDATE
  USING (customer_id IN (SELECT customer_id FROM user_auth WHERE id = auth.uid()))
  WITH CHECK (customer_id IN (SELECT customer_id FROM user_auth WHERE id = auth.uid()));

CREATE POLICY "Admins can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM user_auth WHERE role IN ('admin', 'lawyer')));

-- User auth table policies
ALTER TABLE user_auth ENABLE ROW LEVEL SECURITY;

-- Users can only view their own auth record
CREATE POLICY "Users can view their own auth record"
  ON user_auth FOR SELECT
  USING (id = auth.uid());

-- Note: Admin operations (INSERT, UPDATE, DELETE) should be done via service_role key
-- This prevents circular dependency issues with RLS policies
-- Admin operations are handled server-side using supabaseAdmin client

-- Storage policies for documents bucket
CREATE POLICY "Anyone authenticated can view documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update their documents"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- Storage policies for case-photos bucket
CREATE POLICY "Anyone authenticated can view photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'case-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'case-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'case-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'case-photos' AND auth.role() = 'authenticated');
