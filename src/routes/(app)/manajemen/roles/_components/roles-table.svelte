<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '$lib/components/ui/button.svelte';
  import Badge from '$lib/components/ui/badge.svelte';
  import { Pencil, Trash2 } from 'lucide-svelte';
  import { formatDate } from './helpers';
  import type { RoleItem } from './types';
  import type { MenuKey } from '$lib/navigation/menus';

  export let roles: RoleItem[];
  export let permissionLabelMap: Map<MenuKey, string>;

  const dispatch = createEventDispatcher<{ edit: RoleItem }>();

  const handleEdit = (role: RoleItem) => dispatch('edit', role);
</script>

<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
  <table class="min-w-full divide-y divide-slate-200 text-sm">
    <thead class="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
      <tr>
        <th class="px-4 py-3">Role</th>
        <th class="px-4 py-3">Deskripsi</th>
        <th class="px-4 py-3">Menu Akses</th>
        <th class="px-4 py-3 text-center">Pengguna</th>
        <th class="px-4 py-3 text-right">Diperbarui</th>
        <th class="px-4 py-3 text-right">Aksi</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-slate-100">
      {#if roles.length}
        {#each roles as role (role.id)}
          <tr class="hover:bg-blue-50/40">
            <td class="px-4 py-3">
              <p class="font-medium text-slate-900">{role.name}</p>
              <p class="text-xs text-slate-500">Dibuat {formatDate(role.createdAt)}</p>
            </td>
            <td class="px-4 py-3 text-slate-600">{role.description ?? '-'}</td>
            <td class="px-4 py-3">
              {#if role.permissions.length}
                <div class="flex flex-wrap gap-1">
                  {#each role.permissions as perm (perm)}
                    <Badge variant="muted">{permissionLabelMap.get(perm) ?? perm}</Badge>
                  {/each}
                </div>
              {:else}
                <span class="text-xs text-slate-400">Tidak ada</span>
              {/if}
            </td>
            <td class="px-4 py-3 text-center">
              <Badge variant="muted">{role.userCount} pengguna</Badge>
            </td>
            <td class="px-4 py-3 text-right text-slate-500">{formatDate(role.updatedAt)}</td>
            <td class="px-4 py-3 text-right">
              <div class="flex justify-end gap-2">
                <Button variant="ghost" size="sm" className="text-blue-600" on:click={() => handleEdit(role)}>
                  <Pencil class="h-4 w-4" />
                </Button>
                <form method="POST" action="?/delete" class="inline-flex">
                  <input type="hidden" name="id" value={role.id} />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    disabled={role.userCount > 0}
                    className={role.userCount > 0 ? 'text-slate-300' : 'text-red-600'}
                  >
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </td>
          </tr>
        {/each}
      {:else}
        <tr>
          <td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">Belum ada role yang terdaftar.</td>
        </tr>
      {/if}
    </tbody>
  </table>
</div>
