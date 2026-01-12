-- Add password column to user_auth table
-- Bu migration admin şifrelerini saklamak için password kolonu ekler
-- NOT: Şifreler düz metin olarak saklanacak (güvenlik açısından dikkatli olunmalı)

ALTER TABLE user_auth
ADD COLUMN IF NOT EXISTS password TEXT;

-- Index ekle (opsiyonel, performans için)
CREATE INDEX IF NOT EXISTS idx_user_auth_password ON user_auth(password) WHERE password IS NOT NULL;
