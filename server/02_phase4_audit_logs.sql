-- Phase 4: Immutable Audit Logs
-- Create a trigger to automatically log every INSERT, UPDATE, and DELETE on critical financial tables.

-- 1. Ensure the audit_logs table exists
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create the trigger function
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_old_data JSONB;
    v_new_data JSONB;
BEGIN
    -- Extract user_id based on the table
    IF TG_TABLE_NAME = 'transactions' THEN
        v_user_id := COALESCE(NEW.user_id, OLD.user_id);
    ELSIF TG_TABLE_NAME = 'journal_entries' THEN
        v_user_id := COALESCE(NEW.user_id, OLD.user_id);
    ELSIF TG_TABLE_NAME = 'accounts' THEN
        v_user_id := COALESCE(NEW.user_id, OLD.user_id);
    END IF;

    -- Set old and new data
    IF TG_OP = 'INSERT' THEN
        v_new_data := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);
    ELSIF TG_OP = 'DELETE' THEN
        v_old_data := to_jsonb(OLD);
    END IF;

    -- Insert into audit_logs
    IF v_user_id IS NOT NULL THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
        VALUES (v_user_id, TG_OP, TG_TABLE_NAME, COALESCE(NEW.id, OLD.id), v_old_data, v_new_data);
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach triggers to critical tables
DROP TRIGGER IF EXISTS audit_transactions_trigger ON transactions;
CREATE TRIGGER audit_transactions_trigger
    AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_journal_trigger ON journal_entries;
CREATE TRIGGER audit_journal_trigger
    AFTER INSERT OR UPDATE OR DELETE ON journal_entries
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Secure the audit_logs table (Append-only)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit logs"
    ON audit_logs FOR SELECT
    USING (auth.uid() = user_id);

-- Prevent any updates or deletes via API
CREATE POLICY "Deny updates on audit logs"
    ON audit_logs FOR UPDATE
    USING (false);

CREATE POLICY "Deny deletes on audit logs"
    ON audit_logs FOR DELETE
    USING (false);
