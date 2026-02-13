-- Migration: Remove vehicle_brands and vehicle_models tables
-- Bu migration, kullanılmayan vehicle_brands ve vehicle_models tablolarını siler.
-- Tables may not exist if they were never created.

DROP TABLE IF EXISTS vehicle_models CASCADE;
DROP TABLE IF EXISTS vehicle_brands CASCADE;
