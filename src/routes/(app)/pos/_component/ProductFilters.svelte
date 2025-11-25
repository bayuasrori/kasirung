<script lang="ts">
	import { Search } from 'lucide-svelte';

	import Input from '$lib/components/ui/input.svelte';
	import Select from '$lib/components/ui/select.svelte';
	import type { Category } from './types';

	export let search = '';
	export let category = '';
	export let categories: Category[] = [];
</script>

<div class="flex flex-wrap gap-3">
	<div class="relative flex-1 min-w-[220px]">
		<Input placeholder="Cari produk atau SKU" bind:value={search} className="pl-10" />
		<Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
	</div>
	<Select bind:value={category} className="w-48">
		<option value="">Semua kategori</option>
		<option value="uncategorized">Tanpa kategori</option>
		{#each categories as categoryItem (categoryItem.id)}
			<option value={String(categoryItem.id)}>{categoryItem.name}</option>
		{/each}
	</Select>
</div>
