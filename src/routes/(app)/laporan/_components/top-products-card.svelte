<script lang="ts">
  import Card from '$lib/components/ui/card.svelte';
  import CardHeader from '$lib/components/ui/card-header.svelte';
  import CardTitle from '$lib/components/ui/card-title.svelte';
  import CardContent from '$lib/components/ui/card-content.svelte';
  import { formatCurrency, formatNumber } from './helpers';
  import type { ProductSummary } from './types';

  export let products: ProductSummary[];
</script>

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
        {#if products.length === 0}
          <tr>
            <td colspan="3" class="px-3 py-6 text-center text-xs text-slate-500">Belum ada data produk pada periode ini.</td>
          </tr>
        {:else}
          {#each products as product (product.productId)}
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
