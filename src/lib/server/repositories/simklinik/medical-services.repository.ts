import { eq, ilike, and, desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
	medicalServices,
	medicalServiceCategories,
	type MedicalService,
	type NewMedicalService,
	type MedicalServiceCategory,
	type NewMedicalServiceCategory
} from '$lib/db/schema';

const medicalServiceFields = {
	id: medicalServices.id,
	categoryId: medicalServices.categoryId,
	code: medicalServices.code,
	name: medicalServices.name,
	description: medicalServices.description,
	price: medicalServices.price,
	duration: medicalServices.duration,
	isActive: medicalServices.isActive,
	createdAt: medicalServices.createdAt,
	updatedAt: medicalServices.updatedAt
};

export class MedicalServicesRepository {
	async findAll(search?: string, categoryId?: string, limit = 50, offset = 0) {
		const query = db
			.select({
				...medicalServiceFields,
				category: medicalServiceCategories
			})
			.from(medicalServices)
			.leftJoin(medicalServiceCategories, eq(medicalServices.categoryId, medicalServiceCategories.id))
			.$dynamic();

		const whereConditions = [];
		
		if (search) {
			whereConditions.push(
				ilike(medicalServices.name, `%${search}%`)
			);
		}
		
		if (categoryId) {
			whereConditions.push(
				eq(medicalServices.categoryId, categoryId)
			);
		}
		
		if (whereConditions.length > 0) {
			query.where(and(...whereConditions));
		}
		
		query.orderBy(medicalServices.name).limit(limit).offset(offset);
		
		return await query;
	}

	async findAllCategories() {
		return await db
			.select()
			.from(medicalServiceCategories)
			.orderBy(medicalServiceCategories.name);
	}

	async findById(id: string) {
		const result = await db
			.select({
				...medicalServiceFields,
				category: medicalServiceCategories
			})
			.from(medicalServices)
			.leftJoin(medicalServiceCategories, eq(medicalServices.categoryId, medicalServiceCategories.id))
			.where(eq(medicalServices.id, id))
			.limit(1);
		
		return result[0] || null;
	}

	async findByCode(code: string): Promise<MedicalService | null> {
		const result = await db
			.select()
			.from(medicalServices)
			.where(eq(medicalServices.code, code))
			.limit(1);
		
		return result[0] || null;
	}

	async createService(data: Omit<NewMedicalService, 'id' | 'createdAt' | 'updatedAt'>): Promise<MedicalService> {
		const result = await db
			.insert(medicalServices)
			.values(data)
			.returning();
		
		return result[0];
	}

	async createCategory(data: Omit<NewMedicalServiceCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<MedicalServiceCategory> {
		const result = await db
			.insert(medicalServiceCategories)
			.values(data)
			.returning();
		
		return result[0];
	}

	async updateService(id: string, data: Partial<NewMedicalService>): Promise<MedicalService> {
		const result = await db
			.update(medicalServices)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(medicalServices.id, id))
			.returning();
		
		return result[0];
	}

	async deleteService(id: string): Promise<void> {
		await db.delete(medicalServices).where(eq(medicalServices.id, id));
	}

	async count(search?: string, categoryId?: string): Promise<number> {
		const query = db.select({ count: medicalServices.id }).from(medicalServices).$dynamic();
		
		const whereConditions = [];
		
		if (search) {
			whereConditions.push(
				ilike(medicalServices.name, `%${search}%`)
			);
		}
		
		if (categoryId) {
			whereConditions.push(
				eq(medicalServices.categoryId, categoryId)
			);
		}
		
		if (whereConditions.length > 0) {
			query.where(and(...whereConditions));
		}
		
		const result = await query;
		return result.length;
	}

	async searchServices(query: string, categoryId?: string, limit = 10) {
		return await this.findAll(query, categoryId, limit, 0);
	}
}
