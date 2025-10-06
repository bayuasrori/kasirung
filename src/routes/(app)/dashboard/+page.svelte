<script lang="ts">
	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import CardDescription from '$lib/components/ui/card-description.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import SalesLineChart from '$lib/components/charts/sales-line-chart.svelte';
	import { Receipt, Wallet, TrendingUp, ShoppingBag, ArrowUpRight, Boxes } from 'lucide-svelte';

	export let data: {
		snapshot: {
			today: { count: number; total: number };
			sales: Array<{ date: string; count: number; total: number }>;
			recent: Array<{ id: string; number: string; total: string; createdAt: Date; cashier: string | null; customer: string | null }>;
			topProducts: Array<{ productId: string; name: string; quantity: number }>;
		} | null;
	};

	const snapshot = data.snapshot;

	const formatCurrency = (value: number | string) =>
		`Rp ${Number(value ?? 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;

	const chartLabels = snapshot?.sales.map((item) => item.date.slice(5)) ?? [];
	const chartTotals = snapshot?.sales.map((item) => item.total ?? 0) ?? [];
</script>

<div class="space-y-8">
	<section class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
		<Card className="border-blue-100">
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Transaksi Hari Ini</CardTitle>
					<CardDescription>Jumlah transaksi yang tercatat hari ini.</CardDescription>
				</div>
				<div class="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
					<Receipt class="h-5 w-5" />
				</div>
			</CardHeader>
			<CardContent>
				<p class="text-3xl font-semibold text-slate-900">{snapshot ? snapshot.today.count : 0}</p>
				<Badge variant="muted" className="mt-3">Kasir aktif</Badge>
			</CardContent>
		</Card>

		<Card className="border-emerald-100">
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Total Penjualan</CardTitle>
					<CardDescription>Nilai penjualan bruto hari ini.</CardDescription>
				</div>
				<div class="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
					<Wallet class="h-5 w-5" />
				</div>
			</CardHeader>
			<CardContent>
				<p class="text-3xl font-semibold text-slate-900">{formatCurrency(snapshot ? snapshot.today.total : 0)}</p>
				<p class="mt-3 text-xs text-slate-500">Sudah termasuk pajak dan biaya layanan.</p>
			</CardContent>
		</Card>

		<Card className="border-violet-100">
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Produk Terlaris</CardTitle>
					<CardDescription>Top produk berdasarkan kuantitas terjual.</CardDescription>
				</div>
				<div class="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
					<TrendingUp class="h-5 w-5" />
				</div>
			</CardHeader>
			<CardContent>
				{#if snapshot?.topProducts.length}
					<p class="text-lg font-semibold text-slate-900">{snapshot.topProducts[0].name}</p>
					<p class="text-sm text-slate-500">Terjual {snapshot.topProducts[0].quantity} item</p>
				{:else}
					<p class="text-sm text-slate-500">Belum ada data produk.</p>
				{/if}
			</CardContent>
		</Card>

		<Card className="border-amber-100">
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Keranjang Aktif</CardTitle>
					<CardDescription>Pantau aktivitas kasir secara real-time.</CardDescription>
				</div>
				<div class="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
					<ShoppingBag class="h-5 w-5" />
				</div>
			</CardHeader>
			<CardContent>
				<p class="text-3xl font-semibold text-slate-900">{snapshot ? snapshot.recent.length : 0}</p>
				<p class="mt-3 text-xs text-slate-500">Transaksi terakhir dalam antrean.</p>
			</CardContent>
		</Card>
	</section>

	<section class="grid gap-6 lg:grid-cols-3">
		<Card className="lg:col-span-2">
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Tren Penjualan 7 Hari</CardTitle>
					<CardDescription>Monitor performa kasir setiap hari.</CardDescription>
				</div>
				<Badge variant="muted" className="gap-1">
					<ArrowUpRight class="h-3.5 w-3.5" />
					Tren Positif
				</Badge>
			</CardHeader>
			<CardContent>
				<SalesLineChart labels={chartLabels} totals={chartTotals} />
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Produk Terlaris</CardTitle>
				<CardDescription>5 produk dengan penjualan tertinggi.</CardDescription>
			</CardHeader>
			<CardContent>
				{#if snapshot?.topProducts.length}
					<ul class="space-y-3">
						{#each snapshot.topProducts as product}
							<li class="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
								<div class="flex items-center gap-3">
									<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
										<Boxes class="h-4 w-4" />
									</div>
									<div>
										<p class="font-medium text-slate-900">{product.name}</p>
										<p class="text-xs text-slate-500">{product.quantity} item terjual</p>
									</div>
								</div>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="text-sm text-slate-500">Belum ada data produk terlaris.</p>
				{/if}
			</CardContent>
		</Card>
	</section>

	<Card>
		<CardHeader>
			<CardTitle>Transaksi Terakhir</CardTitle>
			<CardDescription>Rekap transaksi yang baru saja selesai.</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-slate-200 text-sm">
					<thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
						<tr>
							<th class="px-4 py-3">Nomor</th>
							<th class="px-4 py-3">Kasir</th>
							<th class="px-4 py-3">Pelanggan</th>
							<th class="px-4 py-3 text-right">Total</th>
							<th class="px-4 py-3 text-right">Waktu</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#if snapshot?.recent.length}
							{#each snapshot.recent as row}
								<tr class="hover:bg-slate-50">
									<td class="px-4 py-3 font-medium text-slate-800">{row.number}</td>
									<td class="px-4 py-3 text-slate-600">{row.cashier ?? '-'}</td>
									<td class="px-4 py-3 text-slate-600">{row.customer ?? 'Umum'}</td>
									<td class="px-4 py-3 text-right font-semibold text-slate-900">{formatCurrency(row.total)}</td>
									<td class="px-4 py-3 text-right text-slate-500">{new Date(row.createdAt).toLocaleString('id-ID')}</td>
								</tr>
							{/each}
						{:else}
							<tr>
								<td class="px-4 py-6 text-center text-slate-500" colspan="5">
									Belum ada transaksi yang terekam.
								</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>
		</CardContent>
	</Card>
</div>
