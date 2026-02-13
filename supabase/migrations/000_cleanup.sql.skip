-- ============================================
-- CLEANUP SCRIPT - Veritabanını Sıfırdan Başlatmak İçin
-- ============================================
-- 
-- ⚠️ NE ZAMAN KULLANILIR?
-- - Migration dosyalarını yüklerken "already exists" hatası alıyorsanız
-- - Veritabanını temizleyip sıfırdan başlamak istiyorsanız
-- - Test verileri ile karışıklık olduysa
-- 
-- 🔴 DİKKAT: Bu script TÜM VERİLERİ SİLER!
-- 
-- 📋 KULLANIM:
-- 1. Bu dosyayı Supabase SQL Editor'de çalıştırın
-- 2. "Database cleaned successfully!" mesajını görün
-- 3. Sonra sırayla migration dosyalarını yükleyin:
--    - 001_initial_schema.sql
--    - 002_storage_and_policies.sql
--    - 003_seed_data.sql
-- 
-- ============================================

-- 1. Tüm trigger'ları sil
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers CASCADE;
DROP TRIGGER IF EXISTS update_cases_updated_at ON cases CASCADE;
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents CASCADE;
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments CASCADE;
DROP TRIGGER IF EXISTS update_milestones_updated_at ON milestones CASCADE;
DROP TRIGGER IF EXISTS update_messages_updated_at ON messages CASCADE;

-- 2. Tüm tabloları sil (foreign key sırası önemli)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS milestones CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS customer_metadata CASCADE;

-- 3. Tüm function'ları sil
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- 4. Tüm enum type'ları sil
DROP TYPE IF EXISTS case_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS document_type CASCADE;
DROP TYPE IF EXISTS milestone_status CASCADE;
DROP TYPE IF EXISTS message_sender_type CASCADE;

-- 5. Storage bucket'ları sil (eğer varsa)
-- Not: Storage bucket'larını Supabase Dashboard > Storage'dan manuel silmelisiniz

-- Temizlik tamamlandı!
SELECT 'Database cleaned successfully!' as status;
