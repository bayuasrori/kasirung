import type { KosanDashboardSummary } from '$lib/types/kosan';

export interface DashboardSnapshot {
	today: { count: number; total: number };
	sales: Array<{ date: string; count: number; total: number }>;
	recent: Array<{
		id: string;
		number: string;
		total: string;
		createdAt: Date;
		cashier: string | null;
		customer: string | null;
	}>;
	topProducts: Array<{ productId: string | null; name: string; quantity: number }>;
	kosan?: KosanDashboardSummary;
}
