import { config } from 'dotenv';
import { resolve } from 'path';
import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

config({ path: resolve(__dirname, '../../.env') });

const sql = neon(process.env.DATABASE_URL!) as any;

async function run() {
  console.log('Starting verbose migration execution...');
  
  // 1. Ensure drizzle_migrations table exists (standard shape)
  await sql`
    CREATE TABLE IF NOT EXISTS public.drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `;
  
  // 2. Read migration journal
  const journalPath = path.join(__dirname, 'drizzle', 'meta', '_journal.json');
  if (!fs.existsSync(journalPath)) {
    throw new Error('Journal not found');
  }
  
  const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8'));
  const entries = journal.entries;
  
  console.log(`Journal has ${entries.length} entries.`);
  
  // 3. For each entry, check if applied and apply if not
  for (const entry of entries) {
    const tag = entry.tag;
    const migrationFile = `${tag}.sql`;
    const filePath = path.join(__dirname, 'drizzle', migrationFile);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`Migration file not found: ${filePath}`);
      continue;
    }
    
    // Check if migration has already been run
    const existing = await sql`
      SELECT id FROM public.drizzle_migrations WHERE hash = ${tag}
    `;
    
    if (existing.length > 0) {
      console.log(`Migration ${migrationFile} is already applied.`);
      continue;
    }
    
    console.log(`\n========================================`);
    console.log(`Applying migration: ${migrationFile}`);
    console.log(`========================================`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    const statements = content
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s.length > 0);
      
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}:`);
      console.log(stmt.substring(0, 150) + (stmt.length > 150 ? '...' : ''));
      try {
        await sql.query(stmt);
      } catch (err: any) {
        console.error(`ERROR executing statement:`, err.message);
        console.error(`Full failed statement:\n`, stmt);
        throw err;
      }
    }
    
    // Mark as applied
    const now = Date.now();
    await sql`
      INSERT INTO public.drizzle_migrations (hash, created_at)
      VALUES (${tag}, ${now})
    `;
    console.log(`Successfully applied and logged migration: ${migrationFile}`);
  }
  
  console.log('All migrations applied successfully!');
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
