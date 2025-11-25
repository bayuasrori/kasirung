import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import { listPenghuniAktifLookup } from '$lib/server/services/kosan-penghuni.service';

export const GET: RequestHandler = async ({ url }) => {
	const search = url.searchParams.get('search') ?? undefined;
	const data = await listPenghuniAktifLookup(search);
	return json({ data });
};
