import type { NewMedicalInventory, MedicalInventory, NewStockMovement, StockMovement } from '$lib/db/schema';
import { InventoryRepository, StockMovementsRepository } from '$lib/server/repositories/simklinik/inventory.repository';

export class InventoryService {
	private inventoryRepository: InventoryRepository;
	private stockMovementsRepository: StockMovementsRepository;

	constructor() {
		this.inventoryRepository = new InventoryRepository();
		this.stockMovementsRepository = new StockMovementsRepository();
	}

	async getAllItems(search?: string, type?: string, categoryId?: string, page = 1, limit = 20) {
		const offset = (page - 1) * limit;
		return await this.inventoryRepository.findAll(search, type, categoryId, true, limit, offset);
	}

	async getItemById(id: string) {
		return await this.inventoryRepository.findById(id);
	}

	async getItemByCode(code: string): Promise<MedicalInventory | null> {
		return await this.inventoryRepository.findByCode(code);
	}

	async createItem(data: Omit<NewMedicalInventory, 'id' | 'createdAt' | 'updatedAt'>): Promise<MedicalInventory> {
		// Validate required fields
		if (!data.name || !data.code || !data.unit) {
			throw new Error('Name, code, and unit are required');
		}

		// Check if code already exists
		const existingItem = await this.inventoryRepository.findByCode(data.code);
		if (existingItem) {
			throw new Error('Item code already exists');
		}

		// Validate stock levels
		if (typeof data.stock === 'number' && data.stock < 0) {
			throw new Error('Stock values cannot be negative');
		}
		if (typeof data.minStock === 'number' && data.minStock < 0) {
			throw new Error('Minimum stock cannot be negative');
		}
		if (typeof data.maxStock === 'number' && data.maxStock < 0) {
			throw new Error('Maximum stock cannot be negative');
		}

		// Validate price
		const price = Number(data.price);
		if (price < 0) {
			throw new Error('Price cannot be negative');
		}

		// Validate minStock <= maxStock
		if (typeof data.minStock === 'number' && typeof data.maxStock === 'number' && data.minStock > data.maxStock) {
			throw new Error('Minimum stock cannot be greater than maximum stock');
		}

		// Validate expiry date if provided
		if (data.expiryDate && new Date(data.expiryDate) < new Date()) {
			throw new Error('Expiry date cannot be in the past');
		}

		return await this.inventoryRepository.create(data);
	}

	async updateItem(id: string, data: Partial<NewMedicalInventory>): Promise<MedicalInventory> {
		const existingItem = await this.getItemById(id);
		if (!existingItem) {
			throw new Error('Inventory item not found');
		}

		// If code is being updated, check if it already exists
		if (data.code && data.code !== existingItem.code) {
			const existingCode = await this.inventoryRepository.findByCode(data.code);
			if (existingCode) {
				throw new Error('Item code already exists');
			}
		}

		// Validate stock values
		if (data.stock !== undefined && data.stock < 0) {
			throw new Error('Stock cannot be negative');
		}

		if (data.price !== undefined && Number(data.price) < 0) {
			throw new Error('Price cannot be negative');
		}

		// Validate min/max stock relationship
		const newMinStock = data.minStock ?? existingItem.minStock;
		const newMaxStock = data.maxStock ?? existingItem.maxStock;

		if (newMinStock > newMaxStock) {
			throw new Error('Minimum stock cannot be greater than maximum stock');
		}

		// Validate expiry date
		if (data.expiryDate && new Date(data.expiryDate) < new Date()) {
			throw new Error('Expiry date cannot be in the past');
		}

		return await this.inventoryRepository.update(id, data);
	}

	async deleteItem(id: string): Promise<void> {
		const existingItem = await this.getItemById(id);
		if (!existingItem) {
			throw new Error('Inventory item not found');
		}

		// Soft delete by setting isActive to false
		await this.inventoryRepository.update(id, { isActive: false });
	}

	async getItemCount(search?: string, type?: string, categoryId?: string): Promise<number> {
		return await this.inventoryRepository.count(search, type, categoryId);
	}

	async searchItems(query: string, limit = 10) {
		return await this.inventoryRepository.searchItems(query, limit);
	}

