import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

import { listActiveProducts } from '$lib/server/services/products.service';
import { listAllCategories } from '$lib/server/repositories/categories.repository';
import { createPosTransaction } from '$lib/server/services/pos.service';
import { listQuickCustomers } from '$lib/server/services/customers.service';

export const load: PageServerLoad = async ({ url }) => {
	const categoryParam = url.searchParams.get('category');
	const success = url.searchParams.get('success');
	const receipt = url.searchParams.get('receipt');
	let categoryId: number | null | undefined;
	if (!categoryParam) {
		categoryId = undefined;
	} else if (categoryParam === 'uncategorized') {
		categoryId = null;
	} else {
		const parsed = Number(categoryParam);
		categoryId = Number.isNaN(parsed) ? undefined : parsed;
	}

	const [products, categories, customers] = await Promise.all([
		listActiveProducts(categoryId),
		listAllCategories(),
		listQuickCustomers()
	]);

	return {
		products,
		categories,
		customers,
		success,
		receipt,
		filters: { category: categoryParam ?? '' }
	};
};

export const actions: Actions = {
	checkout: async ({ request, locals, url }) => {
		if (!locals.session) {
			return fail(401, { form: 'checkout', errors: { root: ['Tidak memiliki akses'] } });
		}

		const formData = await request.formData();
		const cartRaw = formData.get('cart');
		if (!cartRaw || typeof cartRaw !== 'string') {
			return fail(400, { form: 'checkout', errors: { root: ['Keranjang tidak valid'] } });
		}

		let payload: Record<string, unknown>;
		try {
			payload = JSON.parse(cartRaw);
		} catch (error) {
			return fail(400, { form: 'checkout', errors: { root: ['Data keranjang tidak terbaca'] } });
		}

		const userId = locals.user?.id ?? locals.session.userId;
		if (!userId) {
			return fail(401, { form: 'checkout', errors: { root: ['Sesi tidak valid'] } });
		}
		const result = await createPosTransaction(userId, payload);
		if (!result.success) {
			return fail(400, { form: 'checkout', errors: result.errors });
		}

		const params = new URLSearchParams(url.searchParams);
		params.set('success', result.transactionNumber);
		params.set('receipt', result.transactionId);
		throw redirect(303, `/pos?${params.toString()}`);
	}
};
