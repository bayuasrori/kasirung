<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '$lib/components/ui/button.svelte';
  import Badge from '$lib/components/ui/badge.svelte';
  import { Pencil, Trash2 } from 'lucide-svelte';
  import type { Category } from './types';

  export let categories: Category[];

  const dispatch = createEventDispatcher<{ edit: Category; delete: Category }>();

  const handleEdit = (category: Category) => dispatch('edit', category);
  const handleDelete = (category: Category) => dispatch('delete', category);
</script>

<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
  <table class="min-w-full divide-y divide-slate-200 text-sm">
    <thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      <tr>
        <th class="px-4 py-3">Kategori</th>
        <th class="px-4 py-3 text-center">Produk</th>
        <th class="px-4 py-3 text-right">Aksi</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-slate-100">
      {#if categories.length}
        {#each categories as category (category.id)}
          <tr class="hover:bg-blue-50/40">
            <td class="px-4 py-3">
              <p class="font-medium text-slate-900">{category.name}</p>
              {#if category.description}
                <p class="text-xs text-slate-500">{category.description}</p>
              {/if}
            </td>
            <td class="px-4 py-3 text-center">
              <Badge variant="muted">{category.productCount} produk</Badge>
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex justify-end gap-2">
                <Button variant="ghost" size="sm" className="text-blue-600" on:click={() => handleEdit(category)}>
                  <Pencil class="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-500" on:click={() => handleDelete(category)}>
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            </td>
          </tr>
        {/each}
      {:else}
        <tr>
          <td colspan="3" class="px-4 py-8 text-center text-sm text-slate-500">Belum ada kategori.</td>
        </tr>
      {/if}
    </tbody>
  </table>
</div>
