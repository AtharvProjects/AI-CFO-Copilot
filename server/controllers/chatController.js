const groqService = require('../services/groqService');
const supabase = require('../supabaseClient');

const chatController = {
  async handleChat(req, res, next) {
    try {
      const { message, agentId } = req.body; // agentId: 1 (Cash Flow), 2 (Risk), 3 (Tax/GST), 4 (Growth)
      const userId = req.user.userId;

      // 1. Fetch relevant financial context
      // In a real app, you would fetch only what's necessary based on the agentId
      const { data: userData } = await supabase.from('users').select('*').eq('id', userId).single();
      
      const { data: monthData } = await supabase.rpc('get_total_expenses', {
        p_user_id: userId,
        p_start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      });
      const currentMonthExpenses = monthData?.[0]?.total || 0;

      // Fetch last 50 transactions for Natural Language Data Querying (Text-to-SQL Simulation)
      const { data: recentTxs } = await supabase
        .from('transactions')
        .select('date, description, amount, category, type')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(50);

      // 2. Build Agent System Prompt
      let systemPrompt = `You are an AI CFO Copilot for an MSME named ${userData.business_name}. `;
      systemPrompt += `Monthly Budget: ${userData.monthly_budget}. Current Month Expenses: ${currentMonthExpenses}. `;
      systemPrompt += `\n[DATA CONTEXT]: Here are the last 50 transactions for this business: ${JSON.stringify(recentTxs)}. If the user asks for data aggregations, use this data to perform calculations and ALWAYS return a clean Markdown Table showing the results. `;

      switch (parseInt(agentId)) {
        case 1:
          systemPrompt += "You are the Cash Flow Expert. Focus on liquidity, shortfalls, and forecasting. ";
          break;
        case 2:
          systemPrompt += "You are the Risk Expert. Focus on identifying anomalies, unusual patterns, and risk rating. ";
          break;
        case 3:
          systemPrompt += "You are the Tax/GST Expert. Focus on GST liability, input tax credit, and tax optimization. ";
          break;
        case 4:
          systemPrompt += "You are the Growth Expert. Focus on ROI issues, revenue growth, and historical comparisons. ";
          break;
        default:
          systemPrompt += "You are a general Financial Advisor. ";
      }

      systemPrompt += "Provide clear, concise, and professional advice. Avoid repeating words or phrases. Use markdown formatting for readability.";

      // 3. Prepare messages array
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ];

      // 4. Stream response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      await groqService.streamCfoChat(messages, res);
    } catch (error) {
      console.error('Chat Error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to process chat' });
      } else {
        res.end();
      }
    }
  }
};

module.exports = chatController;
