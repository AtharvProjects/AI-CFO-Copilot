const supabase = require('./supabaseClient');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    console.log('Starting seed process...');

    // 1. Create Demo User
    const email = 'demo@aicfo.in';
    const password = await bcrypt.hash('Demo@123', 10);
    
    // Check if user exists first to avoid duplicate errors
    let { data: existingUser } = await supabase.from('users').select('id').eq('email', email).single();
    
    let userId;
    if (existingUser) {
      console.log('Demo user already exists, reusing ID.');
      userId = existingUser.id;
    } else {
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert([{
          email,
          password,
          business_name: 'Sharma Electronics',
          gstin: '27AABCS1429B1ZB',
          pan: 'AABCS1429B',
          state: 'Maharashtra',
          business_type: 'Retail',
          monthly_budget: 50000000 // 5 Lakhs in paise
        }])
        .select()
        .single();
        
      if (userError) throw userError;
      userId = user.id;
      console.log('Demo user created.');
    }

    // 2. Generate 200 Transactions over 6 months
    console.log('Generating transactions...');
    const transactions = [];
    const categories = ['Food', 'Transport', 'Salaries', 'Tax', 'Utilities', 'Rent', 'Office Supplies', 'Software', 'Marketing', 'Other'];
    const descriptions = [
      'Office Lunch', 'Uber Ride', 'Employee Salary', 'GST Payment', 'Electricity Bill', 
      'Office Rent', 'Stationery', 'AWS Hosting', 'Facebook Ads', 'Consulting Fee'
    ];

    const today = new Date();
    
    for (let i = 0; i < 200; i++) {
      // Random date within last 180 days
      const txDate = new Date(today);
      txDate.setDate(txDate.getDate() - Math.floor(Math.random() * 180));
      
      const type = Math.random() > 0.3 ? 'expense' : 'income'; // 70% expenses
      let amount = Math.floor(Math.random() * 5000000) + 100000; // Between 1000 and 50000 INR (in paise)
      const catIndex = Math.floor(Math.random() * categories.length);
      
      // If income, override category
      const category = type === 'income' ? 'Sales' : categories[catIndex];
      const description = type === 'income' ? 'Client Payment' : descriptions[catIndex];

      transactions.push({
        user_id: userId,
        type,
        amount,
        category,
        description,
        date: txDate.toISOString(),
        payment_mode: ['Bank Transfer', 'Credit Card', 'UPI'][Math.floor(Math.random() * 3)],
        tags: ['demo']
      });
    }

    // Pre-plant Anomaly: Large Transaction
    transactions.push({
      user_id: userId,
      type: 'expense',
      amount: 150000000, // 15 Lakhs (Anomaly)
      category: 'Software',
      description: 'Annual Enterprise License (Anomaly)',
      date: new Date().toISOString(),
      payment_mode: 'Bank Transfer'
    });

    // Pre-plant Anomaly: Duplicate
    const dupTx = {
      user_id: userId,
      type: 'expense',
      amount: 2500000, // 25k
      category: 'Marketing',
      description: 'Google Ads (Duplicate)',
      date: new Date().toISOString(),
      payment_mode: 'Credit Card'
    };
    transactions.push(dupTx);
    transactions.push({ ...dupTx, description: 'Google Ads (Duplicate 2)' });

    // Insert Transactions
    const { error: txError } = await supabase.from('transactions').insert(transactions);
    if (txError) throw txError;

    console.log('Successfully inserted 200+ seed transactions.');
    console.log('Seed completed successfully!');

  } catch (error) {
    console.error('Seed Error:', error);
  } finally {
    process.exit(0);
  }
};

seedDatabase();
