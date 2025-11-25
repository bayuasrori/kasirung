import { eq, ilike, and, desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { medicalStaff, users, type MedicalStaff, type NewMedicalStaff } from '$lib/db/schema';

export class MedicalStaffRepository {
	async findAll(search?: string, role?: string, limit = 50, offset = 0) {
		const query = db
			.select({
				id: medicalStaff.id,
				userId: medicalStaff.userId,
				nip: medicalStaff.nip,
				name: medicalStaff.name,
				specialization: medicalStaff.specialization,
				phone: medicalStaff.phone,
				email: medicalStaff.email,
				role: medicalStaff.role,
				isActive: medicalStaff.isActive,
				createdAt: medicalStaff.createdAt,
				updatedAt: medicalStaff.updatedAt
			})
			.from(medicalStaff)
			.$dynamic();

		const whereConditions = [];
		
		if (search) {
			whereConditions.push(
				ilike(medicalStaff.name, `%${search}%`)
			);
		}
		
		if (role) {
			whereConditions.push(
				eq(medicalStaff.role, role as any)
			);
		}
		
		if (whereConditions.length > 0) {
			query.where(and(...whereConditions));
		}
		
		query.orderBy(desc(medicalStaff.createdAt)).limit(limit).offset(offset);
		
		return await query;
	}

	async findById(id: string) {
		const result = await db
			.select()
			.from(medicalStaff)
			.where(eq(medicalStaff.id, id))
			.limit(1);
		
		return result[0] || null;
	}

	async findByNip(nip: string): Promise<MedicalStaff | null> {
		const result = await db
			.select()
			.from(medicalStaff)
			.where(eq(medicalStaff.nip, nip))
			.limit(1);
		
		return result[0] || null;
	}

	async findByUserId(userId: string): Promise<MedicalStaff | null> {
		const result = await db
			.select()
			.from(medicalStaff)
			.where(eq(medicalStaff.userId, userId))
			.limit(1);
		
		return result[0] || null;
	}

	async create(data: Omit<NewMedicalStaff, 'id' | 'createdAt' | 'updatedAt'>): Promise<MedicalStaff> {
		const result = await db
			.insert(medicalStaff)
			.values(data)
			.returning();
		
		return result[0];
	}

	async update(id: string, data: Partial<NewMedicalStaff>): Promise<MedicalStaff> {
		const result = await db
			.update(medicalStaff)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(medicalStaff.id, id))
			.returning();
		
		return result[0];
	}

	async delete(id: string): Promise<void> {
		await db.delete(medicalStaff).where(eq(medicalStaff.id, id));
	}

	async count(search?: string, role?: string): Promise<number> {
		const query = db.select({ count: medicalStaff.id }).from(medicalStaff).$dynamic();
		
		const whereConditions = [];
		
		if (search) {
			whereConditions.push(
				ilike(medicalStaff.name, `%${search}%`)
			);
		}
		
		if (role) {
			whereConditions.push(
				eq(medicalStaff.role, role as any)
			);
		}
		
		if (whereConditions.length > 0) {
			query.where(and(...whereConditions));
		}
		
		const result = await query;
		return result.length;
	}
}
