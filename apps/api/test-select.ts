import { db } from './src/auth/better-auth';
import * as schema from './src/db/schema';
import { eq } from 'drizzle-orm';

async function test() {
  const users = await db.select().from(schema.users).where(eq(schema.users.email, 'samuel.mutua@example.com'));
  console.log('Found users:', users);
}

test().catch(console.error);
