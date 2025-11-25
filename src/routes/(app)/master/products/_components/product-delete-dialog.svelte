<script lang="ts">
  import Dialog from '$lib/components/ui/dialog.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import type { Product, ProductFormState } from './types';

  export let open: boolean;
  export let product: Product | null;
  export let formState: ProductFormState | null;
</script>

{#if product}
  <Dialog
    bind:open
    title="Hapus Produk"
    description={`Anda akan menghapus ${product.name}. Tindakan ini tidak dapat dibatalkan.`}
  >
    <form method="POST" action="?/delete" class="space-y-4">
      <input type="hidden" name="id" value={product.id} />
      {#if formState?.form === 'delete' && formState.errors?.id}
        <p class="text-sm text-red-500">{formState.errors.id[0]}</p>
      {/if}
      <Button type="submit" variant="destructive" className="w-full bg-red-600 hover:bg-red-500">
        Hapus Produk
      </Button>
    </form>
  </Dialog>
{/if}
