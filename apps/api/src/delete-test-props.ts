import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { config } from 'dotenv';
import { resolve } from 'path';
import { ilike, or } from 'drizzle-orm';
import * as schema from './db/schema';

config({ path: resolve(__dirname, '../../../.env') });

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  const db = drizzle(pool);

  try {
    const propsToDelete = await db
      .select({ id: schema.properties.id, name: schema.properties.name })
      .from(schema.properties)
      .where(
        or(
          ilike(schema.properties.name, '%Test Towers%'),
          ilike(schema.properties.name, '%Lakeside%')
        )
      );

    console.log(`Found ${propsToDelete.length} test properties to delete.`);
    if (propsToDelete.length === 0) return;

    const propIds = propsToDelete.map(p => p.id);

    // Delete related tickets
    const tickets = await db.delete(schema.tickets).where(
      or(...propIds.map(id => ilike(schema.tickets.propertyId, id))) // Assuming propertyId is string. Actually let's use standard sql
    ).execute();
    
    // We'll just run raw SQL for safety
    console.log('Deleting units and properties...');
    const client = await pool.connect();
    
    for (const prop of propsToDelete) {
      console.log(`Deleting: ${prop.name} (${prop.id})`);
      await client.query(`DELETE FROM "invoices" WHERE "property_id" = $1`, [prop.id]);
      await client.query(`DELETE FROM "tickets" WHERE "property_id" = $1`, [prop.id]);
      await client.query(`DELETE FROM "leases" WHERE "property_id" = $1`, [prop.id]);
      await client.query(`DELETE FROM "units" WHERE "property_id" = $1`, [prop.id]);
      await client.query(`DELETE FROM "properties" WHERE "id" = $1`, [prop.id]);
    }
    client.release();
    
    console.log('Cleanup complete!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

main();
