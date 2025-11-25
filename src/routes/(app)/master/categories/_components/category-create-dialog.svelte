<script lang="ts">
  import Dialog from '$lib/components/ui/dialog.svelte';
  import Label from '$lib/components/ui/label.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import Textarea from '$lib/components/ui/textarea.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import type { CategoryFormState } from './types';

  export let open: boolean;
  export let formState: CategoryFormState | null;
</script>

<Dialog bind:open title="Tambah kategori">
  <form method="POST" action="?/create" class="space-y-4">
    <div class="space-y-2">
      <Label for="create-name">Nama Kategori</Label>
      <Input id="create-name" name="name" required />
      {#if formState?.form === 'create' && formState.errors?.name}
        <p class="text-xs text-red-500">{formState.errors.name[0]}</p>
      {/if}
    </div>
    <div class="space-y-2">
      <Label for="create-description">Deskripsi</Label>
      <Textarea id="create-description" name="description" placeholder="Catatan (opsional)" rows={3} />
    </div>
    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">Simpan</Button>
  </form>
</Dialog>
