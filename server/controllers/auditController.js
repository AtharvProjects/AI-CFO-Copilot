const supabase = require('../supabaseClient');

const auditController = {
  async getAuditLogs(req, res, next) {
    try {
      const { page = 1, limit = 20, table_name, action } = req.query;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .eq('user_id', req.user.userId);

      if (table_name) query = query.eq('table_name', table_name);
      if (action) query = query.eq('action', action);

      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, count, error } = await query;
      if (error) throw error;

      res.json({
        data,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit)
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = auditController;
