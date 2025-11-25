<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '$lib/components/ui/button.svelte';
  import Card from '$lib/components/ui/card.svelte';
  import CardHeader from '$lib/components/ui/card-header.svelte';
  import CardTitle from '$lib/components/ui/card-title.svelte';
  import CardContent from '$lib/components/ui/card-content.svelte';
  import { Plus } from 'lucide-svelte';

  const dispatch = createEventDispatcher();
</script>

<Card>
  <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div>
      <CardTitle>Manajemen Produk</CardTitle>
      <p class="text-sm text-slate-500">Kelola daftar produk dan layanan yang tersedia di POS.</p>
    </div>
    <Button on:click={() => dispatch('create')} className="gap-2 bg-blue-600 hover:bg-blue-500">
      <Plus class="h-4 w-4" />
      Produk Baru
    </Button>
  </CardHeader>
  <CardContent>
    <slot />
  </CardContent>
</Card>
