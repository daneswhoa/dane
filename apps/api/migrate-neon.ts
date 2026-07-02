import { config } from 'dotenv';
import { resolve } from 'path';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';

config({ path: resolve(__dirname, '../../.env') });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function run() {
  console.log('Running Neon HTTP migrations...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Neon HTTP migrations complete.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
