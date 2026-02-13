-- Table to track document categories that won't be uploaded
CREATE TABLE IF NOT EXISTS skipped_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  UNIQUE(case_id, category)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_skipped_documents_case_id ON skipped_documents(case_id);
CREATE INDEX IF NOT EXISTS idx_skipped_documents_category ON skipped_documents(category);

-- RLS policies
ALTER TABLE skipped_documents ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view skipped documents
CREATE POLICY "Admins can view skipped documents"
  ON skipped_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_auth
      WHERE user_auth.id = auth.uid()
      AND user_auth.role IN ('superadmin', 'admin', 'lawyer', 'acente')
    )
  );

-- Policy: Only admins can insert skipped documents
CREATE POLICY "Admins can insert skipped documents"
  ON skipped_documents
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_auth
      WHERE user_auth.id = auth.uid()
      AND user_auth.role IN ('superadmin', 'admin', 'lawyer')
    )
  );

-- Policy: Only admins can delete skipped documents
CREATE POLICY "Admins can delete skipped documents"
  ON skipped_documents
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_auth
      WHERE user_auth.id = auth.uid()
      AND user_auth.role IN ('superadmin', 'admin', 'lawyer')
    )
  );
