import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

import {
	createCategory,
	deleteCategoryById,
	listCategoriesWithMeta,
	updateCategoryById
} from '$lib/server/services/categories.service';

function preserveQuery(url: URL) {
	const params = new URLSearchParams(url.searchParams);
	return params.size ? `?${params.toString()}` : '';
}

export const load: PageServerLoad = async ({ url }) => {
	const search = url.searchParams.get('search') ?? '';
	const page = Number(url.searchParams.get('page') ?? '1');
	const sortBy = (url.searchParams.get('sortBy') ?? 'createdAt') as 'createdAt' | 'name';
	const sortDir = (url.searchParams.get('sortDir') ?? 'desc') as 'asc' | 'desc';

	const result = await listCategoriesWithMeta({
		search,
		page,
		pageSize: 10,
		sortBy,
		sortDir
	});

	return {
		categories: result.items,
		total: result.total,
		page: result.page,
		pageCount: result.pageCount,
		filters: { search, sortBy, sortDir }
	};
};

export const actions: Actions = {
	create: async ({ request, url }) => {
		const formData = await request.formData();
		const payload = Object.fromEntries(formData);
		const result = await createCategory(payload);
		if (!result.success) {
			return fail(400, { form: 'create', errors: result.errors });
		}
		throw redirect(303, `/master/categories${preserveQuery(url)}`);
	},
	update: async ({ request, url }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		if (!id || typeof id !== 'string') {
			return fail(400, { form: 'update', errors: { id: ['ID tidak valid'] } });
		}
		const result = await updateCategoryById(Number(id), Object.fromEntries(formData));
		if (!result.success) {
			if (result.notFound) {
				return fail(404, { form: 'update', errors: { id: ['Kategori tidak ditemukan'] } });
			}
			return fail(400, { form: 'update', errors: result.errors });
		}
		throw redirect(303, `/master/categories${preserveQuery(url)}`);
	},
	delete: async ({ request, url }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		if (!id || typeof id !== 'string') {
			return fail(400, { form: 'delete', errors: { id: ['ID tidak valid'] } });
		}
		const result = await deleteCategoryById(Number(id));
		if (!result.success) {
			return fail(404, { form: 'delete', errors: { id: ['Kategori tidak ditemukan'] } });
		}
		throw redirect(303, `/master/categories${preserveQuery(url)}`);
	}
};
