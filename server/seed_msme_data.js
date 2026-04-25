const supabase = require('./supabaseClient');
require('dotenv').config();

const TARGET_USER_ID = '1c62c35c-4889-4be5-8167-217fdddb7cad';

const INDIAN_MSME_DATA = [
  // INCOME
  { description: 'Monthly Retainer - Apex Solutions', amount: 4500000, category: 'Services', type: 'income', date: '2026-04-01', payment_mode: 'Bank Transfer' },
  { description: 'Product Sales - Bulk Order (West Zone)', amount: 12500000, category: 'Sales', type: 'income', date: '2026-04-05', payment_mode: 'Bank Transfer' },
  { description: 'AMC Fees - Global Tech Park', amount: 850000, category: 'Services', type: 'income', date: '2026-04-10', payment_mode: 'UPI' },
  { description: 'Retail Walk-in Sales (Week 2)', amount: 3200000, category: 'Sales', type: 'income', date: '2026-04-14', payment_mode: 'Cash' },
  { description: 'Consultation Fee - Matrix Corp', amount: 1500000, category: 'Consulting', type: 'income', date: '2026-04-18', payment_mode: 'Bank Transfer' },
  { description: 'Product Licensing - Zylker India', amount: 5500000, category: 'Sales', type: 'income', date: '2026-04-22', payment_mode: 'Bank Transfer' },

  // EXPENSES
  { description: 'Commercial Rent - BKC Hub', amount: 12000000, category: 'Rent', type: 'expense', date: '2026-04-01', payment_mode: 'Bank Transfer' },
  { description: 'AWS India - Cloud Infrastructure', amount: 3127621, category: 'Software', type: 'expense', date: '2026-04-02', payment_mode: 'Card' },
  { description: 'Staff Salaries - April 2026', amount: 85000000, category: 'Salaries', type: 'expense', date: '2026-04-03', payment_mode: 'Bank Transfer' },
  { description: 'GST Payment (GSTR-3B) - March', amount: 4250000, category: 'Tax', type: 'expense', date: '2026-04-20', payment_mode: 'Bank Transfer' },
  { description: 'Airtel Business - Fiber & Leased Line', amount: 1540000, category: 'Utilities', type: 'expense', date: '2026-04-05', payment_mode: 'UPI' },
  { description: 'Blue Dart - Logistics & Shipping', amount: 2838119, category: 'Logistics', type: 'expense', date: '2026-04-12', payment_mode: 'UPI' },
  { description: 'Office Supplies - Reliance Retail', amount: 450000, category: 'Maintenance', type: 'expense', date: '2026-04-15', payment_mode: 'Card' },
  { description: 'Marketing Ads - Google Ads India', amount: 2500000, category: 'Marketing', type: 'expense', date: '2026-04-10', payment_mode: 'Card' },
  { description: 'Electricity - MSEB Commercial', amount: 840000, category: 'Utilities', type: 'expense', date: '2026-04-08', payment_mode: 'Bank Transfer' },
  { description: 'Professional Fees - CA Sharma & Co', amount: 1500000, category: 'Consulting', type: 'expense', date: '2026-04-22', payment_mode: 'Bank Transfer' },
  { description: 'Zomato Daily - Pantry & Team Lunch', amount: 85000, category: 'Food', type: 'expense', date: '2026-04-15', payment_mode: 'UPI' },
  { description: 'Uber for Business - Travel', amount: 124000, category: 'Travel', type: 'expense', date: '2026-04-18', payment_mode: 'Card' }
];

async function seed() {
  console.log('🚀 Initializing Realistic Indian MSME Data Seeding...');

  try {
    // 1. Clear existing transactions for this user
    console.log('🧹 Purging old mock records...');
    const { error: purgeError } = await supabase
      .from('transactions')
      .delete()
      .eq('user_id', TARGET_USER_ID);

    if (purgeError) throw purgeError;

    // 2. Insert new realistic data
    console.log('📦 Injecting 18 realistic Indian MSME records...');
    const transactions = INDIAN_MSME_DATA.map(tx => ({
      ...tx,
      user_id: TARGET_USER_ID,
      gst_rate: tx.category === 'Tax' ? 0 : 0.18,
      is_inter_state: false
    }));

    const { error: insertError } = await supabase
      .from('transactions')
      .insert(transactions);

    if (insertError) throw insertError;

    // 3. Update User profile to match
    console.log('👤 Synchronizing Enterprise Profile...');
    await supabase.from('users').update({
      business_name: 'Sharma Electronics & Solutions',
      state: 'Maharashtra',
      business_type: 'Manufacturing & Retail',
      monthly_budget: 150000000 // 1.5Cr Budget
    }).eq('id', TARGET_USER_ID);

    console.log('✅ Seeding Complete! The system is now populated with realistic Indian business data.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Failed:', err.message);
    process.exit(1);
  }
}

seed();
