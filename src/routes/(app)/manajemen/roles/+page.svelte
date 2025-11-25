<script lang="ts">
  import { page } from '$app/stores';
  import RolesHeader from './_components/roles-header.svelte';
  import RolesFilterForm from './_components/roles-filter-form.svelte';
  import RolesTable from './_components/roles-table.svelte';
  import RolesPagination from './_components/roles-pagination.svelte';
  import RoleCreateDialog from './_components/role-create-dialog.svelte';
  import RoleEditDialog from './_components/role-edit-dialog.svelte';
  import { buildPermissionMaps, parseFormPermissions } from './_components/helpers';
  import type { FormState, RoleItem, MenuSection } from './_components/types';

  export let data: {
    roles: RoleItem[];
    total: number;
    page: number;
    pageCount: number;
    filters: { search: string; sortBy: string; sortDir: string };
    menuSections: MenuSection[];
    form?: FormState | null;
  };

  let showCreateModal = false;
  let showEditModal = false;
  let editingRole: RoleItem | null = null;
  let formState: FormState | null = null;

  let search = data.filters.search;
  let sortBy = data.filters.sortBy;
  let sortDir = data.filters.sortDir;

  const { labelMap: permissionLabelMap, knownKeys } = buildPermissionMaps(data.menuSections);

  page.subscribe(($page) => {
    const form = ($page.form as FormState | undefined) ?? null;
    formState = form;
    if (!form) return;
    if (form.form === 'create' && form.errors) showCreateModal = true;
    if (form.form === 'update' && form.errors) showEditModal = true;
  });

  const openCreate = () => {
    showCreateModal = true;
  };

  const openEdit = (role: RoleItem) => {
    editingRole = role;
    showEditModal = true;
  };

  $: createDefaultPermissions = parseFormPermissions(formState, 'create', knownKeys);
  $: updateDefaultPermissions = parseFormPermissions(formState, 'update', knownKeys);
</script>

<div class="space-y-6">
  <RolesHeader on:create={openCreate} />
  <RolesFilterForm bind:search bind:sortBy bind:sortDir />
  <RolesTable roles={data.roles} permissionLabelMap={permissionLabelMap} on:edit={(event) => openEdit(event.detail)} />
  <RolesPagination page={data.page} pageCount={data.pageCount} filters={data.filters} />
  <RoleCreateDialog
    bind:open={showCreateModal}
    menuSections={data.menuSections}
    formState={formState}
    defaultPermissions={createDefaultPermissions}
  />
  <RoleEditDialog
    bind:open={showEditModal}
    role={editingRole}
    menuSections={data.menuSections}
    formState={formState}
    defaultPermissions={updateDefaultPermissions}
  />
</div>
