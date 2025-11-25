import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

import { listGedungKosan } from '$lib/server/services/kosan-gedung.service';
import { listRuanganKosong } from '$lib/server/services/kosan-ruangan.service';
import { createCustomer, listQuickCustomers } from '$lib/server/services/customers.service';
import { registerPenghuni } from '$lib/server/services/kosan-penghuni.service';

export const load: PageServerLoad = async () => {
	const [customers, gedung, ruangan] = await Promise.all([
		listQuickCustomers(),
		listGedungKosan(),
		listRuanganKosong()
	]);

	return {
		customers,
		gedung,
		ruanganKosong: ruangan
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const payload = Object.fromEntries(formData);
		const result = await registerPenghuni(payload);
		if (!result.success) {
			return fail(400, { form: 'register', errors: result.errors });
		}
		throw redirect(303, '/kosan/penghuni?status=aktif');
	},
	createCustomer: async ({ request }) => {
		const formData = await request.formData();
		const payload = Object.fromEntries(formData);
		const result = await createCustomer(payload);
		if (!result.success) {
			return fail(400, { form: 'createCustomer', errors: result.errors });
		}
		throw redirect(303, '/kosan/pendaftaran');
	}
};
