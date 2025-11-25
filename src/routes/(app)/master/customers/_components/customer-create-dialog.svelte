<script lang="ts">
  import Dialog from '$lib/components/ui/dialog.svelte';
  import Label from '$lib/components/ui/label.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import Textarea from '$lib/components/ui/textarea.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import type { CustomerFormState } from './types';

  export let open: boolean;
  export let formState: CustomerFormState | null;
</script>

<Dialog bind:open title="Tambah pelanggan">
  <form method="POST" action="?/create" class="space-y-4">
    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-2">
        <Label for="create-name">Nama</Label>
        <Input id="create-name" name="name" required />
        {#if formState?.form === 'create' && formState.errors?.name}
          <p class="text-xs text-red-500">{formState.errors.name[0]}</p>
        {/if}
      </div>
      <div class="space-y-2">
        <Label for="create-email">Email</Label>
        <Input id="create-email" name="email" type="email" placeholder="contoh@mail.com" />
        {#if formState?.form === 'create' && formState.errors?.email}
          <p class="text-xs text-red-500">{formState.errors.email[0]}</p>
        {/if}
      </div>
    </div>
    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-2">
        <Label for="create-phone">Telepon</Label>
        <Input id="create-phone" name="phone" placeholder="08xxxx" />
      </div>
      <div class="space-y-2">
        <Label for="create-address">Alamat</Label>
        <Input id="create-address" name="address" placeholder="Alamat singkat" />
      </div>
    </div>
    <div class="space-y-2">
      <Label for="create-notes">Catatan</Label>
      <Textarea id="create-notes" name="notes" rows={3} placeholder="Preferensi pelanggan, dll" />
    </div>
    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">Simpan</Button>
  </form>
</Dialog>
