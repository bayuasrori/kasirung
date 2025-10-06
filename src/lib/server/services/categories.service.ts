import { z } from 'zod';

import {
	deleteCategory,
	findCategories,
	findCategoryById,
	insertCategory,
	updateCategory
} from '$lib/server/repositories/categories.repository';

const categorySchema = z.object({
	name: z.string().min(2, 'Nama kategori minimal 2 karakter'),
	description: z.string().optional()
});

interface ListParams {
	search?: string;
	page?: number;
	pageSize?: number;
	sortBy?: 'createdAt' | 'name';
	sortDir?: 'asc' | 'desc';
}

export async function listCategoriesWithMeta(params: ListParams) {
	const pageSize = params.pageSize ?? 10;
	const page = Math.max(params.page ?? 1, 1);
	const offset = (page - 1) * pageSize;

	const { data, total } = await findCategories({
		search: params.search,
		limit: pageSize,
		offset,
		sortBy: params.sortBy,
		sortDir: params.sortDir
	});

	return {
		items: data,
		total,
		page,
		pageSize,
		pageCount: Math.max(Math.ceil(total / pageSize), 1)
	};
}

export async function createCategory(payload: Record<string, unknown>) {
	const parsed = categorySchema.safeParse(payload);
	if (!parsed.success) {
		return { success: false, errors: parsed.error.flatten().fieldErrors } as const;
	}

	await insertCategory({
		name: parsed.data.name,
		description: parsed.data.description ?? null
	});

	return { success: true } as const;
}

export async function updateCategoryById(id: number, payload: Record<string, unknown>) {
	const parsed = categorySchema.partial().safeParse(payload);
	if (!parsed.success) {
		return { success: false, errors: parsed.error.flatten().fieldErrors } as const;
	}

	const existing = await findCategoryById(id);
	if (!existing) {
		return { success: false, notFound: true } as const;
	}

	await updateCategory(id, {
		name: parsed.data.name ?? existing.name,
		description: parsed.data.description ?? existing.description,
		updatedAt: new Date()
	});

	return { success: true } as const;
}

export async function deleteCategoryById(id: number) {
	const existing = await findCategoryById(id);
	if (!existing) {
		return { success: false, notFound: true } as const;
	}

	await deleteCategory(id);
	return { success: true } as const;
}
