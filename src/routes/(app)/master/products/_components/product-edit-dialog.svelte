<script lang="ts">
  import Dialog from '$lib/components/ui/dialog.svelte';
  import Label from '$lib/components/ui/label.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import Textarea from '$lib/components/ui/textarea.svelte';
  import Select from '$lib/components/ui/select.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import type { CategoryOption, Product, ProductFormState } from './types';

  export let open: boolean;
  export let product: Product | null;
  export let categories: CategoryOption[];
  export let formState: ProductFormState | null;
</script>

{#if product}
  <Dialog bind:open title={`Edit ${product.name}`}>
    <form method="POST" action="?/update" class="space-y-4">
      <input type="hidden" name="id" value={product.id} />
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-2">
          <Label for="edit-name">Nama Produk</Label>
          <Input id="edit-name" name="name" value={product.name} required />
          {#if formState?.form === 'update' && formState.errors?.name}
            <p class="text-xs text-red-500">{formState.errors.name[0]}</p>
          {/if}
        </div>
        <div class="space-y-2">
          <Label for="edit-price">Harga</Label>
          <Input id="edit-price" name="price" type="number" min="0" step="100" value={parseInt(product.price)} />
          {#if formState?.form === 'update' && formState.errors?.price}
            <p class="text-xs text-red-500">{formState.errors.price[0]}</p>
          {/if}
        </div>
      </div>
      <div class="space-y-2">
        <Label for="edit-description">Deskripsi</Label>
        <Textarea id="edit-description" name="description" rows={3}>{product.description ?? ''}</Textarea>
      </div>
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-2">
          <Label for="edit-category">Kategori</Label>
          <Select
            id="edit-category"
            name="categoryId"
            value={product.categoryId !== null && product.categoryId !== undefined ? String(product.categoryId) : ''}
          >
            <option value="">Tanpa kategori</option>
            {#each categories as category (category.id)}
              <option value={category.id}>{category.name}</option>
            {/each}
          </Select>
        </div>
        <div class="space-y-2">
          <Label for="edit-status">Status</Label>
          <Select id="edit-status" name="isActive" value={product.isActive ? 'true' : 'false'}>
            <option value="true">Aktif</option>
            <option value="false">Arsip</option>
          </Select>
        </div>
      </div>
      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">Perbarui Produk</Button>
    </form>
  </Dialog>
{/if}
