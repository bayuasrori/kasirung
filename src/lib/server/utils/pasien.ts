import { db } from '$lib/server/db';
import { patients } from '$lib/db/schema';
import { ilike, desc } from 'drizzle-orm';

export async function generateMRNumber(): Promise<string> {
	// Format: MR + 6 digit year + 4 digit sequence
	// Example: MR20240001
	const currentYear = new Date().getFullYear();
	const prefix = `MR${currentYear}`;
	
	// Get last MR number for current year
	const lastPatient = await db
		.select()
		.from(patients)
		.where(ilike(patients.mrNumber, `${prefix}%`))
		.orderBy(desc(patients.createdAt))
		.limit(1);
	
	let sequence = 1;
	
	if (lastPatient.length > 0) {
		const lastNumberStr = lastPatient[0].mrNumber.substring(prefix.length);
		const lastSequence = parseInt(lastNumberStr, 10);
		sequence = lastSequence + 1;
	}
	
	// Pad with leading zeros to make 4 digits
	const sequenceStr = sequence.toString().padStart(4, '0');
	return `${prefix}${sequenceStr}`;
}
