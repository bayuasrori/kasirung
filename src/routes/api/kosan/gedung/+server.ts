import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import { createGedungKosan, listGedungKosan } from '$lib/server/services/kosan-gedung.service';

export const GET: RequestHandler = async () => {
	const data = await listGedungKosan();
	return json({ data });
};

export const POST: RequestHandler = async ({ request }) => {
	const payload = await request.json().catch(() => null);
	if (!payload || typeof payload !== 'object') {
		return json({ success: false, message: 'Payload tidak valid' }, { status: 400 });
	}

	const result = await createGedungKosan(payload as Record<string, unknown>);
	if (!result.success) {
		return json({ success: false, errors: result.errors }, { status: 400 });
	}

	return json({ success: true }, { status: 201 });
};
