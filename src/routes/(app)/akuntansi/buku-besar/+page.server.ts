import type { PageServerLoad } from './$types';

import { getChartOfAccounts, getGeneralLedger } from '$lib/server/services/accounting.service';

export const load: PageServerLoad = async ({ url }) => {
	const accountId = url.searchParams.get('accountId') ?? undefined;
	const from = url.searchParams.get('from') ?? undefined;
	const to = url.searchParams.get('to') ?? undefined;

	const accountsData = await getChartOfAccounts();
	const ledger = await getGeneralLedger({ accountId, from, to });

	return {
		accounts: accountsData.items,
		ledger,
		filters: {
			accountId: accountId ?? '',
			from: from ?? '',
			to: to ?? ''
		}
	};
};
