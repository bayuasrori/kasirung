import { InpatientService } from './src/lib/server/services/simklinik/inpatient.service';
import { db } from './src/lib/server/db';

async function test() {
	try {
		console.log('Testing getRooms...');
		const rooms = await InpatientService.getRooms();
		console.log('Rooms:', rooms);

		console.log('Testing getActiveAdmissions...');
		const admissions = await InpatientService.getActiveAdmissions();
		console.log('Admissions:', admissions);
		
		process.exit(0);
	} catch (e) {
		console.error('Error:', e);
		process.exit(1);
	}
}

test();
