const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

// We use the service_role key to bypass RLS and perform operations securely on the backend.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = supabase;
