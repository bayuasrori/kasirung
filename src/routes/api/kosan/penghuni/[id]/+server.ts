import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import {
	getPenghuniById,
	updatePenghuniById
} from '$lib/server/services/kosan-penghuni.service';

export const GET: RequestHandler = async ({ params }) => {
	const data = await getPenghuniById(params.id);
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

	const result = await updatePenghuniById(params.id, payload as Record<string, unknown>);
	if (!result.success) {
		const status = result.notFound ? 404 : 400;
		return json({ success: false, errors: result.errors }, { status });
	}

	return json({ success: true });
};
