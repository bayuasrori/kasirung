import { db } from './src/lib/db/client';
import { sql } from 'drizzle-orm';

async function test() {
	try {
		const result = await db.execute(sql`SELECT 1`);
		console.log('Connection successful:', result);
		process.exit(0);
	} catch (e) {
		console.error('Connection failed:', e);
		process.exit(1);
	}
}

test();
