import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NewMedicalInventory } from '$lib/db/schema';
import { InventoryService } from '$lib/server/services/simklinik/inventory.service';

// Mock repositories
vi.mock('$lib/server/repositories/simklinik/inventory.repository');

type InventoryInput = Omit<NewMedicalInventory, 'id' | 'createdAt' | 'updatedAt'>;

describe('InventoryService', () => {
	let service: InventoryService;
	let mockRepository: any;
	let mockStockRepository: any;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new InventoryService();
		
		// Get instances
		mockRepository = vi.mocked(service['inventoryRepository']);
		mockStockRepository = vi.mocked(service['stockMovementsRepository']);
	});

	describe('createItem', () => {
		it('should create inventory item with valid data', async () => {
			const itemData: InventoryInput = {
				name: 'Test Medicine',
				code: 'MED001',
				unit: 'pcs',
				type: 'medicine',
				stock: 100,
				price: '15000',
				minStock: 10,
				maxStock: 500
			};

			const createdItem = {
				id: 'item-1',
				...itemData,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			mockRepository.findByCode.mockResolvedValue(null);
			mockRepository.create.mockResolvedValue(createdItem);

			const result = await service.createItem(itemData);
			expect(result).toEqual(createdItem);
		});

		it('should throw error for missing required fields', async () => {
			const invalidData = {
				name: '',
				code: 'MED001'
				// Missing unit
			};

			await expect(service.createItem(invalidData as any))
				.rejects.toThrow('Name, code, and unit are required');
		});

		it('should throw error for duplicate code', async () => {
			const itemData: InventoryInput = {
				name: 'Test Medicine',
				code: 'MED001',
				unit: 'pcs',
				type: 'medicine',
				price: '1000'
			};

			mockRepository.findByCode.mockResolvedValue({
				id: 'existing-item',
				code: 'MED001',
				name: 'Existing Item'
			});

			await expect(service.createItem(itemData))
				.rejects.toThrow('Item code already exists');
		});

		it('should validate price is not negative', async () => {
			const invalidData = {
				name: 'Test Medicine',
				code: 'MED001',
				unit: 'pcs',
				price: -1000 // Invalid negative price
			};

			await expect(service.createItem(invalidData as any))
				.rejects.toThrow('Price cannot be negative');
		});

		it('should validate minStock vs maxStock', async () => {
			const invalidData = {
				name: 'Test Medicine',
				code: 'MED001',
				unit: 'pcs',
				minStock: 100,
				maxStock: 50 // Min stock greater than max stock
			};

			await expect(service.createItem(invalidData as any))
				.rejects.toThrow('Minimum stock cannot be greater than maximum stock');
		});

		it('should validate future expiry date', async () => {
			const pastDate = new Date();
			pastDate.setDate(pastDate.getDate() - 1);

			const invalidData = {
				name: 'Test Medicine',
				code: 'MED001',
				unit: 'pcs',
				expiryDate: pastDate.toISOString().split('T')[0]
			};

			await expect(service.createItem(invalidData as any))
				.rejects.toThrow('Expiry date cannot be in the past');
		});
	});

	describe('addStock', () => {
		it('should increase stock quantity', async () => {
			const existingItem = {
				id: 'item-1',
				name: 'Test Medicine',
				code: 'MED001',
				stock: 100,
				maxStock: 500
			};

			const stockData = {
				itemId: 'item-1',
				quantity: 50,
				reference: 'PUR-001',
				createdBy: 'user-1'
			};

			const updatedItem = {
				...existingItem,
				stock: 150
			};

			mockRepository.findById.mockResolvedValue(existingItem);
			mockRepository.addStockMovement.mockResolvedValue({
				id: 'movement-1'
			});

			const result = await service.addStock(stockData);
			expect(result).toEqual({ id: 'movement-1' });
		});

		it('should throw error for zero quantity', async () => {
			const stockData = {
				itemId: 'item-1',
				quantity: 0,
				reference: 'test',
				createdBy: 'user-1'
			};

			const existingItem = {
				id: 'item-1',
				stock: 100
			};

			mockRepository.findById.mockResolvedValue(existingItem);

			await expect(service.addStock(stockData))
				.rejects.toThrow('Quantity must be greater than 0');
		});

		it('should increase maxStock when needed', async () => {
			const existingItem = {
				id: 'item-1',
				stock: 480,
				maxStock: 500
			};

			const stockData = {
				itemId: 'item-1',
				quantity: 50, // This would put it at 530, over current max
				reference: 'PUR-001',
				createdBy: 'user-1'
			};

			const updatedItem = {
				...existingItem,
				stock: 530
			};

			mockRepository.findById.mockResolvedValue(existingItem);
			mockRepository.addStockMovement.mockResolvedValue({ id: 'movement-1' });
			mockRepository.update.mockResolvedValue(updatedItem);

			// The service should automatically update maxStock
			expect(mockRepository.update).toHaveBeenCalledWith('item-1', {
				maxStock: Math.ceil(530 * 1.2) // 636 (rounded up)
			});
		});
	});

	describe('useStock', () => {
		it('should decrease stock quantity', async () => {
			const existingItem = {
				id: 'item-1',
				name: 'Test Medicine',
				code: 'MED001',
				stock: 100
			};

			const stockData = {
				itemId: 'item-1',
				quantity: 25,
				reference: 'SALE-001',
				createdBy: 'user-1'
			};

			const result = await service.useStock(stockData);
			const remainingStock = 75;

			mockRepository.findById.mockResolvedValue({
				...existingItem,
				stock: 100 - 25
			});

			expect(result).toBeDefined();
		});

		it('should throw error for insufficient stock', async () => {
			const existingItem = {
				id: 'item-1',
				stock: 20
			};

			const stockData = {
				itemId: 'item-1',
				quantity: 25, // More than available
				reference: 'SALE-001',
				createdBy: 'user-1'
			};

			mockRepository.findById.mockResolvedValue(existingItem);

			await expect(service.useStock(stockData))
				.rejects.toThrow('Insufficient stock available');
		});

		it('should throw error for item not found', async () => {
			const stockData = {
				itemId: 'nonexistent',
				quantity: 10,
				reference: 'SALE-001',
				createdBy: 'user-1'
			};

			mockRepository.findById.mockResolvedValue(null);

			await expect(service.useStock(stockData))
				.rejects.toThrow('Item not found');
		});
	});

	describe('getLowStockItems', () => {
		it('should return items with low stock', async () => {
			const lowStockItems = [
				{ id: 'item-1', name: 'Low Stock Item', stock: 5, minStock: 10 },
				{ id: 'item-2', name: 'Critical Item', stock: 3, minStock: 50 }
			];

			mockRepository.getLowStockItems.mockResolvedValue(lowStockItems);

			const result = await service.getLowStockItems();
			expect(result).toEqual(lowStockItems);
		});

		it('should apply limit parameter', async () => {
			const lowStockItems = Array.from({ length: 20 }, (_, i) => ({
				id: `item-${i + 1}`,
				name: `Item ${i + 1}`,
				stock: 5,
				minStock: 10
			}));

			mockRepository.getLowStockItems.mockResolvedValue(lowStockItems);

			const result = await service.getLowStockItems(10);
			expect(result).toHaveLength(10);
		});
	});

	describe('getExpiringItems', () => {
		it('should return items expiring soon', async () => {
			const today = new Date();
			const expiryDate = new Date();
			expiryDate.setDate(today.getDate() + 15);

			const expiringItem = {
				id: 'item-1',
				name: 'Expiring Medicine',
				expiryDate: expiryDate.toISOString().split('T')[0]
			};

			mockRepository.getExpiringItems.mockResolvedValue([expiringItem]);

			const result = await service.getExpiringItems(30);
			expect(result).toHaveLength(1);
			expect(result[0].expiryDate).toBe(expiryDate.toISOString().split('T')[0]);
		});

		it('should apply daysUntilExpiry parameter', async () => {
			const today = new Date();
			const longTermExpiryDate = new Date();
			longTermExpiryDate.setDate(today.getDate() + 90);

			const expiringItem = {
				id: 'item-1',
				expiryDate: longTermExpiryDate.toISOString().split('T')[0]
			};

			mockRepository.getExpiringItems.mockResolvedValue([expiringItem]);

			const result = await service.getExpiringItems(90);
			expect(result).toHaveLength(1);
		});
	});

	describe('getExpiredItems', () => {
		it('should return already expired items', async () => {
			const yesterday = new Date();
			const expiredDate = yesterday.toISOString().split('T')[0];

			const expiredItem = {
				id: 'item-1',
				name: 'Expired Medicine',
				expiryDate: expiredDate
			};

			mockRepository.getExpiredItems.mockResolvedValue([expiredItem]);

			const result = await service.getExpiredItems();
			expect(result).toHaveLength(1);
			expect(result[0].expiryDate).toBe(expiredDate);
		});
	});

	describe('getInventorySummary', () => {
		it('should return inventory summary with alerts', async () => {
			const lowStockCount = 3;
			const expiringCount = 2;
			const expiredCount = 1;
			const totalAlerts = lowStockCount + expiringCount + expiredCount;

			const lowStockItems = Array.from({ length: lowStockCount }, (_, i) => ({
				id: `low-${i}`,
				name: `Low Stock ${i + 1}`
			}));
			const expiringItems = Array.from({ length: expiringCount }, (_, i) => ({
				id: `expiring-${i}`,
				name: `Expiring ${i + 1}`
			}));
			const expiredItems = Array.from({ length: expiredCount }, (_, i) => ({
				id: `expired-${i}`,
				name: `Expired ${i + 1}`
			}));

			mockRepository.getLowStockItems.mockResolvedValue(lowStockItems);
			mockRepository.getExpiringItems.mockResolvedValue(expiringItems);
			mockRepository.getExpiredItems.mockResolvedValue(expiredItems);

			const result = await service.getInventorySummary();

			expect(result.lowStockCount).toBe(lowStockCount);
			expect(result.expiringCount).toBe(expiringCount);
			expect(result.expiredCount).toBe(expiredCount);
			expect(result.alertItems.lowStock).toEqual(lowStockItems);
			expect(result.alertItems.expiring).toEqual(expiringItems);
			expect(result.alertItems.expired).toEqual(expiredItems);
		});
	});

	describe('searchItems', () => {
		it('should search items by query', async () => {
			const searchResults = [
				{ id: 'item-1', name: 'Paracetamol' },
				{ id: 'item-2', name: 'Ibuprofen' }
			];

			mockRepository.findAll.mockResolvedValue(searchResults);

			const result = await service.searchItems('para');
			expect(result).toEqual(searchResults);
		});

		it('should apply limit parameter', async () => {
			const searchResults = Array.from({ length: 5 }, (_, i) => ({
				id: `item-${i + 1}`,
				name: `Search Result ${i + 1}`
			}));

			mockRepository.findAll.mockResolvedValue(searchResults);

			const result = await service.searchItems('test', 3);
			expect(result).toHaveLength(3);
		});
	});

	describe('edge cases', () => {
		it('should handle very large quantities', async () => {
			const itemData: InventoryInput = {
				name: 'Large Stock Item',
				code: 'LARGE001',
				unit: 'pcs',
				stock: 999999,
				price: '5000',
				type: 'medicine',
				minStock: 0,
				maxStock: 1000000
			};

			const createdItem = {
				id: 'item-1',
				...itemData,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			mockRepository.findByCode.mockResolvedValue(null);
			mockRepository.create.mockResolvedValue(createdItem);

			const result = await service.createItem(itemData);
			expect(result.stock).toBe(999999);
		});

		it('should handle special characters in names', async () => {
			const itemData: InventoryInput = {
				name: 'Medicine with Special-Name & Characters',
				code: 'SPECIAL001',
				unit: 'pcs',
				description: 'Special medication for testing',
				type: 'medicine',
				price: '1000'
			};

			const createdItem = {
				id: 'item-1',
				...itemData
			};

			mockRepository.findByCode.mockResolvedValue(null);
			mockRepository.create.mockResolvedValue(createdItem);

			const result = await service.createItem(itemData);
			expect(result.name).toBe('Medicine with Special-Name & Characters');
		});
	});
});
