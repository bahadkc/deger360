-- Add insurance_response field to cases table
-- This field stores whether insurance company accepted or rejected the claim
-- Values: 'accepted', 'rejected', or NULL (not yet responded)

ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS insurance_response TEXT CHECK (insurance_response IN ('accepted', 'rejected'));

-- Add comment
COMMENT ON COLUMN cases.insurance_response IS 'Sigorta şirketinin başvuruya verdiği cevap: accepted (kabul), rejected (red)';
