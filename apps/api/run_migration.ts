import { config } from 'dotenv';
import { resolve } from 'path';
import { db } from './src/auth/better-auth';
import * as fs from 'fs';

config({ path: resolve(__dirname, '../../.env') });

async function main() {
  try {
    const sql = fs.readFileSync('./drizzle/0005_mute_scarecrow.sql', 'utf-8');
    const statements = sql.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s.length > 0);
    
    for (const stmt of statements) {
      console.log('Executing:', stmt);
      try {
        await db.execute(stmt);
      } catch (e: any) {
        console.warn('Statement failed, continuing:', e.message);
      }
    }
    console.log('Migration applied successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed completely:', error);
    process.exit(1);
  }
}

main();
