import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

import {
	createLedgerAccount,
	deleteLedgerAccount,
	getChartOfAccounts,
	updateLedgerAccount
} from '$lib/server/services/accounting.service';

export const load: PageServerLoad = async ({ url }) => {
	const parentId = url.searchParams.get('parentId') ?? '';
	const chart = await getChartOfAccounts();

	return {
		accounts: chart.items,
		totalsByType: chart.totalsByType,
		parentId,
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const result = await createLedgerAccount(Object.fromEntries(formData) as Record<string, unknown>);
		if (!result.success) {
			return fail(400, { form: 'create', errors: result.errors });
		}
		throw redirect(303, '/akuntansi/akun');
	},
	update: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		if (!id || typeof id !== 'string') {
			return fail(400, { form: 'update', errors: { id: ['ID akun tidak valid'] } });
		}
		const payload = Object.fromEntries(formData) as Record<string, unknown>;
		delete payload.id;
		const result = await updateLedgerAccount(id, payload);
		if (!result.success) {
			if (result.notFound) {
				return fail(404, { form: 'update', errors: { id: ['Akun tidak ditemukan'] } });
			}
			return fail(400, { form: 'update', errors: result.errors });
		}
		throw redirect(303, '/akuntansi/akun');
	},
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		if (!id || typeof id !== 'string') {
			return fail(400, { form: 'delete', errors: { id: ['ID akun tidak valid'] } });
		}
		const result = await deleteLedgerAccount(id);
		if (!result.success) {
			if (result.notFound) {
				return fail(404, { form: 'delete', errors: { id: ['Akun tidak ditemukan'] } });
			}
			return fail(400, { form: 'delete', errors: result.errors });
		}
		throw redirect(303, '/akuntansi/akun');
	}
};
