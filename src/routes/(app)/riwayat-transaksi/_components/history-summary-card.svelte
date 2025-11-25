<script lang="ts">
	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import CardDescription from '$lib/components/ui/card-description.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import { History as HistoryIcon } from 'lucide-svelte';
	import type { TransactionHistory } from './types';

	export let history: TransactionHistory;
</script>

<Card>
	<CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex items-center gap-3">
			<div class="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900/5 text-slate-700">
				<HistoryIcon class="h-5 w-5" />
			</div>
			<div>
				<CardTitle>Riwayat Transaksi</CardTitle>
				<CardDescription>Telusuri transaksi yang tercatat pada sistem kasir.</CardDescription>
			</div>
		</div>
		<Badge variant="muted">Total {history.total} transaksi</Badge>
	</CardHeader>
	<CardContent>
		<p class="text-sm text-slate-500">
			Gunakan filter pencarian untuk menemukan transaksi berdasarkan nomor, nama kasir, atau pelanggan.
		</p>
	</CardContent>
</Card>
