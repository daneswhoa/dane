import { config } from 'dotenv';
import { resolve } from 'path';
import { neon } from '@neondatabase/serverless';

config({ path: resolve(__dirname, '../../.env') });

const sql = neon(process.env.DATABASE_URL!) as any;

async function run() {
  console.log('Cleaning up database (dropping all tables)...');
  
  // Query to find all tables in the public schema
  const rows = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  `;
  
  if (rows.length === 0) {
    console.log('Database is already clean.');
    return;
  }
  
  console.log(`Found ${rows.length} tables to drop.`);
  
  for (const row of rows) {
    const tableName = row.table_name;
    console.log(`Dropping table "${tableName}"...`);
    // Use sql.query for conventional string execution
    await sql.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE`);
  }
  
  console.log('Database cleanup complete.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
