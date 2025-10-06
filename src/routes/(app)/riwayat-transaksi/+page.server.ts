import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

import { deleteTransaction, listTransactionHistory } from '$lib/server/services/transactions.service';

const formatDateInput = (date: Date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

export const load: PageServerLoad = async ({ url, locals }) => {
	const searchParam = url.searchParams.get('search')?.trim() ?? '';
	let startDateParam = url.searchParams.get('startDate')?.trim() ?? '';
	let endDateParam = url.searchParams.get('endDate')?.trim() ?? '';
	const pageParam = url.searchParams.get('page');
	const parsedPage = pageParam ? Number.parseInt(pageParam, 10) : 1;
	const page = Number.isNaN(parsedPage) ? 1 : Math.max(parsedPage, 1);
	const shouldDefaultToday = !url.searchParams.has('startDate') && !url.searchParams.has('endDate');

	if (shouldDefaultToday) {
		const todayString = formatDateInput(new Date());
		startDateParam = todayString;
		endDateParam = todayString;
	}

	if (!locals.session) {
		return {
			history: {
				items: [],
				total: 0,
				page: 1,
				pageSize: 15,
				pageCount: 1,
				filters: { search: searchParam, startDate: startDateParam, endDate: endDateParam }
			}
		};
	}

	let history = await listTransactionHistory({
		search: searchParam || undefined,
		startDate: startDateParam || undefined,
		endDate: endDateParam || undefined,
		page,
		pageSize: 15
	});

	if (history.page > history.pageCount) {
		history = await listTransactionHistory({
			search: searchParam || undefined,
			startDate: startDateParam || undefined,
			endDate: endDateParam || undefined,
			page: history.pageCount,
			pageSize: history.pageSize
		});
	}

	return {
		history
	};
};

export const actions: Actions = {
	hapus: async ({ request, locals, url }) => {
		if (!locals.session) {
			return fail(401, { error: 'Anda tidak memiliki akses untuk menghapus transaksi.' });
		}

		const formData = await request.formData();
		const transactionId = formData.get('transactionId');

		if (typeof transactionId !== 'string' || !transactionId.trim()) {
			return fail(400, { error: 'Transaksi tidak valid.' });
		}

		const result = await deleteTransaction(transactionId.trim());

		if (!result.success) {
			return fail(400, { error: result.message });
		}

		throw redirect(303, `${url.pathname}${url.search}`);
	}
};
