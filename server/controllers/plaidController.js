const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

// In-memory store for demo purposes. 
// In production, save this in the `users` table or a `plaid_items` table in Supabase.
const userAccessTokens = new Map();

const plaidController = {
  async createLinkToken(req, res, next) {
    try {
      const { userId } = req.user;
      
      const request = {
        user: { client_user_id: userId },
        client_name: 'AI CFO Copilot',
        products: ['transactions'],
        country_codes: ['US', 'GB', 'CA'], // Add other supported countries as needed
        language: 'en',
      };
      
      const response = await plaidClient.linkTokenCreate(request);
      res.json(response.data);
    } catch (error) {
      console.error('Error creating Plaid link token:', error.response?.data || error.message);
      next(error);
    }
  },

  async setAccessToken(req, res, next) {
    try {
      const { public_token } = req.body;
      const { userId } = req.user;
      
      const request = { public_token };
      const response = await plaidClient.itemPublicTokenExchange(request);
      
      const accessToken = response.data.access_token;
      const itemId = response.data.item_id;
      
      // Store token in memory for this user
      userAccessTokens.set(userId, accessToken);

      res.json({ success: true, item_id: itemId });
    } catch (error) {
      console.error('Error exchanging public token:', error.response?.data || error.message);
      next(error);
    }
  },

  async getTransactions(req, res, next) {
    try {
      const { userId } = req.user;
      const accessToken = userAccessTokens.get(userId);

      if (!accessToken) {
        return res.status(400).json({ error: 'User has not connected a bank account' });
      }

      // Fetch transactions for the last 30 days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const startDateString = startDate.toISOString().split('T')[0];
      
      const endDateString = new Date().toISOString().split('T')[0];

      const request = {
        access_token: accessToken,
        start_date: startDateString,
        end_date: endDateString,
      };
      
      const response = await plaidClient.transactionsGet(request);
      
      // Format transactions to match our UI
      const formattedTransactions = response.data.transactions.map(t => ({
        id: t.transaction_id,
        date: t.date,
        description: t.name,
        // Plaid returns positive amounts for expenses/debits, negative for income/credits.
        // Our UI expects negative for expenses, positive for income.
        amount: t.amount * -100, // Convert to generic currency scale (like paise/cents)
        status: 'pending'
      }));

      res.json({ transactions: formattedTransactions });
    } catch (error) {
      console.error('Error fetching transactions:', error.response?.data || error.message);
      next(error);
    }
  }
};

module.exports = plaidController;
