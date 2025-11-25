import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import {
	deleteGedungKosanById,
	getGedungKosanById,
	updateGedungKosanById
} from '$lib/server/services/kosan-gedung.service';

export const GET: RequestHandler = async ({ params }) => {
	const data = await getGedungKosanById(params.id);
	if (!data) {
		return json({ success: false, message: 'Data tidak ditemukan' }, { status: 404 });
	}
	return json({ data });
};

export const PATCH: RequestHandler = async ({ params, request }) => {
	const payload = await request.json().catch(() => null);
	if (!payload || typeof payload !== 'object') {
		return json({ success: false, message: 'Payload tidak valid' }, { status: 400 });
	}

	const result = await updateGedungKosanById(params.id, payload as Record<string, unknown>);
	if (!result.success) {
		const status = result.notFound ? 404 : 400;
		return json({ success: false, errors: result.errors }, { status });
	}

	return json({ success: true });
};

export const DELETE: RequestHandler = async ({ params }) => {
	const result = await deleteGedungKosanById(params.id);
	if (!result.success) {
		if (result.notFound) {
			return json({ success: false, message: 'Data tidak ditemukan' }, { status: 404 });
		}
		if (result.notAllowed) {
			return json({ success: false, message: result.message }, { status: 409 });
		}
		return json({ success: false, message: 'Gagal menghapus data' }, { status: 400 });
	}

	return json({ success: true });
};
