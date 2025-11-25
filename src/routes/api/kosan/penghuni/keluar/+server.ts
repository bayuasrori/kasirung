import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import { keluarkanPenghuni } from '$lib/server/services/kosan-penghuni.service';

export const POST: RequestHandler = async ({ request }) => {
	const payload = await request.json().catch(() => null);
	const id = payload && typeof payload === 'object' ? (payload as Record<string, unknown>).id : null;
	if (!id || typeof id !== 'string') {
		return json({ success: false, message: 'ID penghuni wajib diisi' }, { status: 400 });
	}

	const result = await keluarkanPenghuni(id);
	if (!result.success) {
		if (result.notFound) {
			return json({ success: false, message: 'Penghuni tidak ditemukan' }, { status: 404 });
		}
		return json({ success: false, errors: result.errors }, { status: 400 });
	}

	return json({ success: true });
};
