<script lang="ts">
  import Dialog from '$lib/components/ui/dialog.svelte';
  import Label from '$lib/components/ui/label.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import Textarea from '$lib/components/ui/textarea.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import type { FormState, MenuSection } from './types';
  import type { MenuKey } from '$lib/navigation/menus';

  export let open: boolean;
  export let menuSections: MenuSection[];
  export let formState: FormState | null;
  export let defaultPermissions: MenuKey[];
</script>

<Dialog bind:open title="Role baru">
  <form method="POST" action="?/create" class="space-y-4">
    <div class="space-y-2">
      <Label for="create-name">Nama role</Label>
      <Input id="create-name" name="name" required />
      {#if formState?.form === 'create' && formState.errors?.name}
        <p class="text-xs text-red-500">{formState.errors.name[0]}</p>
      {/if}
    </div>
    <div class="space-y-2">
      <Label for="create-description">Deskripsi</Label>
      <Textarea id="create-description" name="description" rows={3} placeholder="Tanggung jawab role (opsional)" />
      {#if formState?.form === 'create' && formState.errors?.description}
        <p class="text-xs text-red-500">{formState.errors.description[0]}</p>
      {/if}
    </div>
    <div class="space-y-3">
      <p class="text-sm font-medium text-slate-700">Akses Menu</p>
      {#each menuSections as section (section.label)}
        <div class="rounded-xl border border-slate-200 bg-slate-50/40 p-3">
          <p class="text-xs font-semibold tracking-wide text-slate-400 uppercase">{section.label}</p>
          <div class="mt-2 flex flex-wrap gap-3">
            {#each section.items as item (item.key)}
              <label class="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  name="permissions"
                  value={item.key}
                  class="rounded border-slate-300"
                  checked={defaultPermissions.includes(item.key)}
                />
                <span>{item.label}</span>
              </label>
            {/each}
          </div>
        </div>
      {/each}
      {#if formState?.form === 'create' && formState.errors?.permissions}
        <p class="text-xs text-red-500">{formState.errors.permissions[0]}</p>
      {/if}
    </div>
    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">Simpan</Button>
  </form>
</Dialog>
