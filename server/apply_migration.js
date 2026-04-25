const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL is missing in .env');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🚀 Connected to Supabase Database.');

    // Find all SQL migration files and sort them
    const files = fs.readdirSync(__dirname)
      .filter(f => f.endsWith('.sql') && /^\d+/.test(f))
      .sort();

    console.log(`Found ${files.length} migration files.`);

    for (const file of files) {
      console.log(`⏳ Applying ${file}...`);
      const sql = fs.readFileSync(path.join(__dirname, file), 'utf8');
      
      try {
        await client.query(sql);
        console.log(`✅ ${file} applied.`);
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log(`ℹ️ ${file} (Skipped: Some elements already exist)`);
        } else {
          throw err;
        }
      }
    }
    
    console.log('🎉 All migrations processed successfully!');

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

runMigration();
