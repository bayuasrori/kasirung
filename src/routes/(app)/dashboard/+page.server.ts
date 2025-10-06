import type { PageServerLoad } from './$types';

import { getDashboardSnapshot } from '$lib/server/services/dashboard.service';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.session) {
		return { snapshot: null };
	}

	const snapshot = await getDashboardSnapshot();

	return {
		snapshot
	};
};
