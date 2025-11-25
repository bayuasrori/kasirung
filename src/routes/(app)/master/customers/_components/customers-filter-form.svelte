<script lang="ts">
  import Button from '$lib/components/ui/button.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import Label from '$lib/components/ui/label.svelte';
  import { Filter } from 'lucide-svelte';

  export let search: string;
  export let sortBy: string;
  export let sortDir: string;
</script>

<form
  method="GET"
  class="grid gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur md:grid-cols-[320px_180px_160px_auto]"
>
  <div class="space-y-2">
    <Label for="search">Cari pelanggan</Label>
    <Input id="search" name="search" placeholder="Nama, email, atau telepon" bind:value={search} />
  </div>
  <div class="space-y-2">
    <Label for="sortBy">Urutkan</Label>
    <select id="sortBy" name="sortBy" class="h-10 w-full rounded-md border border-slate-200 px-3 text-sm" bind:value={sortBy}>
      <option value="createdAt">Terbaru</option>
      <option value="name">Nama</option>
    </select>
  </div>
  <div class="space-y-2">
    <Label for="sortDir">Arah</Label>
    <select id="sortDir" name="sortDir" class="h-10 w-full rounded-md border border-slate-200 px-3 text-sm" bind:value={sortDir}>
      <option value="desc">Menurun</option>
      <option value="asc">Menaik</option>
    </select>
  </div>
  <div class="flex items-end">
    <Button type="submit" className="w-full gap-2">
      <Filter class="h-4 w-4" />
      Terapkan
    </Button>
  </div>
</form>
