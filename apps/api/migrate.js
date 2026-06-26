const { Client } = require('pg');
require('dotenv').config({ path: '../../.env' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function run() {
  await client.connect();
  console.log('Connected to database to run migrations...');
  
  // Alter tickets table
  const sql = `
    ALTER TABLE "tickets" ALTER COLUMN "tenant_id" DROP NOT NULL;
    ALTER TABLE "tickets" ALTER COLUMN "tenant_email" DROP NOT NULL;
    ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "title" varchar(255);
    ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "category" varchar(100);
    ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "hourly_rate" numeric;
    ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "max_authorization" numeric;
  `;
  
  await client.query(sql);
  console.log('Migration executed successfully!');
  await client.end();
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
