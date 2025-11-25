import postgres from 'postgres';

const sql = postgres('postgres://root:mysecretpassword@localhost:5432/local');

async function test() {
	try {
		const result = await sql`SELECT 1`;
		console.log('Connection successful:', result);
		process.exit(0);
	} catch (e) {
		console.error('Connection failed:', e);
		process.exit(1);
	}
}

test();
