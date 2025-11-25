<script lang="ts">
  import { page } from '$app/stores';
  import { onDestroy } from 'svelte';
  import { derived } from 'svelte/store';
  import ProductsHeader from './_components/products-header.svelte';
  import ProductsFilterForm from './_components/products-filter-form.svelte';
  import ProductsTable from './_components/products-table.svelte';
  import ProductsPagination from './_components/products-pagination.svelte';
  import ProductCreateDialog from './_components/product-create-dialog.svelte';
  import ProductEditDialog from './_components/product-edit-dialog.svelte';
  import ProductDeleteDialog from './_components/product-delete-dialog.svelte';
  import type { Product, CategoryOption, ProductFilters, ProductFormState } from './_components/types';

  export let data: {
    products: Product[];
    total: number;
    page: number;
    pageCount: number;
    pageSize: number;
    categories: CategoryOption[];
    filters: ProductFilters;
    form?: ProductFormState | null;
  };

  const actionForm = derived(page, ($page) => $page.form as ProductFormState | undefined);
  let form: ProductFormState | null = data.form ?? null;
  $: form = $actionForm ?? data.form ?? null;

  let showCreateModal = false;
  let showEditModal = false;
  let showDeleteModal = false;

  let editingProduct: Product | null = null;
  let deletingProduct: Product | null = null;

  const unsubscribe = actionForm.subscribe(($form) => {
    if (!$form) return;
    if ($form.form === 'create' && $form.errors) showCreateModal = true;
    if ($form.form === 'update' && $form.errors && editingProduct) showEditModal = true;
    if ($form.form === 'delete' && $form.errors && deletingProduct) showDeleteModal = true;
  });
  onDestroy(unsubscribe);

  const openCreateModal = () => {
    showCreateModal = true;
  };

  const openEditModal = (product: Product) => {
    editingProduct = product;
    showEditModal = true;
  };

  const openDeleteModal = (product: Product) => {
    deletingProduct = product;
    showDeleteModal = true;
  };
</script>

<div class="space-y-6">
  {#if form?.form === 'delete' && form.errors?.id}
    <div class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {form.errors.id[0]}
    </div>
  {/if}

  <ProductsHeader on:create={openCreateModal}>
    <ProductsFilterForm filters={data.filters} categories={data.categories} />
  </ProductsHeader>

  <ProductsTable
    products={data.products}
    on:edit={(event) => openEditModal(event.detail)}
    on:delete={(event) => openDeleteModal(event.detail)}
  />

  <ProductsPagination page={data.page} pageCount={data.pageCount} filters={data.filters} />

  <ProductCreateDialog bind:open={showCreateModal} categories={data.categories} formState={form} />
  <ProductEditDialog
    bind:open={showEditModal}
    product={editingProduct}
    categories={data.categories}
    formState={form}
  />
  <ProductDeleteDialog bind:open={showDeleteModal} product={deletingProduct} formState={form} />
</div>
