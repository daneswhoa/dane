import { db } from './src/auth/better-auth';
import * as schema from './src/db/schema';

async function test() {
  try {
    await db.insert(schema.users).values({
      id: 'test-1234',
      name: 'Test',
      email: 'samuel.mutua@example.com', // testing duplicate
      role: 'tenant'
    });
    console.log('Insert succeeded');
  } catch (e: any) {
    console.log('--- ERROR ---');
    console.log(e);
  }
}

test().catch(console.error);
