-- Add is_sample column for restore compatibility (backup data includes this field)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_customers_is_sample ON customers(is_sample);
