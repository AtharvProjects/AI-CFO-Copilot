const supabase = require('../supabaseClient');
const gstService = require('../services/gstService');

const gstController = {
  async getGstSummary(req, res, next) {
    try {
      const userId = req.user.userId;
      
      // Fetch from our new summary view
      const { data: summary, error } = await supabase
        .from('gst_summary')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"

      // Fetch upcoming due dates
      const dueDates = gstService.getNextDueDates();

      // Fetch transaction-wise GST data for a ledger view
      const { data: ledger, error: ledgerError } = await supabase
        .from('transactions')
        .select('date, description, type, category, amount, gst_rate, cgst, sgst, igst')
        .eq('user_id', userId)
        .neq('gst_rate', 0)
        .order('date', { ascending: false })
        .limit(50);

      if (ledgerError) throw ledgerError;

      res.json({
        summary: summary || { output_gst: 0, input_tax_credit: 0, net_gst_payable: 0 },
        dueDates,
        ledger
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = gstController;
