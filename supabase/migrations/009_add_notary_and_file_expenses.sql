-- Noter ve dosya masrafları alanını cases tablosuna ekle
ALTER TABLE cases
ADD COLUMN IF NOT EXISTS notary_and_file_expenses DECIMAL(10,2) DEFAULT 0;

-- Açıklama için comment ekle
COMMENT ON COLUMN cases.notary_and_file_expenses IS 'Noter ve dosya masrafları tutarı (TL)';
