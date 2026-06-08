const supabase = require('./supabaseClient');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const DEMO_USER_ID = '1c62c35c-4889-4be5-8167-217fdddb7cad';
const DEMO_EMAIL = 'demo@aicfo.in';
const DEMO_PASSWORD = 'demo1234';

async function setupDemoAccount() {
  console.log('🏗️ Setting up Demo Account...');
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  const { error } = await supabase
    .from('users')
    .update({ 
      email: DEMO_EMAIL, 
      password: hashedPassword,
      business_name: 'Sharma Electronics & Solutions',
      role: 'admin'
    })
    .eq('id', DEMO_USER_ID);

  if (error) {
    console.error('❌ Failed to setup demo account:', error.message);
  } else {
    console.log('✅ Demo Account Ready!');
    console.log(`📧 Email: ${DEMO_EMAIL}`);
    console.log(`🔑 Password: ${DEMO_PASSWORD}`);
  }
  process.exit();
}

setupDemoAccount();
