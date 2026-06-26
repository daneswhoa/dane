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
    ssl: {
      rejectUnauthorized: false,
    },
  });

  console.log('Connecting to database...');
  try {
    const res = await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(255) PRIMARY KEY,
        owner_id VARCHAR(255) NOT NULL,
        actor_name VARCHAR(255) NOT NULL,
        actor_email VARCHAR(255) NOT NULL,
        actor_initials VARCHAR(50) NOT NULL,
        category_icon_name VARCHAR(100) NOT NULL,
        category_label VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        ip VARCHAR(45) NOT NULL,
        location VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL,
        severity VARCHAR(50) NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);
    console.log('Table audit_logs created successfully.');
  } catch (err) {
    console.error('Failed to create table:', err);
  } finally {
    await pool.end();
  }
}

run();
