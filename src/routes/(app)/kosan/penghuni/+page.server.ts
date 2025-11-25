import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

import { keluarkanPenghuni, listPenghuni } from '$lib/server/services/kosan-penghuni.service';

function preserveQuery(url: URL) {
	const params = new URLSearchParams(url.searchParams);
	return params.size ? `?${params.toString()}` : '';
}

export const load: PageServerLoad = async ({ url }) => {
	const statusParam = url.searchParams.get('status');
	const status = statusParam === 'aktif' || statusParam === 'keluar' ? statusParam : undefined;
	const search = url.searchParams.get('search') ?? undefined;

	const penghuni = await listPenghuni({ status, search });

	return {
		penghuni,
		filters: { status: status ?? '', search: search ?? '' }
	};
};

export const actions: Actions = {
	keluar: async ({ request, url }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		if (!id || typeof id !== 'string') {
			return fail(400, { form: 'keluar', errors: { id: ['ID penghuni tidak valid'] } });
		}
		const result = await keluarkanPenghuni(id);
		if (!result.success) {
			if (result.notFound) {
				return fail(404, { form: 'keluar', errors: { root: ['Penghuni tidak ditemukan'] } });
			}
			return fail(400, { form: 'keluar', errors: result.errors });
		}
		throw redirect(303, `/kosan/penghuni${preserveQuery(url)}`);
	}
};
