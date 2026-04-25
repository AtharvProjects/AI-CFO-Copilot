-- ==========================================
-- PHASE 3: GST Module Integration
-- ==========================================

-- 1. Add GST Columns to Transactions Table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS gst_rate DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS cgst INTEGER DEFAULT 0, -- Stored in paise
ADD COLUMN IF NOT EXISTS sgst INTEGER DEFAULT 0, -- Stored in paise
ADD COLUMN IF NOT EXISTS igst INTEGER DEFAULT 0, -- Stored in paise
ADD COLUMN IF NOT EXISTS is_inter_state BOOLEAN DEFAULT FALSE;

-- 2. Create a GST Ledger View (Optional but helpful)
-- This view helps in calculating net GST liability
CREATE OR REPLACE VIEW gst_summary AS
SELECT 
  user_id,
  SUM(CASE WHEN type = 'income' THEN (cgst + sgst + igst) ELSE 0 END) as output_gst,
  SUM(CASE WHEN type = 'expense' THEN (cgst + sgst + igst) ELSE 0 END) as input_tax_credit,
  SUM(CASE WHEN type = 'income' THEN (cgst + sgst + igst) ELSE 0 END) - 
  SUM(CASE WHEN type = 'expense' THEN (cgst + sgst + igst) ELSE 0 END) as net_gst_payable
FROM transactions
GROUP BY user_id;
