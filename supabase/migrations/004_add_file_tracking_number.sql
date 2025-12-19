-- Müşterilere dosya takip numarası ekle (6 haneli)
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS dosya_takip_numarasi TEXT UNIQUE;

-- Index ekle
CREATE INDEX IF NOT EXISTS idx_customers_dosya_takip_numarasi ON customers(dosya_takip_numarasi);

-- Mevcut müşteriye dosya takip numarası ata
UPDATE customers 
SET dosya_takip_numarasi = '100001'
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Dosya takip numarası üretme fonksiyonu
CREATE OR REPLACE FUNCTION generate_dosya_takip_numarasi()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- 100000 ile 999999 arası rastgele 6 haneli numara üret
    new_number := LPAD((FLOOR(RANDOM() * 900000) + 100000)::TEXT, 6, '0');
    
    -- Bu numaranın kullanılıp kullanılmadığını kontrol et
    SELECT EXISTS(SELECT 1 FROM customers WHERE dosya_takip_numarasi = new_number) INTO exists_check;
    
    -- Eğer kullanılmamışsa döndür
    IF NOT exists_check THEN
      RETURN new_number;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Yeni müşteri eklendiğinde otomatik dosya takip numarası ata
CREATE OR REPLACE FUNCTION auto_assign_dosya_takip_numarasi()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.dosya_takip_numarasi IS NULL THEN
    NEW.dosya_takip_numarasi := generate_dosya_takip_numarasi();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger oluştur
DROP TRIGGER IF EXISTS trigger_auto_assign_dosya_takip_numarasi ON customers;
CREATE TRIGGER trigger_auto_assign_dosya_takip_numarasi
  BEFORE INSERT ON customers
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_dosya_takip_numarasi();
