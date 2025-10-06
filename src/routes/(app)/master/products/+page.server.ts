import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

import {
	createProduct,
	deleteProductById,
	listProductsWithMeta,
	updateProductById
} from '$lib/server/services/products.service';

function preserveQuery(url: URL) {
	const params = new URLSearchParams(url.searchParams);
	return params.size ? `?${params.toString()}` : '';
}

export const load: PageServerLoad = async ({ url }) => {
	const search = url.searchParams.get('search') ?? '';
	const page = Number(url.searchParams.get('page') ?? '1');
	const categoryIdParam = url.searchParams.get('category');
	const sortBy = (url.searchParams.get('sortBy') ?? 'createdAt') as 'createdAt' | 'name' | 'price';
	const sortDir = (url.searchParams.get('sortDir') ?? 'desc') as 'asc' | 'desc';

	const categoryId = categoryIdParam ? Number(categoryIdParam) : undefined;

	const result = await listProductsWithMeta({
		search,
		categoryId: Number.isNaN(categoryId ?? 0) ? undefined : categoryId,
		page,
		pageSize: 10,
		sortBy,
		sortDir
	});

	return {
		products: result.items,
		total: result.total,
		page: result.page,
		pageCount: result.pageCount,
		pageSize: result.pageSize,
		categories: result.categories,
		filters: {
			search,
			categoryId: categoryIdParam ?? '',
			sortBy,
			sortDir
		}
	};
};

export const actions: Actions = {
	create: async ({ request, url }) => {
		const formData = await request.formData();
		const payload = Object.fromEntries(formData);
		const result = await createProduct(payload);
		if (!result.success) {
			return fail(400, { form: 'create', errors: result.errors });
		}
		throw redirect(303, `/master/products${preserveQuery(url)}`);
	},
	update: async ({ request, url }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		if (!id || typeof id !== 'string') {
			return fail(400, { form: 'update', errors: { id: ['ID tidak valid'] } });
		}
		const payload = Object.fromEntries(formData);
		const result = await updateProductById(id, payload);
		if (!result.success) {
			if (result.notFound) {
				return fail(404, { form: 'update', errors: { id: ['Produk tidak ditemukan'] } });
			}
			return fail(400, { form: 'update', errors: result.errors });
		}
		throw redirect(303, `/master/products${preserveQuery(url)}`);
	},
	delete: async ({ request, url }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		if (!id || typeof id !== 'string') {
			return fail(400, { form: 'delete', errors: { id: ['ID tidak valid'] } });
		}
		const result = await deleteProductById(id);
		if (!result.success) {
			if (result.notFound) {
				return fail(404, { form: 'delete', errors: { id: ['Produk tidak ditemukan'] } });
			}
			if (result.inUse) {
				return fail(409, {
					form: 'delete',
					errors: { id: ['Produk tidak dapat dihapus karena masih digunakan di transaksi lain'] }
				});
			}
			return fail(400, {
				form: 'delete',
				errors: { id: ['Gagal menghapus produk'] }
			});
		}
		throw redirect(303, `/master/products${preserveQuery(url)}`);
	}
};
