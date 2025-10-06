import { beforeEach, describe, expect, it, vi } from 'vitest';

const productRepoMocks = vi.hoisted(() => ({
	findProducts: vi.fn(),
	insertProduct: vi.fn(),
	updateProduct: vi.fn(),
	deleteProduct: vi.fn(),
	findProductById: vi.fn(),
	findActiveProductsByCategory: vi.fn()
}));

const categoryRepoMocks = vi.hoisted(() => ({
	listAllCategories: vi.fn()
}));

vi.mock('$lib/server/repositories/products.repository', () => productRepoMocks);

const randomUUIDMock = vi.hoisted(() => vi.fn(() => 'test-uuid'));

vi.mock('$lib/server/repositories/categories.repository', () => categoryRepoMocks);

vi.mock('node:crypto', () => ({
	randomUUID: randomUUIDMock
}));

const {
	findProducts: findProductsMock,
	insertProduct: insertProductMock,
	updateProduct: updateProductMock,
	deleteProduct: deleteProductMock,
	findProductById: findProductByIdMock,
	findActiveProductsByCategory: findActiveProductsByCategoryMock
} = productRepoMocks;

const { listAllCategories: listAllCategoriesMock } = categoryRepoMocks;

import {
	createProduct,
	deleteProductById,
	listProductsWithMeta,
	updateProductById
} from './products.service';

describe('products.service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		randomUUIDMock.mockReset();
		randomUUIDMock.mockReturnValue('test-uuid');
		findProductsMock.mockReset();
		insertProductMock.mockReset();
		updateProductMock.mockReset();
		deleteProductMock.mockReset();
		findProductByIdMock.mockReset();
		findActiveProductsByCategoryMock.mockReset();
		listAllCategoriesMock.mockReset();
	});

	describe('listProductsWithMeta', () => {
		it('returns paginated products with categories', async () => {
			const items = [
				{
					id: '1',
					sku: 'SKU-1',
					name: 'Latte',
					description: 'desc',
					price: '12000.00',
					isActive: true,
					categoryId: 3,
					categoryName: 'Coffee',
					createdAt: new Date('2024-01-01T00:00:00Z'),
					updatedAt: new Date('2024-01-02T00:00:00Z')
				}
			];
			const categories = [{ id: 3, name: 'Coffee' }];
			findProductsMock.mockResolvedValue({ data: items, total: 15 });
			listAllCategoriesMock.mockResolvedValue(categories);

			const result = await listProductsWithMeta({
				search: 'latte',
				page: 2,
				pageSize: 5,
				sortBy: 'name',
				sortDir: 'asc'
			});

			expect(findProductsMock).toHaveBeenCalledWith({
				search: 'latte',
				categoryId: undefined,
				limit: 5,
				offset: 5,
				sortBy: 'name',
				sortDir: 'asc'
			});
			expect(result).toEqual({
				items,
				total: 15,
				page: 2,
				pageSize: 5,
				pageCount: 3,
				categories
			});
		});
	});

	describe('createProduct', () => {
		it('normalizes payload and stores product', async () => {
			randomUUIDMock.mockReturnValueOnce('uuid-1');
			insertProductMock.mockResolvedValue({ id: 'uuid-1' });

			const result = await createProduct({
				name: 'Es Teh',
				sku: 'SKU-2',
				description: '',
				price: '1500',
				categoryId: '',
				isActive: 'true'
			});

			expect(result).toEqual({ success: true });
			expect(insertProductMock).toHaveBeenCalledWith({
				id: 'uuid-1',
				name: 'Es Teh',
				sku: 'SKU-2',
				description: null,
				price: '1500.00',
				categoryId: null,
				isActive: true
			});
		});

		it('returns validation errors for invalid payload', async () => {
			const result = await createProduct({
				name: '',
				sku: '',
				price: '-100'
			});

			expect(result.success).toBe(false);
			expect(result).toHaveProperty('errors');
			expect(insertProductMock).not.toHaveBeenCalled();
		});
	});

	describe('updateProductById', () => {
		it('merges updates with existing product', async () => {
			const existingProduct = {
				id: '1',
				sku: 'SKU-1',
				name: 'Latte',
				description: null,
				price: '12000.00',
				categoryId: 3,
				isActive: true
			};
			findProductByIdMock.mockResolvedValue(existingProduct);
			updateProductMock.mockResolvedValue({ id: '1' });

			const result = await updateProductById('1', {
				name: 'Latte Dingin',
				description: 'dingin',
				price: '15000',
				categoryId: '5',
				isActive: 'false'
			});

			expect(result).toEqual({ success: true });
			expect(updateProductMock).toHaveBeenCalledWith(
				'1',
				expect.objectContaining({
					name: 'Latte Dingin',
					sku: 'SKU-1',
					description: 'dingin',
					price: '15000.00',
					categoryId: 5,
					isActive: false,
					updatedAt: expect.any(Date)
				})
			);
		});

		it('returns notFound when product is missing', async () => {
			findProductByIdMock.mockResolvedValue(undefined);

			const result = await updateProductById('missing', { name: 'Baru' });

			expect(result).toEqual({ success: false, notFound: true });
			expect(updateProductMock).not.toHaveBeenCalled();
		});

		it('returns validation errors when payload invalid', async () => {
			const existingProduct = {
				id: '1',
				sku: 'SKU-1',
				name: 'Latte',
				description: null,
				price: '12000.00',
				categoryId: 3,
				isActive: true
			};
			findProductByIdMock.mockResolvedValue(existingProduct);

			const result = await updateProductById('1', { name: '' });

			expect(result.success).toBe(false);
			expect(result).toHaveProperty('errors');
			expect(updateProductMock).not.toHaveBeenCalled();
		});
	});

	describe('deleteProductById', () => {
		it('deletes when product exists', async () => {
			findProductByIdMock.mockResolvedValue({ id: '1' });

			const result = await deleteProductById('1');

			expect(result).toEqual({ success: true });
			expect(deleteProductMock).toHaveBeenCalledWith('1');
		});

		it('returns notFound when missing', async () => {
			findProductByIdMock.mockResolvedValue(undefined);

			const result = await deleteProductById('missing');

			expect(result).toEqual({ success: false, notFound: true });
			expect(deleteProductMock).not.toHaveBeenCalled();
		});
	});
});
