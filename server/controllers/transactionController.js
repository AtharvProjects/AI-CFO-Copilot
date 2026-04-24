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
