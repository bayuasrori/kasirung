import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import {
	createRuanganKosan,
	listRuanganKosanWithGedung,
	listRuanganKosong
} from '$lib/server/services/kosan-ruangan.service';

export const GET: RequestHandler = async ({ url }) => {
	const kondisi = url.searchParams.get('kondisi');
	const gedungId = url.searchParams.get('gedungId');

	if (kondisi === 'kosong') {
		const data = await listRuanganKosong(gedungId);
		return json({ data });
	}

	const statusParam = url.searchParams.get('status');
	const status = statusParam === 'kosong' || statusParam === 'terisi' ? statusParam : undefined;
	const data = await listRuanganKosanWithGedung({ gedungId: gedungId ?? undefined, status });
	return json({ data });
};

export const POST: RequestHandler = async ({ request }) => {
	const payload = await request.json().catch(() => null);
	if (!payload || typeof payload !== 'object') {
		return json({ success: false, message: 'Payload tidak valid' }, { status: 400 });
	}

	const result = await createRuanganKosan(payload as Record<string, unknown>);
	if (!result.success) {
		return json({ success: false, errors: result.errors }, { status: 400 });
	}

	return json({ success: true }, { status: 201 });
};
