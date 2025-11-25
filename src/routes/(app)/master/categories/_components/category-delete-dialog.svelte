<script lang="ts">
  import Dialog from '$lib/components/ui/dialog.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import type { Category } from './types';

  export let open: boolean;
  export let category: Category | null;
</script>

{#if category}
  <Dialog
    bind:open
    title="Hapus kategori"
    description={`Kategori ${category.name} akan dihapus dari sistem.`}
  >
    <form method="POST" action="?/delete" class="space-y-4">
      <input type="hidden" name="id" value={category.id} />
      <Button type="submit" variant="destructive" className="w-full bg-red-600 hover:bg-red-500">
        Hapus
      </Button>
    </form>
  </Dialog>
{/if}
