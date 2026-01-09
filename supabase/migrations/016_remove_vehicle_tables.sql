-- Migration: Remove vehicle_brands and vehicle_models tables
-- Bu migration, kullanılmayan vehicle_brands ve vehicle_models tablolarını siler.

-- 1. Drop foreign key constraint first
ALTER TABLE vehicle_models DROP CONSTRAINT IF EXISTS vehicle_models_brand_id_fkey;

-- 2. Drop tables
DROP TABLE IF EXISTS vehicle_models CASCADE;
DROP TABLE IF EXISTS vehicle_brands CASCADE;
