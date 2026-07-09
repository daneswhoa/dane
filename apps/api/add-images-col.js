const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const sqlStatements = [
  `ALTER TABLE "units" ADD COLUMN IF NOT EXISTS "images" text;`
];

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not defined in the environment.');
    process.exit(1);
  }

  console.log('Connecting to database...');
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Connected. Running schema updates...');

    for (let statement of sqlStatements) {
      console.log(`Executing: ${statement}`);
      await client.query(statement);
    }

    console.log('Database updates completed successfully!');
  } catch (err) {
    console.error('Error executing migrations:', err);
  } finally {
    await client.end();
  }
}

main();
