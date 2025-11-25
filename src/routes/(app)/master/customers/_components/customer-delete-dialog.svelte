<script lang="ts">
  import Dialog from '$lib/components/ui/dialog.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import type { Customer } from './types';

  export let open: boolean;
  export let customer: Customer | null;
</script>

{#if customer}
  <Dialog bind:open title="Hapus pelanggan" description={`Data ${customer.name} akan dihapus permanen.`}>
    <form method="POST" action="?/delete" class="space-y-4">
      <input type="hidden" name="id" value={customer.id} />
      <Button type="submit" variant="destructive" className="w-full bg-red-600 hover:bg-red-500">
        Hapus
      </Button>
    </form>
  </Dialog>
{/if}
