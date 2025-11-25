<script lang="ts">
	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import CardDescription from '$lib/components/ui/card-description.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import { Receipt, Wallet, TrendingUp, ShoppingBag } from 'lucide-svelte';

	import type { DashboardSnapshot } from './types';

	export let snapshot: DashboardSnapshot | null = null;

	const formatCurrency = (value: number | string) =>
		`Rp ${Number(value ?? 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
</script>

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
			<p class="text-3xl font-semibold text-slate-900">
				{formatCurrency(snapshot ? snapshot.today.total : 0)}
			</p>
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
