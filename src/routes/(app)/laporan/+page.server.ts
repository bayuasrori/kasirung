import type { PageServerLoad } from './$types';

import { getSalesReport, resolveSalesReportFilters } from '$lib/server/services/reports.service';

export const load: PageServerLoad = async ({ url, locals }) => {
	const filters = resolveSalesReportFilters({
		range: url.searchParams.get('range'),
		startDate: url.searchParams.get('startDate'),
		endDate: url.searchParams.get('endDate')
	});

	const clientFilters = {
		range: filters.range,
		startDateInput: filters.startDateInput,
		endDateInput: filters.endDateInput,
		rangeLabel: filters.rangeLabel,
		days: filters.days,
		options: filters.options
	};

	if (!locals.session) {
		return {
			report: null,
			filters: clientFilters
		};
	}

	const report = await getSalesReport(filters);

	return {
		report,
		filters: clientFilters
	};
};
