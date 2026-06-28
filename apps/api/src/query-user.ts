import { Client } from 'pg';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../../.env') });

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query(`SELECT id, name, email FROM "user" WHERE id = 'DcfbKmKz6gl1N6ICj4WiLglRI23CX49k'`);
    console.log('User query result:');
    console.log(JSON.stringify(res.rows, null, 2));

    const allRes = await client.query(`SELECT id, name, email FROM "user" WHERE email ILIKE '%maryanne%' OR email ILIKE '%dustin%'`);
    console.log('All matching users:');
    console.log(JSON.stringify(allRes.rows, null, 2));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

main();
