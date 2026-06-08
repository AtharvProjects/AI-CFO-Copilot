const supabase = require('../supabaseClient');

const userController = {
  async getProfile(req, res, next) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, business_name, gstin, pan, state, business_type, monthly_budget, role, created_at')
        .eq('id', req.user.userId)
        .single();

      if (error) throw error;
      res.json({ data });
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const updates = req.body;
      // Filter out sensitive/system fields
      const allowedUpdates = ['business_name', 'gstin', 'pan', 'state', 'business_type', 'monthly_budget'];
      const filteredUpdates = {};
      
      allowedUpdates.forEach(field => {
        if (updates[field] !== undefined) {
          filteredUpdates[field] = updates[field];
        }
      });

      const { data, error } = await supabase
        .from('users')
        .update(filteredUpdates)
        .eq('id', req.user.userId)
        .select()
        .single();

      if (error) throw error;
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController;
