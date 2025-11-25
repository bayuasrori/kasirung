<script lang="ts">
  import { page } from '$app/stores';
  import CategoriesHeader from './_components/categories-header.svelte';
  import CategoriesFilterForm from './_components/categories-filter-form.svelte';
  import CategoriesTable from './_components/categories-table.svelte';
  import CategoriesPagination from './_components/categories-pagination.svelte';
  import CategoryCreateDialog from './_components/category-create-dialog.svelte';
  import CategoryEditDialog from './_components/category-edit-dialog.svelte';
  import CategoryDeleteDialog from './_components/category-delete-dialog.svelte';
  import type { Category, CategoryFilters, CategoryFormState } from './_components/types';

  export let data: {
    categories: Category[];
    total: number;
    page: number;
    pageCount: number;
    filters: CategoryFilters;
    form?: CategoryFormState | null;
  };

  let showCreateModal = false;
  let showEditModal = false;
  let showDeleteModal = false;

  let editingCategory: Category | null = null;
  let deletingCategory: Category | null = null;
  let formState: CategoryFormState | null = data.form ?? null;

  let search = data.filters.search;
  let sortBy = data.filters.sortBy;
  let sortDir = data.filters.sortDir;

  page.subscribe(($page) => {
    const form = ($page.form as CategoryFormState | undefined) ?? null;
    formState = form ?? data.form ?? null;
    if (!form) return;
    if (form.form === 'create' && form.errors) showCreateModal = true;
    if (form.form === 'update' && form.errors) showEditModal = true;
  });

  const openCreate = () => {
    showCreateModal = true;
  };

  const openEdit = (category: Category) => {
    editingCategory = category;
    showEditModal = true;
  };

  const openDelete = (category: Category) => {
    deletingCategory = category;
    showDeleteModal = true;
  };
</script>

<div class="space-y-6">
  <CategoriesHeader on:create={openCreate} />
  <CategoriesFilterForm bind:search bind:sortBy bind:sortDir />
  <CategoriesTable
    categories={data.categories}
    on:edit={(event) => openEdit(event.detail)}
    on:delete={(event) => openDelete(event.detail)}
  />
  <CategoriesPagination page={data.page} pageCount={data.pageCount} filters={data.filters} />
  <CategoryCreateDialog bind:open={showCreateModal} formState={formState} />
  <CategoryEditDialog bind:open={showEditModal} category={editingCategory} formState={formState} />
  <CategoryDeleteDialog bind:open={showDeleteModal} category={deletingCategory} />
</div>
