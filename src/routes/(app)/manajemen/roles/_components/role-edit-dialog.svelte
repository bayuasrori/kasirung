<script lang="ts">
  import Dialog from '$lib/components/ui/dialog.svelte';
  import Label from '$lib/components/ui/label.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import Textarea from '$lib/components/ui/textarea.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import type { FormState, MenuSection, RoleItem } from './types';
  import type { MenuKey } from '$lib/navigation/menus';

  export let open: boolean;
  export let role: RoleItem | null;
  export let menuSections: MenuSection[];
  export let formState: FormState | null;
  export let defaultPermissions: MenuKey[];

  $: activePermissions = defaultPermissions.length ? defaultPermissions : role?.permissions ?? [];
</script>

{#if role}
  <Dialog bind:open title={`Edit ${role.name}`}>
    <form method="POST" action="?/update" class="space-y-4">
      <input type="hidden" name="id" value={role.id} />
      <div class="space-y-2">
        <Label for="edit-name">Nama role</Label>
        <Input id="edit-name" name="name" value={role.name} required />
        {#if formState?.form === 'update' && formState.errors?.name}
          <p class="text-xs text-red-500">{formState.errors.name[0]}</p>
        {/if}
      </div>
      <div class="space-y-2">
        <Label for="edit-description">Deskripsi</Label>
        <Textarea id="edit-description" name="description" rows={3}>{role.description ?? ''}</Textarea>
        {#if formState?.form === 'update' && formState.errors?.description}
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
                    checked={activePermissions.includes(item.key)}
                  />
                  <span>{item.label}</span>
                </label>
              {/each}
            </div>
          </div>
        {/each}
        {#if formState?.form === 'update' && formState.errors?.permissions}
          <p class="text-xs text-red-500">{formState.errors.permissions[0]}</p>
        {/if}
      </div>
      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">Perbarui</Button>
    </form>
  </Dialog>
{/if}
