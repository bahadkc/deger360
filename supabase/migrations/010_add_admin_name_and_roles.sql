-- Add name column to user_auth table and support for acente role
-- Bu migration admin isimlerini saklamak için name kolonu ekler ve acente rolünü destekler

-- 1. user_auth tablosuna name kolonu ekle
ALTER TABLE user_auth
ADD COLUMN IF NOT EXISTS name TEXT;

-- 2. Index ekle (opsiyonel, performans için)
CREATE INDEX IF NOT EXISTS idx_user_auth_name ON user_auth(name);
