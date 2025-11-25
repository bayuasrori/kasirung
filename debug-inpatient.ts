import postgres from 'postgres';

// Try common credentials
const creds = [
    'postgres://root:mysecretpassword@localhost:5432/local',
    'postgres://postgres:mysecretpassword@localhost:5432/local',
    'postgres://postgres:postgres@localhost:5432/local',
    'postgres://root:root@localhost:5432/local'
];

async function test() {
    for (const url of creds) {
        console.log(`Trying ${url.replace(/:[^:@]+@/, ':***@')}...`);
        const sql = postgres(url);
        try {
            await sql`SELECT 1`;
            console.log('Connected!');
            
            // Check tables
            try {
                const rooms = await sql`SELECT * FROM inpatient_rooms`;
                console.log('inpatient_rooms count:', rooms.length);
                const beds = await sql`SELECT * FROM inpatient_beds`;
                console.log('inpatient_beds count:', beds.length);
            } catch (err) {
                console.error('Error querying tables:', err.message);
            }

            process.exit(0);
        } catch (e) {
            console.log('Failed:', e.message);
        } finally {
            await sql.end();
        }
    }
    console.error('All credentials failed');
    process.exit(1);
}

test();
