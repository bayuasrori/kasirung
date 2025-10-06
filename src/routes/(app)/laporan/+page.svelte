<script lang="ts">
	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import CardDescription from '$lib/components/ui/card-description.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Select from '$lib/components/ui/select.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import SalesLineChart from '$lib/components/charts/sales-line-chart.svelte';
	import { Wallet, BarChart3, Receipt, ShoppingCart, Users, Package, CreditCard } from 'lucide-svelte';

	export let data: {
		report: {
			range: { startDate: string; endDate: string; label: string; days: number };
			summary: {
				netSales: number;
				grossSales: number;
				totalTax: number;
				totalDiscount: number;
				transactionCount: number;
				averageOrderValue: number;
				uniqueCustomers: number;
			};
				trend: {
					labels: string[];
					totals: number[];
					counts: number[];
					series: Array<{
						date: string;
						label: string;
						total: number;
						subtotal: number;
						tax: number;
						discount: number;
						count: number;
					}>;
				};
			payments: Array<{ method: string; amount: number; percentage: number; count: number }>;
			topProducts: Array<{ productId: string; name: string; quantity: number; revenue: number }>;
			topCustomers: Array<{ customerId: string; name: string; total: number; count: number }>;
		} | null;
		filters: {
			range: 'today' | '7d' | '30d' | 'custom';
			startDateInput: string;
			endDateInput: string;
			rangeLabel: string;
			days: number;
			options: Array<{ value: 'today' | '7d' | '30d' | 'custom'; label: string }>;
		};
	};

const methodLabels: Record<string, string> = {
	cash: 'Tunai',
	qris: 'QRIS',
	debit: 'Debit',
	credit: 'Kartu Kredit'
};

const requiresCustomRange = data.filters.range === 'custom';