	// Stock management methods
	async addStock(movementData: {
		itemId: string;
		quantity: number;
		reference: string;
		notes?: string;
		createdBy: string;
	}): Promise<StockMovement> {
		const existingItem = await this.getItemById(movementData.itemId);
		if (!existingItem) {
			throw new Error('Item not found');
		}

		if (movementData.quantity <= 0) {
			throw new Error('Quantity must be greater than 0');
		}

		const newStock = existingItem.stock + movementData.quantity;

		// Update max stock if needed
		if (newStock > existingItem.maxStock) {
			await this.updateItem(movementData.itemId, { maxStock: Math.ceil(newStock * 1.2) });
		}

		return await this.inventoryRepository.addStockMovement({
			itemId: movementData.itemId,
			quantity: movementData.quantity,
			reference: movementData.reference,
			notes: movementData.notes,
			createdBy: movementData.createdBy,
			type: 'in'
		});
	}

	async useStock(movementData: {
		itemId: string;
		quantity: number;
		reference: string;
		notes?: string;
		createdBy: string;
	}): Promise<StockMovement> {
		const existingItem = await this.getItemById(movementData.itemId);
		if (!existingItem) {
			throw new Error('Item not found');
		}

		if (movementData.quantity <= 0) {
			throw new Error('Quantity must be greater than 0');
		}

		if (movementData.quantity > existingItem.stock) {
			throw new Error('Insufficient stock available');
		}

		return await this.inventoryRepository.addStockMovement({
			itemId: movementData.itemId,
			quantity: movementData.quantity,
			reference: movementData.reference,
			notes: movementData.notes,
			createdBy: movementData.createdBy,
			type: 'out'
		});
	}

	async adjustStock(movementData: {
		itemId: string;
		newQuantity: number;
		reference: string;
		notes?: string;
		createdBy: string;
	}): Promise<StockMovement> {
		const existingItem = await this.getItemById(movementData.itemId);
		if (!existingItem) {
			throw new Error('Item not found');
		}

		if (movementData.newQuantity < 0) {
			throw new Error('New quantity cannot be negative');
		}

		const difference = movementData.newQuantity - existingItem.stock;

		if (difference === 0) {
			throw new Error('No adjustment needed');
		}

		return await this.inventoryRepository.addStockMovement({
			itemId: movementData.itemId,
			quantity: movementData.newQuantity,
			reference: movementData.reference,
			notes: movementData.notes,
			createdBy: movementData.createdBy,
			type: 'adjust'
		});
	}

	async markAsExpired(movementData: {
		itemId: string;
		quantity: number;
		notes?: string;
		createdBy: string;
	}): Promise<StockMovement> {
		const existingItem = await this.getItemById(movementData.itemId);
		if (!existingItem) {
			throw new Error('Item not found');
		}

		if (movementData.quantity <= 0) {
			throw new Error('Quantity must be greater than 0');
		}

		if (movementData.quantity > existingItem.stock) {
			throw new Error('Quantity cannot exceed available stock');
		}

		return await this.inventoryRepository.addStockMovement({
			itemId: movementData.itemId,
			quantity: movementData.quantity,
			reference: 'EXPIRED',
			notes: movementData.notes,
			createdBy: movementData.createdBy,
			type: 'expired'
		});
	}

	// Inventory management methods
	async getLowStockItems(limit = 50) {
		return await this.inventoryRepository.getLowStockItems(limit);
	}

	async getExpiringItems(daysUntilExpiry = 30, limit = 50) {
		return await this.inventoryRepository.getExpiringItems(daysUntilExpiry, limit);
	}

	async getExpiredItems(limit = 50) {
		return await this.inventoryRepository.getExpiredItems(limit);
	}

	async getStockMovements(itemId: string, limit = 50) {
		return await this.inventoryRepository.getStockMovements(itemId, limit);
	}

	// Dashboard and reporting methods
	async getInventorySummary() {
		const [lowStock, expiring, expired, totalItems] = await Promise.all([
			this.getLowStockItems(10),
			this.getExpiringItems(30, 10),
			this.getExpiredItems(10),
			this.getItemCount()
		]);

		return {
			totalItems,
			lowStockCount: lowStock.length,
			expiringCount: expiring.length,
			expiredCount: expired.length,
			alertItems: {
				lowStock,
				expiring,
				expired
			}
		};
	}

	async getStockMovementHistory(filters?: {
		itemId?: string;
		type?: string;
		dateFrom?: string;
		dateTo?: string;
	}, limit = 50) {
		const offset = 0; // Could add pagination later
		return await this.stockMovementsRepository.findAll(filters?.itemId, filters?.type, limit, offset);
	}
}
