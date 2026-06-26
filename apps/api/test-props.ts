import { db } from './src/auth/better-auth';
import * as schema from './src/db/schema';
async function test() {
  const props = await db.select().from(schema.properties);
  console.log(props);
}
test().catch(console.error);
