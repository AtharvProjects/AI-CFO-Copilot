const supabase = require('../supabaseClient');
const groqService = require('./groqService');

const forecastService = {
  /**
   * Calculates 90-day rolling average and projects next 30 days
   */
  async generateForecast(userId) {
    // 1. Get data for last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const startDateStr = ninetyDaysAgo.toISOString().split('T')[0];

    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, type, date')
      .eq('user_id', userId)
      .gte('date', startDateStr)
      .order('date', { ascending: true });

    let totalIncome = 0;
    let totalExpense = 0;

    (transactions || []).forEach(tx => {
      if (tx.type === 'income') totalIncome += parseInt(tx.amount);
      if (tx.type === 'expense') totalExpense += parseInt(tx.amount);
    });

    const avgDailyIncome = Math.round(totalIncome / 90);
    const avgDailyExpense = Math.round(totalExpense / 90);
    
    // Check current balance (sum of all income - sum of all expense)
    const { data: allTx } = await supabase.rpc('get_net_balance', { p_user_id: userId });
    let currentBalance = allTx?.[0]?.balance || 0;

    // Calculate cash runway (days until balance hits 0 if no new income)
    const runway = avgDailyExpense > 0 ? Math.round(currentBalance / avgDailyExpense) : 999;

    // Project next 30 days
    const projection = [];
    let projectedBalance = currentBalance;
    const today = new Date();

    for (let i = 1; i <= 30; i++) {
      projectedBalance += avgDailyIncome;
      projectedBalance -= avgDailyExpense;
      
      const pDate = new Date(today);
      pDate.setDate(today.getDate() + i);

      projection.push({
        date: pDate.toISOString().split('T')[0],
        projectedIncome: avgDailyIncome,
        projectedExpense: avgDailyExpense,
        projectedBalance: projectedBalance
      });
    }

    // Generate narrative using Groq
    const narrativeData = {
      avgIncome: avgDailyIncome,
      avgExpense: avgDailyExpense,
      runway: runway
    };
    const narrative = await groqService.generateForecastNarrative(narrativeData);

    return {
      runway,
      avgDailyIncome,
      avgDailyExpense,
      narrative,
      projection
    };
  }
};

module.exports = forecastService;
