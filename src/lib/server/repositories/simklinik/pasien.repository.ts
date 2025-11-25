import { eq, ilike, and, desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { patients, type Patient, type NewPatient } from '$lib/db/schema';
import { generateMRNumber } from '$lib/server/utils/pasien';

export class PasienRepository {
	async findAll(search?: string, limit = 50, offset = 0) {
		const query = db.select().from(patients).$dynamic();
		
		if (search) {
			query.where(
				ilike(patients.name, `%${search}%`)
			);
		}
		
		query.orderBy(desc(patients.createdAt)).limit(limit).offset(offset);
		
		return await query;
	}

	async findById(id: string): Promise<Patient | null> {
		const result = await db
			.select()
			.from(patients)
			.where(eq(patients.id, id))
			.limit(1);
		
		return result[0] || null;
	}

	async findByMrNumber(mrNumber: string): Promise<Patient | null> {
		const result = await db
			.select()
			.from(patients)
			.where(eq(patients.mrNumber, mrNumber))
			.limit(1);
		
		return result[0] || null;
	}

	async create(data: Omit<NewPatient, 'mrNumber' | 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
		const mrNumber = await generateMRNumber();
		const newPatient: NewPatient = {
			...data,
			mrNumber
		};

		const result = await db
			.insert(patients)
			.values(newPatient)
			.returning();
		
		return result[0];
	}

	async update(id: string, data: Partial<NewPatient>): Promise<Patient> {
		const result = await db
			.update(patients)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(patients.id, id))
			.returning();
		
		return result[0];
	}

	async delete(id: string): Promise<void> {
		await db.delete(patients).where(eq(patients.id, id));
	}

	async count(search?: string): Promise<number> {
		const query = db.select({ count: patients.id }).from(patients).$dynamic();
		
		if (search) {
			query.where(ilike(patients.name, `%${search}%`));
		}
		
		const result = await query;
		return result.length;
	}
}
