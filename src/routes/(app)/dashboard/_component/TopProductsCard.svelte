<script lang="ts">
	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import CardDescription from '$lib/components/ui/card-description.svelte';
	import { Boxes } from 'lucide-svelte';

	import type { DashboardSnapshot } from './types';

	export let products: DashboardSnapshot['topProducts'] | undefined;
</script>

<Card>
	<CardHeader>
		<CardTitle>Produk Terlaris</CardTitle>
		<CardDescription>5 produk dengan penjualan tertinggi.</CardDescription>
	</CardHeader>
	<CardContent>
		{#if products && products.length}
			<ul class="space-y-3">
				{#each products as product (product.productId ?? product.name)}
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
