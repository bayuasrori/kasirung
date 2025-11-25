<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '$lib/components/ui/button.svelte';
  import { Plus } from 'lucide-svelte';

  const dispatch = createEventDispatcher();

  const handleCreate = () => dispatch('create');
</script>

<div class="flex flex-wrap items-center justify-between gap-4">
  <div>
    <h1 class="text-xl font-semibold text-slate-900">Kategori Produk</h1>
    <p class="text-sm text-slate-500">Kelompokkan produk berdasarkan kategori untuk laporan yang lebih akurat.</p>
  </div>
  <Button on:click={handleCreate} className="gap-2">
    <Plus class="h-4 w-4" />
    Kategori Baru
  </Button>
</div>
