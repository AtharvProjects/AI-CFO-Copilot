-- ==========================================
-- PHASE 5: Dashboard & Forecasting RPCs
-- ==========================================

-- 1. Function to get net balance (Income - Expense)
CREATE OR REPLACE FUNCTION get_net_balance(p_user_id UUID)
RETURNS TABLE(balance BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0)::BIGINT as balance
    FROM transactions
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Function to get monthly trends (Optional helper)
CREATE OR REPLACE FUNCTION get_monthly_trends(p_user_id UUID)
RETURNS TABLE(month TEXT, income BIGINT, expense BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        to_char(date, 'Mon') as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END)::BIGINT as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)::BIGINT as expense
    FROM transactions
    WHERE user_id = p_user_id
    GROUP BY 1, to_char(date, 'MM')
    ORDER BY to_char(date, 'MM');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
