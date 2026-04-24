const supabase = require('../supabaseClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
  async register(req, res, next) {
    try {
      const { email, password, business_name, gstin, pan, state, business_type, monthly_budget } = req.body;

      // Check if user exists
      const { data: existingUser } = await supabase.from('users').select('id').eq('email', email).single();
      if (existingUser) return res.status(400).json({ error: 'Email already exists' });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      const { data: user, error } = await supabase
        .from('users')
        .insert([{ email, password: hashedPassword, business_name, gstin, pan, state, business_type, monthly_budget }])
        .select()
        .single();

      if (error) throw error;

      // Generate JWT
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({ token, user: { id: user.id, email: user.email, business_name: user.business_name } });
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single();
      if (error || !user) return res.status(401).json({ error: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.json({ token, user: { id: user.id, email: user.email, business_name: user.business_name } });
    } catch (error) {
      next(error);
    }
  },

  async getProfile(req, res, next) {
    try {
      const { data: user, error } = await supabase.from('users').select('*').eq('id', req.user.userId).single();
      if (error) throw error;
      
      delete user.password;
      res.json({ user });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;
