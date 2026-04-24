const supabase = require('../supabaseClient');
const groqService = require('../services/groqService');
const importService = require('../services/importService');
const alertService = require('../services/alertService');

const transactionController = {
  async getTransactions(req, res, next) {
    try {
      const { type, category, startDate, endDate, search, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      let query = supabase.from('transactions').select('*', { count: 'exact' }).eq('user_id', req.user.userId);

      if (type) query = query.eq('type', type);
      if (category) query = query.eq('category', category);
      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);
      if (search) query = query.ilike('description', `%${search}%`);

      query = query.order('date', { ascending: false }).range(offset, offset + limit - 1);

      const { data, count, error } = await query;
      if (error) throw error;

      res.json({ data, total: count, page: parseInt(page), limit: parseInt(limit) });
    } catch (error) {
      next(error);
    }
  },

  async createTransaction(req, res, next) {
    try {
      const { type, amount, description, date, payment_mode, tags } = req.body;
      let { category } = req.body;

      // Auto-categorize if not provided
      if (!category && description) {
        category = await groqService.categorizeTransaction(description);
      }

      const txObj = {
        user_id: req.user.userId,
        type,
        amount, // Stored in paise
        category: category || 'Other',
        description,
        date,
        payment_mode,
        tags
      };

      const { data: insertedTx, error } = await supabase.from('transactions').insert([txObj]).select().single();
      if (error) throw error;

      // --- PHASE 1: Shadow write to double-entry ledger ---
      try {
        const { data: accounts } = await supabase.from('accounts').select('*').eq('user_id', req.user.userId);
        if (accounts && accounts.length > 0) {
          const cashAccount = accounts.find(a => a.name === 'Cash/Bank');
          const revAccount = accounts.find(a => a.name === 'Sales Revenue');
          const expAccount = accounts.find(a => a.name === 'General Expense');
          
          if (cashAccount && revAccount && expAccount) {
            // Create Journal Entry header
            const { data: je } = await supabase.from('journal_entries').insert([{
              user_id: req.user.userId,
              date: date,
              description: description || 'Transaction',
              reference: `TXN-${insertedTx.id}`
            }]).select().single();
            
            if (je) {
              const lines = [];
              if (type === 'income') {
                // Debit Asset (Cash), Credit Revenue
                lines.push({ journal_entry_id: je.id, account_id: cashAccount.id, debit: amount, credit: 0 });
                lines.push({ journal_entry_id: je.id, account_id: revAccount.id, debit: 0, credit: amount });
              } else {
                // Debit Expense, Credit Asset (Cash)
                lines.push({ journal_entry_id: je.id, account_id: expAccount.id, debit: amount, credit: 0 });
                lines.push({ journal_entry_id: je.id, account_id: cashAccount.id, debit: 0, credit: amount });
              }
              await supabase.from('journal_lines').insert(lines);
            }
          }
        }
      } catch (err) {
        console.error("Failed to shadow-write to journal:", err);
      }
      // ----------------------------------------------------

      await alertService.runChecks(insertedTx);

      res.status(201).json({ data: insertedTx });
    } catch (error) {
      next(error);
    }
  },

  async updateTransaction(req, res, next) {
    try {
      const { id } = req.params;
      const updates = { ...req.body, updated_at: new Date().toISOString() };

      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', req.user.userId)
        .select()
        .single();

      if (error) throw error;
      res.json({ data });
    } catch (error) {
      next(error);
    }
  },

  async deleteTransaction(req, res, next) {
    try {
      const { id } = req.params;
      const { error } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', req.user.userId);
      
      if (error) throw error;
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async importCSV(req, res, next) {
    try {
      if (!req.file) return res.status(400).json({ error: 'No CSV file uploaded' });

      const result = await importService.processCSV(req.file.path, req.user.userId);
      res.json({ message: `Successfully imported ${result.count} transactions.` });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = transactionController;
