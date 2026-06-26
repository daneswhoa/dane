const { Pool } = require('pg');
const { URL } = require('url');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function run() {
  const dbUrl = new URL(process.env.DATABASE_URL);
  const pool = new Pool({
    user: dbUrl.username,
    password: decodeURIComponent(dbUrl.password),
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port || '5432'),
    database: dbUrl.pathname.slice(1),
    ssl: { rejectUnauthorized: false },
  });

  console.log('Connecting to database to add settings columns...');
  try {
    await pool.query(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS settings TEXT;`);
    await pool.query(`ALTER TABLE units ADD COLUMN IF NOT EXISTS recurring_fee_details TEXT;`);
    await pool.query(`ALTER TABLE units ADD COLUMN IF NOT EXISTS move_in_fee_details TEXT;`);
    console.log('Columns settings, recurring_fee_details, and move_in_fee_details added successfully.');
  } catch (err) {
    console.error('Failed to alter tables:', err);
  } finally {
    await pool.end();
  }
}

run();
