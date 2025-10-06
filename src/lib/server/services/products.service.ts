import { randomUUID } from 'node:crypto';
import { z } from 'zod';

import {
	deleteProduct,
	findProductById,
	findProducts,
	findActiveProductsByCategory,
	insertProduct,
	updateProduct
} from '$lib/server/repositories/products.repository';
import { listAllCategories } from '$lib/server/repositories/categories.repository';

const booleanInput = z.preprocess((value) => {
	if (typeof value === 'string') {
		const normalized = value.trim().toLowerCase();
		if (normalized === '') return undefined;
		if (normalized === 'true' || normalized === '1' || normalized === 'on') return true;
		if (normalized === 'false' || normalized === '0' || normalized === 'off') return false;
	}
	if (typeof value === 'number') {
		if (value === 1) return true;
		if (value === 0) return false;
	}
	return value;
}, z.boolean());

const productInputSchema = z.object({
	name: z.string().min(2, 'Nama produk minimal 2 karakter'),
	sku: z.string().min(2, 'SKU minimal 2 karakter'),
	description: z.string().optional(),
	price: z.coerce.number().min(0, 'Harga tidak valid'),
	categoryId: z.union([z.literal(''), z.null(), z.coerce.number()]).optional(),
	isActive: booleanInput.optional()
});

function normalizeCategoryId(value: unknown): number | null | undefined {
	if (value === undefined) return undefined;
	if (value === null) return null;
	if (typeof value === 'number') {
		return Number.isNaN(value) ? null : value;
	}
	if (typeof value === 'string') {
		const trimmed = value.trim();
		if (trimmed === '') return null;
		const parsed = Number(trimmed);
		return Number.isNaN(parsed) ? null : parsed;
	}
	return null;
}


function collectDatabaseErrorCodes(error: unknown) {
	const codes = new Set<string>();
	let current: unknown = error;
	while (current && typeof current === 'object') {
		const ref = current as { code?: unknown; cause?: unknown };
		if (typeof ref.code === 'string' || typeof ref.code === 'number') {
			codes.add(String(ref.code));
		}
		current = ref.cause;
	}
	return codes;
}

function mapDatabaseError(error: unknown) {
	const codes = collectDatabaseErrorCodes(error);
	if (codes.has('23505')) {
		return { sku: ['SKU sudah digunakan'] } as Record<string, string[]>;
	}
	if (codes.has('23503')) {
		return { categoryId: ['Kategori tidak valid'] } as Record<string, string[]>;
	}
	return null;
}

interface ListParams {
	search?: string;
	categoryId?: number | null;
	page?: number;
	pageSize?: number;
	sortBy?: 'createdAt' | 'name' | 'price';
	sortDir?: 'asc' | 'desc';
}

export async function listProductsWithMeta(params: ListParams) {
	const pageSize = params.pageSize ?? 10;
	const page = Math.max(params.page ?? 1, 1);
	const offset = (page - 1) * pageSize;

	const { data, total } = await findProducts({
		search: params.search,
		categoryId: params.categoryId ?? undefined,
		limit: pageSize,
		offset,
		sortBy: params.sortBy,
		sortDir: params.sortDir
	});

	const categories = await listAllCategories();

	return {
		items: data,
		total,
		page,
		pageSize,
		pageCount: Math.max(Math.ceil(total / pageSize), 1),
		categories
	};
}

export async function createProduct(payload: Record<string, unknown>) {
	const parsed = productInputSchema.safeParse(payload);
	if (!parsed.success) {
		return { success: false, errors: parsed.error.flatten().fieldErrors } as const;
	}

	const data = parsed.data;
	const categoryId = normalizeCategoryId(data.categoryId) ?? null;

	try {
		await insertProduct({
			id: randomUUID(),
			name: data.name,
			sku: data.sku,
			description:
				data.description !== undefined
					? data.description.trim() === ''
						? null
						: data.description
					: null,
			price: data.price.toFixed(2),
			categoryId,
			isActive: data.isActive ?? true
		});
	} catch (error) {
		const mapped = mapDatabaseError(error);
		if (mapped) {
			return { success: false, errors: mapped } as const;
		}
		throw error;
	}

	return { success: true } as const;
}

export async function updateProductById(id: string, payload: Record<string, unknown>) {
	const parsed = productInputSchema.partial().safeParse(payload);
	if (!parsed.success) {
		return { success: false, errors: parsed.error.flatten().fieldErrors } as const;
	}

	const existing = await findProductById(id);
	if (!existing) {
		return { success: false, notFound: true } as const;
	}

	const data = parsed.data;
	const categoryId = normalizeCategoryId(data.categoryId);

	try {
		await updateProduct(id, {
			name: data.name ?? existing.name,
			sku: existing.sku,
			description:
				data.description !== undefined
					? data.description.trim() === ''
						? null
						: data.description
					: existing.description,
			price: data.price !== undefined ? data.price.toFixed(2) : existing.price,
			categoryId: categoryId === undefined ? existing.categoryId : categoryId,
			isActive: data.isActive ?? existing.isActive,
			updatedAt: new Date()
		});
	} catch (error) {
		const mapped = mapDatabaseError(error);
		if (mapped) {
			return { success: false, errors: mapped } as const;
		}
		throw error;
	}

	return { success: true } as const;
}

export async function deleteProductById(id: string) {
	const existing = await findProductById(id);
	if (!existing) {
		return { success: false, notFound: true } as const;
	}

	try {
		await deleteProduct(id);
	} catch (error) {
		const codes = collectDatabaseErrorCodes(error);
		if (codes.has('23503')) {
			return { success: false, inUse: true } as const;
		}
		return { success: false, unknown: true } as const;
	}
	return { success: true } as const;
}

export async function listActiveProducts(categoryId?: number | null) {
	if (categoryId === undefined) {
		return findActiveProductsByCategory(undefined);
	}
	return findActiveProductsByCategory(categoryId);
}
