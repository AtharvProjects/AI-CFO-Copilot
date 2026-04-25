-- ==========================================
-- PHASE 1: Double-Entry Accounting & RBAC
-- ==========================================

-- 1. Add Role-Based Access Control (RBAC) to Users
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'admin';

-- 2. Create the Chart of Accounts Table
CREATE TABLE IF NOT EXISTS accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Journal Entries Table (The Header)
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description TEXT,
  reference TEXT, -- e.g., Invoice # or Receipt #
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Journal Lines Table (The Debits & Credits)
CREATE TABLE IF NOT EXISTS journal_lines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  debit INTEGER DEFAULT 0,  -- Amounts stored in cents
  credit INTEGER DEFAULT 0, -- Amounts stored in cents
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- Note: A fully production-ready system would automatically create default 
-- accounts (Cash, Sales, Rent, etc.) via the Backend API when a user registers.
