import { getDailySales, getTodaySummary, getTopProducts, listRecentTransactions } from '$lib/server/repositories/transactions.repository';

function fillMissingDays(data: Array<{ date: string; count: number; total: number }>, days = 7) {
	const today = new Date();
	const map = new Map(data.map((item) => [item.date, item]));
	const result: Array<{ date: string; count: number; total: number }> = [];

	for (let i = days - 1; i >= 0; i -= 1) {
		const date = new Date(today);
		date.setDate(today.getDate() - i);
		const formatted = date.toISOString().slice(0, 10);
		const entry = map.get(formatted);
		result.push({
			date: formatted,
			count: entry?.count ?? 0,
			total: entry?.total ?? 0
		});
	}

	return result;
}

export async function getDashboardSnapshot() {
	const days = 7;
	const [today, sales, recent, topProducts] = await Promise.all([
		getTodaySummary(),
		getDailySales(days),
		listRecentTransactions(5),
		getTopProducts(5)
	]);

	return {
		today,
		sales: fillMissingDays(sales, days),
		recent,
		topProducts
	};
}
