const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
  console.log('Checking if tables are already set up...');
  const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
  
  if (error) {
    if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
      console.log('Tables do NOT exist. You need to run migrations.');
    } else {
      console.error('Error checking tables:', error);
    }
  } else {
    console.log('Tables exist! No need to run migrations manually.');
  }
}

checkTables();
