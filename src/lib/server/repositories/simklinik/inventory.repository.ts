import { eq, ilike, and, desc, lt, gte } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { 
	medicalInventory, 
	stockMovements,
	type MedicalInventory, 
	type NewMedicalInventory,
	type StockMovement,
	type NewStockMovement
} from '$lib/db/schema';

export class InventoryRepository {
	async findAll(search?: string, type?: string, categoryId?: string, showOnlyActive = true, limit = 50, offset = 0) {
		const query = db
			.select()
			.from(medicalInventory)
			.$dynamic();

		const whereConditions = [];
		
		if (search) {
			whereConditions.push(
				ilike(medicalInventory.name, `%${search}%`)
			);
		}
		
		if (type) {
			whereConditions.push(
				eq(medicalInventory.type, type as 'medicine' | 'consumable' | 'equipment')
			);
		}
		
		if (categoryId) {
			whereConditions.push(
				eq(medicalInventory.categoryId, categoryId)
			);
		}
		
		if (showOnlyActive) {
			whereConditions.push(
				eq(medicalInventory.isActive, true)
			);
		}
		
		if (whereConditions.length > 0) {
			query.where(and(...whereConditions));
		}
		
		query.orderBy(medicalInventory.name).limit(limit).offset(offset);
		
		return await query;
	}

	async findById(id: string) {
		const result = await db
			.select()
			.from(medicalInventory)
			.where(eq(medicalInventory.id, id))
			.limit(1);
		
		return result[0] || null;
	}

	async findByCode(code: string): Promise<MedicalInventory | null> {
		const result = await db
			.select()
			.from(medicalInventory)
			.where(eq(medicalInventory.code, code))
			.limit(1);
		
		return result[0] || null;
	}

	async create(data: Omit<NewMedicalInventory, 'id' | 'createdAt' | 'updatedAt'>): Promise<MedicalInventory> {
		const result = await db
			.insert(medicalInventory)
			.values(data)
			.returning();
		
		return result[0];
	}

	async update(id: string, data: Partial<NewMedicalInventory>): Promise<MedicalInventory> {
		const result = await db
			.update(medicalInventory)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(medicalInventory.id, id))
			.returning();
		
		return result[0];
	}

	async delete(id: string): Promise<void> {
		await db.delete(medicalInventory).where(eq(medicalInventory.id, id));
	}

	async count(search?: string, type?: string, categoryId?: string): Promise<number> {
		const query = db.select({ count: medicalInventory.id }).from(medicalInventory).$dynamic();
		
		const whereConditions = [];
		
		if (search) {
			whereConditions.push(
				ilike(medicalInventory.name, `%${search}%`)
			);
		}
		
		if (type) {
			whereConditions.push(
				eq(medicalInventory.type, type as 'medicine' | 'consumable' | 'equipment')
			);
		}
		
		if (categoryId) {
			whereConditions.push(
				eq(medicalInventory.categoryId, categoryId)
			);
		}
		
		if (whereConditions.length > 0) {
			query.where(and(...whereConditions));
		}
		
		const result = await query;
		return result.length;
	}

	// Stock movement related methods
	async addStockMovement(data: Omit<NewStockMovement, 'id' | 'createdAt'>): Promise<StockMovement> {
		const result = await db
			.insert(stockMovements)
			.values(data)
			.returning();
		
		// Update inventory stock
		const item = await this.findById(data.itemId);
		if (item) {
			const newStock = data.type === 'out' ? 
				item.stock - data.quantity : 
				data.type === 'in' ? 
				item.stock + data.quantity : 
				data.type === 'adjust' ? 
				data.quantity : 
				item.stock; // For expired/returned, stock doesn't change

			await this.update(data.itemId, { stock: newStock });
		}
		
		return result[0];
	}

	async getStockMovements(itemId: string, limit = 50) {
		return await db
			.select()
			.from(stockMovements)
			.where(eq(stockMovements.itemId, itemId))
			.orderBy(desc(stockMovements.createdAt))
			.limit(limit);
	}

	async getLowStockItems(limit = 50, offset = 0) {
		return await db
			.select()
			.from(medicalInventory)
			.where(and(
				lt(medicalInventory.stock, medicalInventory.minStock),
				eq(medicalInventory.isActive, true)
			))
			.orderBy(medicalInventory.name)
			.limit(limit)
			.offset(offset);
	}

	async getExpiringItems(daysUntilExpiry = 30, limit = 50) {
		const expiryDate = new Date();
		expiryDate.setDate(expiryDate.getDate() + daysUntilExpiry);

		return await db
			.select()
			.from(medicalInventory)
			.where(and(
				gte(medicalInventory.expiryDate, expiryDate.toISOString().split('T')[0]),
				lt(medicalInventory.expiryDate, new Date().toISOString().split('T')[0]),
				eq(medicalInventory.isActive, true)
			))
			.orderBy(medicalInventory.expiryDate)
			.limit(limit);
	}

	async getExpiredItems(limit = 50) {
		const today = new Date().toISOString().split('T')[0];

		return await db
			.select()
			.from(medicalInventory)
			.where(and(
				lt(medicalInventory.expiryDate, today),
				eq(medicalInventory.isActive, true)
			))
			.orderBy(medicalInventory.expiryDate)
			.limit(limit);
	}

	async searchItems(query: string, limit = 10) {
		return await this.findAll(query, undefined, undefined, true, limit, 0);
	}
}

export class StockMovementsRepository {
	async findAll(itemId?: string, type?: string, limit = 50, offset = 0) {
		const query = db
			.select({
				movement: stockMovements,
				item: medicalInventory
			})
			.from(stockMovements)
			.leftJoin(medicalInventory, eq(stockMovements.itemId, medicalInventory.id))
			.$dynamic();

		const whereConditions = [];
		
		if (itemId) {
			whereConditions.push(
				eq(stockMovements.itemId, itemId)
			);
		}
		
		if (type) {
			whereConditions.push(
				eq(stockMovements.type, type as 'in' | 'out' | 'adjust' | 'expired' | 'returned')
			);
		}
		
		if (whereConditions.length > 0) {
			query.where(and(...whereConditions));
		}
		
		query.orderBy(desc(stockMovements.createdAt)).limit(limit).offset(offset);
		
		return await query;
	}

	async findByItemId(itemId: string, limit = 50) {
		return await db
			.select()
			.from(stockMovements)
			.where(eq(stockMovements.itemId, itemId))
			.orderBy(desc(stockMovements.createdAt))
			.limit(limit);
	}
}
