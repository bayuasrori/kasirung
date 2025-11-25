<script lang="ts">
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { Trash2 } from 'lucide-svelte';
	import type { TransactionHistoryItem } from './types';
	import {
		formatCurrency,
		formatDate,
		getStatusLabel,
		getStatusVariant,
		canDeleteTransaction
	} from './utils';

	export let items: TransactionHistoryItem[];
</script>

<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-sm">
	<table class="min-w-full divide-y divide-slate-200 text-sm">
		<thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
			<tr>
				<th class="px-4 py-3">Nomor</th>
				<th class="px-4 py-3">Kasir</th>
				<th class="px-4 py-3">Pelanggan</th>
				<th class="px-4 py-3 text-right">Subtotal</th>
				<th class="px-4 py-3 text-right">Pajak</th>
				<th class="px-4 py-3 text-right">Diskon</th>
				<th class="px-4 py-3 text-right">Total</th>
				<th class="px-4 py-3 text-center">Status</th>
				<th class="px-4 py-3 text-right">Waktu</th>
				<th class="px-4 py-3 text-right">Aksi</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-slate-100 bg-white">
			{#if items.length}
				{#each items as transaction (transaction.id ?? transaction.number)}
					<tr class="hover:bg-blue-50/40">
						<td class="px-4 py-3 font-medium text-slate-900">{transaction.number}</td>
						<td class="px-4 py-3 text-slate-600">{transaction.cashier ?? '-'}</td>
						<td class="px-4 py-3 text-slate-600">{transaction.customer ?? 'Umum'}</td>
						<td class="px-4 py-3 text-right text-slate-600">{formatCurrency(transaction.subtotal)}</td>
						<td class="px-4 py-3 text-right text-slate-600">{formatCurrency(transaction.tax)}</td>
						<td class="px-4 py-3 text-right text-slate-600">{formatCurrency(transaction.discount)}</td>
						<td class="px-4 py-3 text-right font-semibold text-slate-900">{formatCurrency(transaction.total)}</td>
						<td class="px-4 py-3 text-center">
							<Badge variant={getStatusVariant(transaction.status)}>{getStatusLabel(transaction.status)}</Badge>
						</td>
						<td class="px-4 py-3 text-right text-slate-500">{formatDate(transaction.createdAt)}</td>
						<td class="px-4 py-3 text-right">
							{#if canDeleteTransaction(transaction.createdAt)}
								<form method="post" action="?/hapus" class="inline-flex items-center justify-end gap-2">
									<input type="hidden" name="transactionId" value={transaction.id} />
									<Button type="submit" variant="destructive" size="sm" className="gap-2">
										<Trash2 class="h-4 w-4" />
										Hapus
									</Button>
								</form>
							{:else}
								<span class="text-xs text-slate-400">Tidak dapat dihapus</span>
							{/if}
						</td>
					</tr>
				{/each}
			{:else}
				<tr>
					<td class="px-4 py-8 text-center text-sm text-slate-500" colspan="10">
						Belum ada transaksi yang cocok dengan filter.
					</td>
				</tr>
			{/if}
		</tbody>
	</table>
</div>
