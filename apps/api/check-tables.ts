import { config } from 'dotenv';
import { resolve } from 'path';
import { neon } from '@neondatabase/serverless';

config({ path: resolve(__dirname, '../../.env') });

const sql = neon(process.env.DATABASE_URL!) as any;

async function run() {
  const rows = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `;
  console.log('Existing tables:');
  rows.forEach((r: any) => console.log(`- ${r.table_name}`));
}

run().catch(console.error);
