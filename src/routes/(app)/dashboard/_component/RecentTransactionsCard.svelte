<script lang="ts">
	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import CardDescription from '$lib/components/ui/card-description.svelte';

	import type { DashboardSnapshot } from './types';

	export let transactions: DashboardSnapshot['recent'] | undefined;

	const formatCurrency = (value: number | string) =>
		`Rp ${Number(value ?? 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
</script>

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
					{#if transactions && transactions.length}
						{#each transactions as row (row.id)}
							<tr class="hover:bg-slate-50">
								<td class="px-4 py-3 font-medium text-slate-800">{row.number}</td>
								<td class="px-4 py-3 text-slate-600">{row.cashier ?? '-'}</td>
								<td class="px-4 py-3 text-slate-600">{row.customer ?? 'Umum'}</td>
								<td class="px-4 py-3 text-right font-semibold text-slate-900">
									{formatCurrency(row.total)}
								</td>
								<td class="px-4 py-3 text-right text-slate-500">
									{new Date(row.createdAt).toLocaleString('id-ID')}
								</td>
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
