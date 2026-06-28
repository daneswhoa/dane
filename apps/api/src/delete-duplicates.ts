import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../../.env') });

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    
    // We want to delete duplicate Messi Apartments and Jonas Heights that are still "pending"
    console.log('Finding pending duplicate properties...');
    const res = await client.query(`
      SELECT id, name FROM properties 
      WHERE status = 'pending' 
      AND (name ILIKE '%Messi%' OR name ILIKE '%Jonas%')
    `);

    console.log(`Found ${res.rows.length} duplicate properties to delete.`);
    
    for (const prop of res.rows) {
      console.log(`Deleting: ${prop.name} (${prop.id})`);
      await client.query(`DELETE FROM "invoices" WHERE "property_id" = $1`, [prop.id]);
      await client.query(`DELETE FROM "tickets" WHERE "property_id" = $1`, [prop.id]);
      await client.query(`DELETE FROM "leases" WHERE "property_id" = $1`, [prop.id]);
      await client.query(`DELETE FROM "units" WHERE "property_id" = $1`, [prop.id]);
      await client.query(`DELETE FROM "properties" WHERE "id" = $1`, [prop.id]);
    }
    client.release();
    
    console.log('Duplicate cleanup complete!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

main();
