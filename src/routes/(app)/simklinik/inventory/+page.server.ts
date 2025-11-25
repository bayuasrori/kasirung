import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { InventoryService } from '$lib/server/services/simklinik/inventory.service';

export const load = (async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const inventoryService = new InventoryService();
	const search = url.searchParams.get('search') || '';
	const type = url.searchParams.get('type') || '';
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = 20;

	try {
		const [items, summary] = await Promise.all([
			inventoryService.getAllItems(search, type, undefined, page, limit),
			inventoryService.getInventorySummary()
		]);

		return {
			items,
			summary,
			alerts: summary.alertItems,
			search,
			type
		};
	} catch (error) {
		console.error('Error loading inventory:', error);
		return {
			items: [],
			summary: {
				totalItems: 0,
				lowStockCount: 0,
				expiringCount: 0,
				expiredCount: 0
			},
			alerts: {
				lowStock: [],
				expiring: [],
				expired: []
			},
			search,
			type
		};
	}
}) satisfies PageServerLoad;
