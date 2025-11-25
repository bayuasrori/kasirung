import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

import { listGedungKosan } from '$lib/server/services/kosan-gedung.service';
import {
	createRuanganKosan,
	deleteRuanganKosanById,
	listRuanganKosanWithGedung,
	updateRuanganKosanById
} from '$lib/server/services/kosan-ruangan.service';

function preserveQuery(url: URL) {
	const params = new URLSearchParams(url.searchParams);
	return params.size ? `?${params.toString()}` : '';
}

export const load: PageServerLoad = async ({ url }) => {
	const gedungId = url.searchParams.get('gedungId');
	const statusParam = url.searchParams.get('status');
	const status = statusParam === 'kosong' || statusParam === 'terisi' ? statusParam : undefined;

	const [gedung, ruangan] = await Promise.all([
		listGedungKosan(),
		listRuanganKosanWithGedung({ gedungId: gedungId ?? undefined, status })
	]);

	return {
		ruangan,
		gedung,
		filters: { gedungId: gedungId ?? '', status: status ?? '' }
	};
};

export const actions: Actions = {
	create: async ({ request, url }) => {
		const formData = await request.formData();
		const result = await createRuanganKosan(Object.fromEntries(formData));
		if (!result.success) {
			return fail(400, { form: 'create', errors: result.errors });
		}
		throw redirect(303, `/kosan/ruangan${preserveQuery(url)}`);
	},
	update: async ({ request, url }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		if (!id || typeof id !== 'string') {
			return fail(400, { form: 'update', errors: { id: ['ID tidak valid'] } });
		}
		const result = await updateRuanganKosanById(id, Object.fromEntries(formData));
		if (!result.success) {
			if (result.notFound) {
				return fail(404, { form: 'update', errors: { id: ['Ruangan tidak ditemukan'] } });
			}
			return fail(400, { form: 'update', errors: result.errors });
		}
		throw redirect(303, `/kosan/ruangan${preserveQuery(url)}`);
	},
	delete: async ({ request, url }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		if (!id || typeof id !== 'string') {
			return fail(400, { form: 'delete', errors: { id: ['ID tidak valid'] } });
		}
		const result = await deleteRuanganKosanById(id);
		if (!result.success) {
			if (result.notFound) {
				return fail(404, { form: 'delete', errors: { id: ['Ruangan tidak ditemukan'] } });
			}
			return fail(409, {
				form: 'delete',
				errors: { root: [result.message ?? 'Tidak dapat menghapus ruangan ini'] }
			});
		}
		throw redirect(303, `/kosan/ruangan${preserveQuery(url)}`);
	}
};
