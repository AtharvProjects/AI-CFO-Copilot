const supabase = require('./supabaseClient');
require('dotenv').config();

const TARGET_USER_ID = '1c62c35c-4889-4be5-8167-217fdddb7cad';

const INDIAN_MSME_DATA = [
  // INCOME (Significant increase for positive approach)
  { description: 'Enterprise Project - Tata Group', amount: 45000000, category: 'Services', type: 'income', date: '2026-04-01', payment_mode: 'Bank Transfer' },
  { description: 'Q1 Export Order - Middle East', amount: 82500000, category: 'Sales', type: 'income', date: '2026-04-05', payment_mode: 'Bank Transfer' },
  { description: 'Govt. Contract - Smart City Phase 1', amount: 65000000, category: 'Contract', type: 'income', date: '2026-04-10', payment_mode: 'Bank Transfer' },
  { description: 'Product Licensing Revenue', amount: 12000000, category: 'IP', type: 'income', date: '2026-04-14', payment_mode: 'Bank Transfer' },
  { description: 'Service Retainers - 12 Clients', amount: 25000000, category: 'Services', type: 'income', date: '2026-04-18', payment_mode: 'Bank Transfer' },
  { description: 'Quarterly Bonus Revenue Share', amount: 18500000, category: 'Sales', type: 'income', date: '2026-04-22', payment_mode: 'Bank Transfer' },

  // EXPENSES (Controlled for profitability)
  { description: 'Commercial Rent - BKC Hub', amount: 8500000, category: 'Rent', type: 'expense', date: '2026-04-01', payment_mode: 'Bank Transfer' },
  { description: 'AWS India - Infrastructure', amount: 2450000, category: 'Software', type: 'expense', date: '2026-04-02', payment_mode: 'Card' },
  { description: 'Staff Salaries & Benefits', amount: 42000000, category: 'Salaries', type: 'expense', date: '2026-04-03', payment_mode: 'Bank Transfer' },
  { description: 'GST Compliance (GSTR-3B)', amount: 15400000, category: 'Tax', type: 'expense', date: '2026-04-20', payment_mode: 'Bank Transfer' },
  { description: 'Logistics - Blue Dart Express', amount: 8450000, category: 'Shipping', type: 'expense', date: '2026-04-05', payment_mode: 'UPI' },
  { description: 'R&D Allocation - New Product', amount: 12000000, category: 'R&D', type: 'expense', date: '2026-04-12', payment_mode: 'Bank Transfer' },
  { description: 'Marketing - Digital Campaign', amount: 6500000, category: 'Marketing', type: 'expense', date: '2026-04-10', payment_mode: 'Card' },
  { description: 'Utilities - MSEB & Water', amount: 450000, category: 'Utilities', type: 'expense', date: '2026-04-08', payment_mode: 'Bank Transfer' },
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
