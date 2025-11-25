<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '$lib/components/ui/button.svelte';
  import Badge from '$lib/components/ui/badge.svelte';
  import { Pencil, Trash2 } from 'lucide-svelte';
  import { formatCurrency } from './helpers';
  import type { Product } from './types';

  export let products: Product[];

  const dispatch = createEventDispatcher<{ edit: Product; delete: Product }>();
</script>

<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-sm">
  <table class="min-w-full divide-y divide-slate-200 text-sm">
    <thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      <tr>
        <th class="px-4 py-3">Produk</th>
        <th class="px-4 py-3">Kategori</th>
        <th class="px-4 py-3 text-right">Harga</th>
        <th class="px-4 py-3 text-center">Status</th>
        <th class="px-4 py-3 text-right">Aksi</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-slate-100 bg-white">
      {#if products.length}
        {#each products as product (product.id)}
          <tr class="hover:bg-blue-50/40">
            <td class="px-4 py-3">
              <p class="font-medium text-slate-900">{product.name}</p>
              <p class="text-xs text-slate-500">SKU: {product.sku}</p>
              {#if product.description}
                <p class="mt-1 truncate text-xs text-slate-400">{product.description}</p>
              {/if}
            </td>
            <td class="px-4 py-3 text-slate-600">{product.categoryName ?? 'Tanpa kategori'}</td>
            <td class="px-4 py-3 text-right font-semibold text-slate-900">{formatCurrency(product.price)}</td>
            <td class="px-4 py-3 text-center">
              <Badge variant={product.isActive ? 'success' : 'muted'}>{product.isActive ? 'Aktif' : 'Arsip'}</Badge>
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600"
                  on:click={() => dispatch('edit', product)}
                >
                  <Pencil class="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500"
                  on:click={() => dispatch('delete', product)}
                >
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            </td>
          </tr>
        {/each}
      {:else}
        <tr>
          <td colspan="5" class="px-4 py-8 text-center text-sm text-slate-500">Belum ada produk yang tersimpan.</td>
        </tr>
      {/if}
    </tbody>
  </table>
</div>
