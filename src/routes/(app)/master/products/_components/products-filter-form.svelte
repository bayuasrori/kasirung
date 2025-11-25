<script lang="ts">
  import Button from '$lib/components/ui/button.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import Label from '$lib/components/ui/label.svelte';
  import Select from '$lib/components/ui/select.svelte';
  import { Filter, PackageSearch } from 'lucide-svelte';
  import type { CategoryOption, ProductFilters } from './types';

  export let filters: ProductFilters;
  export let categories: CategoryOption[];
</script>

<form
  method="GET"
  class="grid gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur md:grid-cols-[300px_200px_auto_120px]"
>
  <div class="space-y-2">
    <Label for="search">Cari Produk</Label>
    <div class="relative">
      <Input id="search" name="search" placeholder="Nama atau SKU" value={filters.search} className="pl-9" />
      <PackageSearch class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  </div>
  <div class="space-y-2">
    <Label for="category">Kategori</Label>
    <Select id="category" name="category" value={filters.categoryId}>
      <option value="">Semua kategori</option>
      {#each categories as category (category.id)}
        <option value={category.id}>{category.name}</option>
      {/each}
    </Select>
  </div>
  <div class="space-y-2">
    <Label for="sortBy">Urutkan</Label>
    <Select id="sortBy" name="sortBy" value={filters.sortBy}>
      <option value="createdAt">Terbaru</option>
      <option value="name">Nama</option>
      <option value="price">Harga</option>
    </Select>
  </div>
  <div class="space-y-2">
    <Label for="sortDir">Arah</Label>
    <Select id="sortDir" name="sortDir" value={filters.sortDir}>
      <option value="desc">Menurun</option>
      <option value="asc">Menaik</option>
    </Select>
  </div>
  <div class="flex items-end">
    <Button type="submit" className="w-full gap-2">
      <Filter class="h-4 w-4" />
      Terapkan
    </Button>
  </div>
</form>
