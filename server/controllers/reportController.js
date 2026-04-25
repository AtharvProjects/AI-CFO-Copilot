require('dotenv').config({ path: './.env' });
const supabase = require('../supabaseClient');
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

exports.getMonthlyReportData = async (req, res) => {
  try {
    const { month, year } = req.query;
    const userId = req.user.userId; // Get from authenticated session

    // 1. Get Business Profile (from the users table)
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    const businessName = profile?.business_name || 'AI CFO Demo';

    // 2. Fetch Transactions for the Period
    // Start and End dates for the month
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { data: txs, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;

    // 3. Aggregate Data in JS (Consistent with dashboardController)
    let totalIncome = 0;
    let totalExpense = 0;
    let totalGst = 0;
    const categoryBreakdown = {};

    txs.forEach(tx => {
      const amount = parseInt(tx.amount);
      if (tx.type === 'income') {
        totalIncome += amount;
        totalGst += (parseInt(tx.cgst || 0) + parseInt(tx.sgst || 0) + parseInt(tx.igst || 0));
      } else {
        totalExpense += amount;
        categoryBreakdown[tx.category] = (categoryBreakdown[tx.category] || 0) + amount;
      }
    });

    const netProfit = totalIncome - totalExpense;

    // 4. Get Top 5 Expenses
    const topExpenses = Object.keys(categoryBreakdown)
      .map(cat => ({ category: cat, total: categoryBreakdown[cat] }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // 5. Generate AI Executive Summary using Groq
    const prompt = `
      As an AI CFO, provide a 3-line executive summary for a business named ${businessName}.
      Metrics for ${month}/${year} (all values in INR):
      - Total Income: INR ${(totalIncome / 100).toFixed(2)}
      - Total Expense: INR ${(totalExpense / 100).toFixed(2)}
      - Net Profit: INR ${(netProfit / 100).toFixed(2)}
      
      Focus on financial health and one actionable advice. 
      IMPORTANT: Use the text 'INR' instead of any currency symbols. Keep it strictly 3 lines.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
    });

    const aiSummary = chatCompletion.choices[0].message.content;

    res.json({
      profile: { business_name: businessName },
      kpis: {
        income: totalIncome,
        expense: totalExpense,
        netProfit
      },
      topExpenses,
      gstCollected: totalGst,
      aiSummary,
      period: { month, year }
    });

  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ error: 'Failed to aggregate report data' });
  }
};
