const groqService = require('../services/groqService');
const supabase = require('../supabaseClient');

const chatController = {
  async getHistory(req, res, next) {
    try {
      const { agentId } = req.params;
      const userId = req.user.userId;

      const { data: session } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('user_id', userId)
        .eq('agent_id', agentId)
        .single();

      if (!session) return res.json({ messages: [] });

      const { data: messages } = await supabase
        .from('chat_messages')
        .select('role, content')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true });

      res.json({ messages: messages || [] });
    } catch (error) {
      console.error('History Error:', error);
      res.status(500).json({ error: 'Failed to fetch history' });
    }
  },

  async clearHistory(req, res, next) {
    try {
      const { agentId } = req.params;
      const userId = req.user.userId;

      await supabase
        .from('chat_sessions')
        .delete()
        .eq('user_id', userId)
        .eq('agent_id', agentId);

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to clear history' });
    }
  },

  async handleChat(req, res, next) {
    try {
      const { message, agentId } = req.body;
      const userId = req.user.userId;

      // 1. Get or create session
      let { data: session, error: sessionErr } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('user_id', userId)
        .eq('agent_id', agentId)
        .single();

      if (sessionErr || !session) {
        const { data: newSession } = await supabase
          .from('chat_sessions')
          .insert([{ user_id: userId, agent_id: agentId, title: 'New Chat' }])
          .select('id').single();
        session = newSession;
      }

      const sessionId = session?.id;

      // Save user message
      if (sessionId) {
        await supabase.from('chat_messages').insert([{ session_id: sessionId, role: 'user', content: message }]);
      }

      // 2. Fetch relevant financial context
      const { data: userData } = await supabase.from('users').select('*').eq('id', userId).single();
      
      const { data: monthData } = await supabase.rpc('get_total_expenses', {
        p_user_id: userId,
        p_start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      });
      const currentMonthExpenses = monthData?.[0]?.total || 0;

      // Fetch last 50 transactions for context
      const { data: recentTxs } = await supabase
        .from('transactions')
        .select('date, description, amount, category, type')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(50);

      // 3. Build Agent System Prompt
      let systemPrompt = `You are an AI CFO Copilot for an MSME named ${userData.business_name || 'your company'}. `;
      systemPrompt += `Monthly Budget: ${userData.monthly_budget || 0}. Current Month Expenses: ${currentMonthExpenses}. `;
      systemPrompt += `\n[DATA CONTEXT]: Here are the last 50 transactions: ${JSON.stringify(recentTxs || [])}. If asked about data, ALWAYS return a clean Markdown Table showing the calculations/results. Keep text explanations brief and actionable. `;

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
          systemPrompt += "You are the Growth Advisor. Focus on ROI issues, revenue growth, and historical comparisons. ";
          break;
        default:
          systemPrompt += "You are a general Financial Advisor. ";
      }

      // 4. Fetch past messages for this session
      let history = [];
      if (sessionId) {
        const { data: pastMsgs } = await supabase
          .from('chat_messages')
          .select('role, content')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true })
          .limit(10); // keep context small
        if (pastMsgs) history = pastMsgs;
      }

      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: message }
      ];

      // 5. Stream response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      await groqService.streamCfoChat(messages, res, async (fullResponse) => {
        // Callback after stream is done to save AI response
        if (sessionId) {
          await supabase.from('chat_messages').insert([{ session_id: sessionId, role: 'assistant', content: fullResponse }]);
        }
      });
    } catch (error) {
      console.error('Chat Error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to process chat' });
      } else {
        res.end();
      }
    }
  },

  async askQuick(req, res, next) {
    try {
      const { message } = req.body;
      const userId = req.user.userId;

      const { data: userData } = await supabase.from('users').select('*').eq('id', userId).single();
      
      const { data: recentTxs } = await supabase
        .from('transactions')
        .select('date, description, amount, category, type')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(20);

      const systemPrompt = `You are an AI CFO Copilot for ${userData.business_name || 'an MSME'}. 
      Context: ${JSON.stringify(recentTxs || [])}. 
      Task: Provide a 2-sentence actionable financial advice for the query. 
      Format: Text only.`;

      const response = await groqService.getChatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ]);

      res.json({ response });
    } catch (error) {
      console.error('Quick Ask Error:', error);
      res.status(500).json({ error: 'Failed to process quick query' });
    }
  }
};

module.exports = chatController;
