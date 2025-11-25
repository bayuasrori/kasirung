import type { PageServerLoad } from './$types';

import { getAccountingOverview } from '$lib/server/services/accounting.service';

export const load: PageServerLoad = async () => {
	const overview = await getAccountingOverview();

	return {
		overview
	};
};
