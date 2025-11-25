import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ReportsService } from '$lib/server/services/simklinik/reports.service';

export const load = (async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const reportsService = new ReportsService();
	const dateFrom = url.searchParams.get('from') 
		? new Date(url.searchParams.get('from')!).toISOString().split('T')[0]
		: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
	const dateTo = url.searchParams.get('to')
		? new Date(url.searchParams.get('to')!).toISOString().split('T')[0]
		: new Date().toISOString().split('T')[0];

	try {
		const summary = await reportsService.getDashboardSummary(dateFrom, dateTo);

		return {
			summary,
			defaultDateRange: {
				from: dateFrom,
				to: dateTo
			}
		};
	} catch (error) {
		console.error('Error loading reports dashboard:', error);
		return {
			summary: {
				clinical: {
					totalVisits: 0,
					totalPatients: 0,
					visitsGrowth: 0
				},
				financial: {
					totalRevenue: 0,
					revenueGrowth: 0,
					paymentRate: 0
				},
				inventory: {
					lowStockCount: 0,
					expiringCount: 0,
					expiredCount: 0,
					totalAlerts: 0
				},
				staff: [],
				services: []
			},
			defaultDateRange: {
				from: dateFrom,
				to: dateTo
			}
		};
	}
}) satisfies PageServerLoad;
