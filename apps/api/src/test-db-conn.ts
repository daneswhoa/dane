import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../../.env') });

async function main() {
  const connectionString = process.env.DATABASE_URL;
  console.log('DATABASE_URL length:', connectionString ? connectionString.length : 0);
  if (!connectionString) {
    console.error('DATABASE_URL is missing.');
    return;
  }

  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Successfully connected to database!');
    const res = await client.query('SELECT NOW()');
    console.log('Result:', res.rows[0]);
  } catch (err) {
    console.error('Database connection error details:', err);
  } finally {
    await client.end();
  }
}

main();