const formatCurrency = (value: number) => `Rp ${Number(value ?? 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
const formatNumber = (value: number) => Number(value ?? 0).toLocaleString('id-ID');
const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
const formatDateLabel = (value: string) => {
	const date = new Date(value);
	return Number.isNaN(date.getTime())
		? value
		: new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
};

const summaryCards = data.report
	? [
		{
			title: 'Penjualan Bersih',
			description: 'Total transaksi setelah pajak dan diskon.',
			value: formatCurrency(data.report.summary.netSales),
			icon: Wallet,
			accent: 'bg-emerald-100 text-emerald-600'
		},
		{
			title: 'Penjualan Kotor',
			description: 'Nilai sebelum pajak dan diskon.',
			value: formatCurrency(data.report.summary.grossSales),
			icon: BarChart3,
			accent: 'bg-blue-100 text-blue-600'
		},
		{
			title: 'Jumlah Transaksi',
			description: 'Transaksi yang diselesaikan.',
			value: formatNumber(data.report.summary.transactionCount),
			icon: Receipt,
			accent: 'bg-violet-100 text-violet-600'
		},
		{
			title: 'Rata-rata Transaksi',
			description: 'Nilai rata-rata per transaksi.',
			value: formatCurrency(data.report.summary.averageOrderValue),
			icon: ShoppingCart,
			accent: 'bg-amber-100 text-amber-600'
		}
	]
	: [];

const secondaryCards = data.report
	? [
		{
			title: 'Total Pajak',
			value: formatCurrency(data.report.summary.totalTax),
			icon: CreditCard,
			accent: 'bg-sky-100 text-sky-600'
		},
		{
			title: 'Total Diskon',
			value: formatCurrency(data.report.summary.totalDiscount),
			icon: Package,
			accent: 'bg-rose-100 text-rose-600'
		},
		{
			title: 'Pelanggan Unik',
			value: formatNumber(data.report.summary.uniqueCustomers),
			icon: Users,
			accent: 'bg-slate-100 text-slate-600'
		}
	]
	: [];
</script>

<div class="space-y-6">
	<Card className="border-slate-200">
		<CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
			<div>
				<CardTitle>Laporan Penjualan</CardTitle>
				<CardDescription>Pantau kinerja penjualan berdasarkan periode yang dipilih.</CardDescription>
			</div>
			{#if data.report}
				<Badge variant="muted">Periode: {data.report.range.label}</Badge>
			{:else}
				<Badge variant="muted">Periode: {data.filters.rangeLabel}</Badge>
			{/if}
		</CardHeader>
		<CardContent>
			<form method="GET" class="grid gap-4 md:grid-cols-[200px_repeat(2,minmax(0,1fr))] md:items-end">
				<div class="space-y-2">
					<Label for="range">Rentang Waktu</Label>
					<Select id="range" name="range" value={data.filters.range}>
						{#each data.filters.options as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</Select>
				</div>
				{#if requiresCustomRange}
					<div class="space-y-2">
						<Label for="start-date">Tanggal Awal</Label>
						<Input id="start-date" name="startDate" type="date" value={data.filters.startDateInput} required />
					</div>
					<div class="space-y-2">
						<Label for="end-date">Tanggal Akhir</Label>
						<Input id="end-date" name="endDate" type="date" value={data.filters.endDateInput} required />
					</div>
				{:else}
					<input type="hidden" name="startDate" value={data.filters.startDateInput} />
					<input type="hidden" name="endDate" value={data.filters.endDateInput} />
				{/if}
				<div class="flex items-end gap-2">
					<Button type="submit" className="w-full">Terapkan</Button>
					<a
						href="?"
						class="flex h-10 w-full items-center justify-center rounded-md border border-slate-200 text-sm font-medium text-slate-600 transition hover:border-slate-300"
					>
						Reset
					</a>
				</div>
			</form>
		</CardContent>
	</Card>

	{#if !data.report}
		<div class="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
			Masuk untuk melihat laporan penjualan.
		</div>
	{:else}
		<section class="space-y-6">
			<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				{#each summaryCards as card}
					<Card className="border-slate-200">
						<CardHeader className="flex flex-row items-center justify-between">
							<div>
								<CardTitle>{card.title}</CardTitle>
								<CardDescription>{card.description}</CardDescription>
							</div>
							<div class={`flex h-11 w-11 items-center justify-center rounded-xl ${card.accent}`}>
								<svelte:component this={card.icon} class="h-5 w-5" />
							</div>
						</CardHeader>
						<CardContent>
							<p class="text-3xl font-semibold text-slate-900">{card.value}</p>
						</CardContent>
					</Card>
				{/each}
			</div>

			<div class="grid gap-4 md:grid-cols-3">
				{#each secondaryCards as card}
					<Card className="border-slate-200">
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle>{card.title}</CardTitle>
							<div class={`flex h-9 w-9 items-center justify-center rounded-lg ${card.accent}`}>
								<svelte:component this={card.icon} class="h-4 w-4" />
							</div>
						</CardHeader>
						<CardContent>
							<p class="text-2xl font-semibold text-slate-900">{card.value}</p>
						</CardContent>
					</Card>
				{/each}
			</div>

			<div class="grid gap-4 lg:grid-cols-[2fr_1fr]">
				<Card className="border-slate-200">
					<CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
						<div>
							<CardTitle>Tren Penjualan</CardTitle>
							<p class="text-sm text-slate-500">Total penjualan harian selama {data.report.range.days} hari.</p>
						</div>
						<Badge variant="muted">{data.report.range.label}</Badge>
					</CardHeader>
					<CardContent className="pt-4">
						{#if data.report.trend.totals.some((value) => value > 0)}
							<SalesLineChart labels={data.report.trend.labels} totals={data.report.trend.totals} />
						{:else}
							<p class="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
								Belum ada transaksi pada periode ini.
							</p>
						{/if}
					</CardContent>
				</Card>
				<Card className="border-slate-200">
					<CardHeader>
						<CardTitle>Metode Pembayaran</CardTitle>
						<p class="text-sm text-slate-500">Distribusi volume transaksi per metode.</p>
					</CardHeader>
					<CardContent className="space-y-4">
						{#if data.report.payments.length === 0}
							<p class="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">Belum ada data pembayaran.</p>
						{:else}
							<ul class="space-y-4">
								{#each data.report.payments as payment}
									<li class="space-y-1">
										<div class="flex items-center justify-between text-sm font-medium text-slate-700">
											<span>{methodLabels[payment.method] ?? payment.method}</span>
											<span>{formatCurrency(payment.amount)}</span>
										</div>
										<div class="h-2 w-full rounded-full bg-slate-200">
											<div
												class="h-2 rounded-full bg-blue-500"
												style={`width: ${Math.max(4, Math.min(100, Math.round(payment.percentage)))}%`}
											></div>
										</div>
										<p class="text-xs text-slate-500">{formatPercentage(payment.percentage)} &bull; {formatNumber(payment.count)} transaksi</p>
									</li>
								{/each}
							</ul>
						{/if}
					</CardContent>
				</Card>
			</div>

			<div class="grid gap-4 lg:grid-cols-2">
				<Card className="border-slate-200">
					<CardHeader>
						<CardTitle>Produk Terlaris</CardTitle>
						<p class="text-sm text-slate-500">Berdasarkan total penjualan pada periode terpilih.</p>
					</CardHeader>
					<CardContent className="overflow-x-auto">
						<table class="min-w-full text-sm">
							<thead class="text-left text-xs font-semibold uppercase text-slate-400">
								<tr>
									<th class="px-3 py-2">Produk</th>
									<th class="px-3 py-2 text-right">Terjual</th>
									<th class="px-3 py-2 text-right">Pendapatan</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-200">
								{#if data.report.topProducts.length === 0}
									<tr>
										<td colspan="3" class="px-3 py-6 text-center text-xs text-slate-500">Belum ada data produk pada periode ini.</td>
									</tr>
								{:else}
									{#each data.report.topProducts as product}
										<tr>
											<td class="px-3 py-2 font-medium text-slate-700">{product.name}</td>
											<td class="px-3 py-2 text-right">{formatNumber(product.quantity)}</td>
											<td class="px-3 py-2 text-right">{formatCurrency(product.revenue)}</td>
										</tr>
									{/each}
								{/if}
							</tbody>
						</table>
					</CardContent>
				</Card>
				<Card className="border-slate-200">
					<CardHeader>
						<CardTitle>Pelanggan Terbaik</CardTitle>
						<p class="text-sm text-slate-500">Pelanggan dengan nilai transaksi tertinggi.</p>
					</CardHeader>
					<CardContent className="overflow-x-auto">
						<table class="min-w-full text-sm">
							<thead class="text-left text-xs font-semibold uppercase text-slate-400">
								<tr>
									<th class="px-3 py-2">Pelanggan</th>
									<th class="px-3 py-2 text-right">Transaksi</th>
									<th class="px-3 py-2 text-right">Nilai</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-200">
								{#if data.report.topCustomers.length === 0}
									<tr>
										<td colspan="3" class="px-3 py-6 text-center text-xs text-slate-500">Belum ada data pelanggan pada periode ini.</td>
									</tr>
								{:else}
									{#each data.report.topCustomers as customer}
										<tr>
											<td class="px-3 py-2 font-medium text-slate-700">{customer.name}</td>
											<td class="px-3 py-2 text-right">{formatNumber(customer.count)}</td>
											<td class="px-3 py-2 text-right">{formatCurrency(customer.total)}</td>
										</tr>
									{/each}
								{/if}
							</tbody>
						</table>
					</CardContent>
				</Card>
			</div>

			<Card className="border-slate-200">
				<CardHeader>
					<CardTitle>Rincian Harian</CardTitle>
					<p class="text-sm text-slate-500">Ringkasan penjualan per hari pada periode terpilih.</p>
				</CardHeader>
				<CardContent className="overflow-x-auto">
					<table class="min-w-full divide-y divide-slate-200 text-sm">
						<thead class="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
							<tr>
								<th class="px-3 py-2">Tanggal</th>
								<th class="px-3 py-2 text-right">Transaksi</th>
								<th class="px-3 py-2 text-right">Subtotal</th>
								<th class="px-3 py-2 text-right">Diskon</th>
								<th class="px-3 py-2 text-right">Pajak</th>
								<th class="px-3 py-2 text-right">Total</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-100">
							{#if data.report.trend.series.length === 0}
								<tr>
									<td colspan="6" class="px-3 py-6 text-center text-xs text-slate-500">Belum ada transaksi pada periode ini.</td>
								</tr>
							{:else}
								{#each data.report.trend.series as row}
									<tr>
										<td class="px-3 py-2 font-medium text-slate-700">{formatDateLabel(row.date)}</td>
										<td class="px-3 py-2 text-right text-slate-500">{formatNumber(row.count)}</td>
										<td class="px-3 py-2 text-right text-slate-600">{formatCurrency(row.subtotal)}</td>
										<td class="px-3 py-2 text-right text-rose-500">{formatCurrency(row.discount)}</td>
										<td class="px-3 py-2 text-right text-blue-500">{formatCurrency(row.tax)}</td>
										<td class="px-3 py-2 text-right font-semibold text-slate-900">{formatCurrency(row.total)}</td>
									</tr>
								{/each}
							{/if}
						</tbody>
					</table>
				</CardContent>
			</Card>
		</section>
	{/if}
</div>
