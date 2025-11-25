import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { BillingService } from '$lib/server/services/simklinik/billing.service';

export const load = (async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const billingService = new BillingService();
	const search = url.searchParams.get('search') || '';
	const status = url.searchParams.get('status') || '';
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = 20;

	try {
		const [invoices, summary, revenue] = await Promise.all([
			billingService.getInvoices({ page, limit }),
			billingService.getBillingSummary(),
			billingService.getRevenueSummary()
		]);

		return {
			invoices,
			summary,
			revenue,
			search,
			status
		};
	} catch (error) {
		console.error('Error loading invoices:', error);
		return {
			invoices: [],
			summary: {
				totalInvoices: 0,
				paidInvoices: 0,
				unpaidInvoices: 0,
				overdueInvoices: 0,
				paymentRate: 0
			},
			revenue: {
				total: 0,
				paid: 0,
				pending: 0
			},
			search,
			status
		};
	}
}) satisfies PageServerLoad;
