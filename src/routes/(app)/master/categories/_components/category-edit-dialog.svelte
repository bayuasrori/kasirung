<script lang="ts">
  import Dialog from '$lib/components/ui/dialog.svelte';
  import Label from '$lib/components/ui/label.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import Textarea from '$lib/components/ui/textarea.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import type { Category, CategoryFormState } from './types';

  export let open: boolean;
  export let category: Category | null;
  export let formState: CategoryFormState | null;
</script>

{#if category}
  <Dialog bind:open title={`Edit ${category.name}`}>
    <form method="POST" action="?/update" class="space-y-4">
      <input type="hidden" name="id" value={category.id} />
      <div class="space-y-2">
        <Label for="edit-name">Nama Kategori</Label>
        <Input id="edit-name" name="name" value={category.name} required />
        {#if formState?.form === 'update' && formState.errors?.name}
          <p class="text-xs text-red-500">{formState.errors.name[0]}</p>
        {/if}
      </div>
      <div class="space-y-2">
        <Label for="edit-description">Deskripsi</Label>
        <Textarea id="edit-description" name="description" rows={3}>{category.description ?? ''}</Textarea>
      </div>
      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">Perbarui</Button>
    </form>
  </Dialog>
{/if}
