import type { PageServerLoad } from './$types';

import { getJournalListing } from '$lib/server/services/accounting.service';

const allowedStatus = new Set(['draft', 'posted', 'void']);

export const load: PageServerLoad = async ({ url }) => {
	const statusParam = url.searchParams.get('status');
	const status =
		statusParam && allowedStatus.has(statusParam)
			? (statusParam as 'draft' | 'posted' | 'void')
			: undefined;
	const from = url.searchParams.get('from') ?? undefined;
	const to = url.searchParams.get('to') ?? undefined;

	const entries = await getJournalListing({ status, from, to });

	return {
		entries,
		filters: {
			status: status ?? '',
			from: from ?? '',
			to: to ?? ''
		}
	};
};
