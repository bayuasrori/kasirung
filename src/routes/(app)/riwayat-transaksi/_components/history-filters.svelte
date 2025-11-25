<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { Search } from 'lucide-svelte';
	import type { TransactionHistoryFilters } from './types';

	export let filters: TransactionHistoryFilters;
	export let hasActiveFilter: boolean;
	export let resetHref: string;
</script>

<form
	method="GET"
	class="grid gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur md:grid-cols-[minmax(200px,_1fr)_200px_200px_auto]"
>
	<div class="space-y-2">
		<Label for="search">Cari Transaksi</Label>
		<div class="relative">
			<Input
				id="search"
				name="search"
				placeholder="Nomor transaksi, kasir, atau pelanggan"
				value={filters.search}
				className="pl-9"
			/>
			<Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
		</div>
	</div>
	<div class="space-y-2">
		<Label for="startDate">Dari Tanggal</Label>
		<Input id="startDate" name="startDate" type="date" value={filters.startDate} />
	</div>
	<div class="space-y-2">
		<Label for="endDate">Sampai Tanggal</Label>
		<Input id="endDate" name="endDate" type="date" value={filters.endDate} />
	</div>
	<div class="flex items-end gap-3">
		<Button type="submit" className="gap-2">
			<Search class="h-4 w-4" />
			Cari
		</Button>
		{#if hasActiveFilter}
			<a href={resetHref} class="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
				Reset
			</a>
		{/if}
	</div>
</form>
