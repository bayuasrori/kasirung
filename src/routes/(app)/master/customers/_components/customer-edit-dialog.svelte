<script lang="ts">
  import Dialog from '$lib/components/ui/dialog.svelte';
  import Label from '$lib/components/ui/label.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import Textarea from '$lib/components/ui/textarea.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import type { Customer, CustomerFormState } from './types';

  export let open: boolean;
  export let customer: Customer | null;
  export let formState: CustomerFormState | null;
</script>

{#if customer}
  <Dialog bind:open title={`Edit ${customer.name}`}>
    <form method="POST" action="?/update" class="space-y-4">
      <input type="hidden" name="id" value={customer.id} />
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-2">
          <Label for="edit-name">Nama</Label>
          <Input id="edit-name" name="name" value={customer.name} required />
          {#if formState?.form === 'update' && formState.errors?.name}
            <p class="text-xs text-red-500">{formState.errors.name[0]}</p>
          {/if}
        </div>
        <div class="space-y-2">
          <Label for="edit-email">Email</Label>
          <Input id="edit-email" name="email" type="email" value={customer.email ?? ''} />
          {#if formState?.form === 'update' && formState.errors?.email}
            <p class="text-xs text-red-500">{formState.errors.email[0]}</p>
          {/if}
        </div>
      </div>
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-2">
          <Label for="edit-phone">Telepon</Label>
          <Input id="edit-phone" name="phone" value={customer.phone ?? ''} />
        </div>
        <div class="space-y-2">
          <Label for="edit-address">Alamat</Label>
          <Input id="edit-address" name="address" value={customer.address ?? ''} />
        </div>
      </div>
      <div class="space-y-2">
        <Label for="edit-notes">Catatan</Label>
        <Textarea id="edit-notes" name="notes" rows={3}>{customer.notes ?? ''}</Textarea>
      </div>
      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">Perbarui</Button>
    </form>
  </Dialog>
{/if}
