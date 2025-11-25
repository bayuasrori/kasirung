<script lang="ts">
	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { ShoppingCart } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';

	import type { Product } from './types';

	export let products: Product[] = [];

	const dispatch = createEventDispatcher<{ add: Product }>();
	const formatCurrency = (value: number | string) =>
		`Rp ${Number(value ?? 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
</script>

<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
	{#if products.length}
		{#each products as product (product.id)}
			<Card className="border-slate-200">
				<CardHeader>
					<CardTitle className="text-base">{product.name}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<p class="text-sm text-slate-500">{product.sku ?? 'SKU -'}</p>
					<p class="text-lg font-semibold text-slate-900">{formatCurrency(product.price)}</p>
					<Button className="w-full gap-2" on:click={() => dispatch('add', product)}>
						<ShoppingCart class="h-4 w-4" />
						Tambah
					</Button>
				</CardContent>
			</Card>
		{/each}
	{:else}
		<p class="col-span-full rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
			Tidak ada produk yang cocok dengan pencarian.
		</p>
	{/if}
</div>
