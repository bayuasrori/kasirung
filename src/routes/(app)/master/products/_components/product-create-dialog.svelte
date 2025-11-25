<script lang="ts">
  import Dialog from '$lib/components/ui/dialog.svelte';
  import Label from '$lib/components/ui/label.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import Textarea from '$lib/components/ui/textarea.svelte';
  import Select from '$lib/components/ui/select.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import type { CategoryOption, ProductFormState } from './types';

  export let open: boolean;
  export let categories: CategoryOption[];
  export let formState: ProductFormState | null;
</script>

<Dialog bind:open title="Tambah Produk Baru">
  <form method="POST" action="?/create" class="space-y-4">
    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-2">
        <Label for="create-name">Nama Produk</Label>
        <Input id="create-name" name="name" placeholder="Contoh: Kopi Susu" required />
        {#if formState?.form === 'create' && formState.errors?.name}
          <p class="text-xs text-red-500">{formState.errors.name[0]}</p>
        {/if}
      </div>
      <div class="space-y-2">
        <Label for="create-sku">SKU</Label>
        <Input id="create-sku" name="sku" placeholder="SKU-001" required />
        {#if formState?.form === 'create' && formState.errors?.sku}
          <p class="text-xs text-red-500">{formState.errors.sku[0]}</p>
        {/if}
      </div>
    </div>
    <div class="space-y-2">
      <Label for="create-description">Deskripsi</Label>
      <Textarea id="create-description" name="description" rows={3} placeholder="Catatan tambahan (opsional)" />
    </div>
    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-2">
        <Label for="create-price">Harga</Label>
        <Input id="create-price" name="price" type="number" min="0" step="100" required />
        {#if formState?.form === 'create' && formState.errors?.price}
          <p class="text-xs text-red-500">{formState.errors.price[0]}</p>
        {/if}
      </div>
      <div class="space-y-2">
        <Label for="create-category">Kategori</Label>
        <Select id="create-category" name="categoryId">
          <option value="">Tanpa kategori</option>
          {#each categories as category (category.id)}
            <option value={category.id}>{category.name}</option>
          {/each}
        </Select>
      </div>
    </div>
    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">Simpan Produk</Button>
  </form>
</Dialog>
