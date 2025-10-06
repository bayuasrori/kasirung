import {
	getPaymentBreakdownInRange,
	getSalesSummaryInRange,
	getSalesTrendInRange,
	getTopCustomersInRange,
	getTopProductsInRange
} from '$lib/server/repositories/transactions.repository';

const RANGE_OPTIONS = [
	{ value: 'today', label: 'Hari ini' },
	{ value: '7d', label: '7 Hari Terakhir' },
	{ value: '30d', label: '30 Hari Terakhir' },
	{ value: 'custom', label: 'Rentang Kustom' }
] as const;

type RangeValue = (typeof RANGE_OPTIONS)[number]['value'];

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date) {
	const copy = new Date(date);
	copy.setHours(0, 0, 0, 0);
	return copy;
}

function endOfDay(date: Date) {
	const copy = new Date(date);
	copy.setHours(23, 59, 59, 999);
	return copy;
}

function parseDateInput(value?: string | null) {
	if (!value) return undefined;
	const parsed = new Date(value);
	return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function formatDateInput(date: Date) {
	const year = date.getFullYear();
	const month = `${date.getMonth() + 1}`.padStart(2, '0');
	const day = `${date.getDate()}`.padStart(2, '0');
	return `${year}-${month}-${day}`;
}

function formatRangeLabel(startDate: Date, endDate: Date) {
	const formatter = new Intl.DateTimeFormat('id-ID', {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	});
	const startLabel = formatter.format(startDate);
	const endLabel = formatter.format(endDate);
	return startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`;
}

export interface SalesReportFilters {
	range: RangeValue;
	startDate: Date;
	endDate: Date;
	startDateInput: string;
	endDateInput: string;
	rangeLabel: string;
	days: number;
	options: Array<{ value: RangeValue; label: string }>;
}

export function resolveSalesReportFilters(params: {
	range?: string | null;
	startDate?: string | null;
	endDate?: string | null;
}): SalesReportFilters {
	const now = new Date();
	let range: RangeValue = RANGE_OPTIONS.find((option) => option.value === params.range)?.value ?? '7d';
	let startDate: Date;
	let endDate: Date;

	switch (range) {
		case 'today': {
			startDate = startOfDay(now);
			endDate = endOfDay(now);
			break;
		}
		case '30d': {
			endDate = endOfDay(now);
			startDate = startOfDay(new Date(endDate.getTime() - ONE_DAY_MS * 29));
			break;
		}
		case 'custom': {
			const parsedStart = parseDateInput(params.startDate);
			const parsedEnd = parseDateInput(params.endDate);
			if (!parsedStart || !parsedEnd) {
				range = '7d';
				endDate = endOfDay(now);
				startDate = startOfDay(new Date(endDate.getTime() - ONE_DAY_MS * 6));
				break;
			}
			startDate = startOfDay(parsedStart);
			endDate = endOfDay(parsedEnd);
			break;
		}
		case '7d':
		default: {
			endDate = endOfDay(now);
			startDate = startOfDay(new Date(endDate.getTime() - ONE_DAY_MS * 6));
			break;
		}
	}

	if (startDate > endDate) {
		const temp = startDate;
		startDate = startOfDay(endDate);
		endDate = endOfDay(temp);
	}

	const days = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / ONE_DAY_MS) + 1);

	return {
		range,
		startDate,
		endDate,
		startDateInput: formatDateInput(startDate),
		endDateInput: formatDateInput(endDate),
		rangeLabel: formatRangeLabel(startDate, endDate),
		days,
		options: RANGE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))
	};
}

function buildTrendSeries(
	startDate: Date,
	endDate: Date,
	rows: Array<{ date: string; total: number; subtotal: number; tax: number; discount: number; count: number }>
) {
	const map = new Map(rows.map((row) => [row.date, row]));
	const labels: string[] = [];
	const totals: number[] = [];
	const counts: number[] = [];
	const series: Array<{ date: string; label: string; total: number; subtotal: number; tax: number; discount: number; count: number }> = [];

	const labelFormatter = new Intl.DateTimeFormat('id-ID', {
		day: '2-digit',
		month: 'short'
	});

	const cursor = new Date(startDate);
	while (cursor <= endDate) {
		const key = cursor.toISOString().slice(0, 10);
		const match = map.get(key);
		const label = labelFormatter.format(cursor);
		const entry = match
			? {
				date: key,
				label,
				total: match.total,
				subtotal: match.subtotal,
				tax: match.tax,
				discount: match.discount,
				count: match.count
			}
			: { date: key, label, total: 0, subtotal: 0, tax: 0, discount: 0, count: 0 };
		labels.push(label);
		totals.push(entry.total);
		counts.push(entry.count);
		series.push(entry);
		cursor.setDate(cursor.getDate() + 1);
	}

	return { labels, totals, counts, series };
}

function buildPaymentBreakdown(rows: Array<{ method: string; amount: number; count: number }>) {
	const total = rows.reduce((sum, row) => sum + row.amount, 0);
	return rows
		.slice()
		.sort((a, b) => b.amount - a.amount)
		.map((row) => ({
			method: row.method,
			amount: row.amount,
			count: row.count,
			percentage: total > 0 ? (row.amount / total) * 100 : 0
		}));
}

export async function getSalesReport(filters: SalesReportFilters) {
	const [summary, trendRows, paymentRows, topProducts, topCustomers] = await Promise.all([
		getSalesSummaryInRange(filters.startDate, filters.endDate),
		getSalesTrendInRange(filters.startDate, filters.endDate),
		getPaymentBreakdownInRange(filters.startDate, filters.endDate),
		getTopProductsInRange({ startDate: filters.startDate, endDate: filters.endDate, limit: 5 }),
		getTopCustomersInRange({ startDate: filters.startDate, endDate: filters.endDate, limit: 5 })
	]);

	const trend = buildTrendSeries(filters.startDate, filters.endDate, trendRows);
	const payments = buildPaymentBreakdown(paymentRows);

	const netSales = summary.total;
	const grossSales = summary.subtotal;
	const transactionCount = summary.count;
	const averageOrderValue = transactionCount > 0 ? netSales / transactionCount : 0;

	return {
		range: {
			startDate: filters.startDateInput,
			endDate: filters.endDateInput,
			label: filters.rangeLabel,
			days: filters.days
		},
		summary: {
			netSales,
			grossSales,
			totalTax: summary.tax,
			totalDiscount: summary.discount,
			transactionCount,
			averageOrderValue,
			uniqueCustomers: summary.uniqueCustomers
		},
		trend,
		payments,
		topProducts,
		topCustomers
	};
}
