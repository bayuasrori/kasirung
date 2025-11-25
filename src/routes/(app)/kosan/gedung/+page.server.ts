import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

import {
	createGedungKosan,
	deleteGedungKosanById,
	listGedungKosan,
	updateGedungKosanById
} from '$lib/server/services/kosan-gedung.service';

function preserveQuery(url: URL) {
	const params = new URLSearchParams(url.searchParams);
	return params.size ? `?${params.toString()}` : '';
}

export const load: PageServerLoad = async () => {
	const gedung = await listGedungKosan();
	return { gedung };
};

export const actions: Actions = {
	create: async ({ request, url }) => {
		const formData = await request.formData();
		const result = await createGedungKosan(Object.fromEntries(formData));
		if (!result.success) {
			return fail(400, { form: 'create', errors: result.errors });
		}
		throw redirect(303, `/kosan/gedung${preserveQuery(url)}`);
	},
	update: async ({ request, url }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		if (!id || typeof id !== 'string') {
			return fail(400, { form: 'update', errors: { id: ['ID tidak valid'] } });
		}
		const result = await updateGedungKosanById(id, Object.fromEntries(formData));
		if (!result.success) {
			if (result.notFound) {
				return fail(404, { form: 'update', errors: { id: ['Gedung tidak ditemukan'] } });
			}
			return fail(400, { form: 'update', errors: result.errors });
		}
		throw redirect(303, `/kosan/gedung${preserveQuery(url)}`);
	},
	delete: async ({ request, url }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		if (!id || typeof id !== 'string') {
			return fail(400, { form: 'delete', errors: { id: ['ID tidak valid'] } });
		}
		const result = await deleteGedungKosanById(id);
		if (!result.success) {
			if (result.notFound) {
				return fail(404, { form: 'delete', errors: { id: ['Gedung tidak ditemukan'] } });
			}
			return fail(409, {
				form: 'delete',
				errors: { root: [result.message ?? 'Tidak dapat menghapus gedung ini'] }
			});
		}
		throw redirect(303, `/kosan/gedung${preserveQuery(url)}`);
	}
};
