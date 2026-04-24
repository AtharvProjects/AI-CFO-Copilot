const supabase = require('../supabaseClient');
const forecastService = require('../services/forecastService');

const dashboardController = {
  async getDashboardData(req, res, next) {
    try {
      const userId = req.user.userId;
      
      // 1. Get total income/expense and calculate Net Profit
      // (For simplicity, doing basic aggregations using raw Supabase RPC or JS logic)
      const { data: allTransactions, error } = await supabase
        .from('transactions')
        .select('amount, type, category, date')
        .eq('user_id', userId);

      if (error) throw error;

      let totalIncome = 0;
      let totalExpense = 0;
      const categoryBreakdown = {};

      allTransactions.forEach(tx => {
        if (tx.type === 'income') totalIncome += parseInt(tx.amount);
        if (tx.type === 'expense') {
          totalExpense += parseInt(tx.amount);
          categoryBreakdown[tx.category] = (categoryBreakdown[tx.category] || 0) + parseInt(tx.amount);
        }
      });

      const netProfit = totalIncome - totalExpense;

      // 2. Get Cash Flow Forecast and Runway
      const forecastData = await forecastService.generateForecast(userId);

      // 3. Format Donut Chart Data
      const donutChartData = Object.keys(categoryBreakdown).map(cat => ({
        name: cat,
        value: categoryBreakdown[cat]
      }));

      // 4. Budget Usage
      const { data: user } = await supabase.from('users').select('monthly_budget').eq('id', userId).single();
      const budget = user?.monthly_budget || 0;
      const budgetUsagePercent = budget > 0 ? Math.min((totalExpense / budget) * 100, 100) : 0;

      res.json({
        kpis: {
          totalIncome,
          totalExpense,
          netProfit,
          cashRunwayDays: forecastData.runway
        },
        forecast: forecastData,
        donutChartData,
        budget: {
          total: budget,
          used: totalExpense,
          percent: budgetUsagePercent
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = dashboardController;
