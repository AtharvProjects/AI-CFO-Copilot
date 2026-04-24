const supabase = require('../supabaseClient');
const socketService = require('./socketService');

const alertService = {
  /**
   * Run all fraud/anomaly checks on a new transaction
   */
  async runChecks(transaction) {
    const alerts = [];

    // 1. Unusual time (11 PM - 5 AM)
    const txHour = new Date(transaction.date).getHours();
    if (txHour >= 23 || txHour < 5) {
      alerts.push({
        type: 'unusual_time',
        severity: 'medium',
        message: `Transaction occurred at unusual time (${txHour}:00).`
      });
    }

    // 2. Large transaction (> 3x category average)
    // We'll calculate a simple average via RPC or JS logic. For simplicity, we assume we fetch it here.
    const { data: catData } = await supabase.rpc('get_category_average', {
      p_user_id: transaction.user_id,
      p_category: transaction.category
    });
    const avg = catData?.[0]?.avg_amount || 0;
    
    if (avg > 0 && transaction.amount > avg * 3) {
      alerts.push({
        type: 'large_transaction',
        severity: 'high',
        message: `Transaction amount is > 3x the average for ${transaction.category}.`
      });
    }

    // 3. Duplicate check (same amount, category, type within 24 hours)
    const oneDayAgo = new Date(new Date(transaction.date).getTime() - 24 * 60 * 60 * 1000).toISOString();
    const { count: duplicateCount } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', transaction.user_id)
      .eq('amount', transaction.amount)
      .eq('category', transaction.category)
      .gte('date', oneDayAgo);

    if (duplicateCount > 0) { // Should be > 1 if inserting the current one first, or > 0 if checking before insert
      alerts.push({
        type: 'duplicate',
        severity: 'medium',
        message: `Possible duplicate transaction found within 24 hours.`
      });
    }

    // 4. Budget overrun check
    const { data: userData } = await supabase
      .from('users')
      .select('monthly_budget')
      .eq('id', transaction.user_id)
      .single();
    
    if (userData && userData.monthly_budget > 0) {
      // Get current month's expenses
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { data: monthData } = await supabase.rpc('get_total_expenses', {
        p_user_id: transaction.user_id,
        p_start_date: startOfMonth
      });
      const totalExpense = monthData?.[0]?.total || 0;

      if ((totalExpense + transaction.amount) > (userData.monthly_budget * 0.8)) {
        alerts.push({
          type: 'budget_overrun',
          severity: 'high',
          message: `Monthly expenses have exceeded 80% of the budget.`
        });
      }
    }

    // Save and emit alerts
    for (let alert of alerts) {
      alert.user_id = transaction.user_id;
      alert.transaction_id = transaction.id;
      
      await supabase.from('alerts').insert([alert]);
      socketService.emitAlert(transaction.user_id, alert.type, alert);
    }

    return alerts;
  }
};

module.exports = alertService;
