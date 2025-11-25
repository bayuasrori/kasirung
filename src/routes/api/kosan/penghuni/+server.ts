import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import {
	listPenghuni,
	registerPenghuni
} from '$lib/server/services/kosan-penghuni.service';

export const GET: RequestHandler = async ({ url }) => {
	const statusParam = url.searchParams.get('status');
	const status = statusParam === 'aktif' || statusParam === 'keluar' ? statusParam : undefined;
	const search = url.searchParams.get('search') ?? undefined;
	const data = await listPenghuni({ status, search });
	return json({ data });
};

export const POST: RequestHandler = async ({ request }) => {
	const payload = await request.json().catch(() => null);
	if (!payload || typeof payload !== 'object') {
		return json({ success: false, message: 'Payload tidak valid' }, { status: 400 });
	}

	const result = await registerPenghuni(payload as Record<string, unknown>);
	if (!result.success) {
		const status = result.errors ? 400 : 409;
		return json({ success: false, errors: result.errors }, { status });
	}

	return json({ success: true }, { status: 201 });
};
