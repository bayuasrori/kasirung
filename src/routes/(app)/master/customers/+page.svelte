<script lang="ts">
  import { page } from '$app/stores';
  import CustomersHeader from './_components/customers-header.svelte';
  import CustomersFilterForm from './_components/customers-filter-form.svelte';
  import CustomersTable from './_components/customers-table.svelte';
  import CustomersPagination from './_components/customers-pagination.svelte';
  import CustomerCreateDialog from './_components/customer-create-dialog.svelte';
  import CustomerEditDialog from './_components/customer-edit-dialog.svelte';
  import CustomerDeleteDialog from './_components/customer-delete-dialog.svelte';
  import type { Customer, CustomerFilters, CustomerFormState } from './_components/types';

  export let data: {
    customers: Customer[];
    total: number;
    page: number;
    pageCount: number;
    filters: CustomerFilters;
    form?: CustomerFormState | null;
  };

  let showCreateModal = false;
  let showEditModal = false;
  let showDeleteModal = false;

  let editingCustomer: Customer | null = null;
  let deletingCustomer: Customer | null = null;
  let formState: CustomerFormState | null = data.form ?? null;

  let search = data.filters.search;
  let sortBy = data.filters.sortBy;
  let sortDir = data.filters.sortDir;

  page.subscribe(($page) => {
    const form = ($page.form as CustomerFormState | undefined) ?? null;
    formState = form ?? data.form ?? null;
    if (!form) return;
    if (form.form === 'create' && form.errors) showCreateModal = true;
    if (form.form === 'update' && form.errors) showEditModal = true;
  });

  const openCreate = () => {
    showCreateModal = true;
  };

  const openEdit = (customer: Customer) => {
    editingCustomer = customer;
    showEditModal = true;
  };

  const openDelete = (customer: Customer) => {
    deletingCustomer = customer;
    showDeleteModal = true;
  };
</script>

<div class="space-y-6">
  <CustomersHeader on:create={openCreate} />
  <CustomersFilterForm bind:search bind:sortBy bind:sortDir />
  <CustomersTable
    customers={data.customers}
    on:edit={(event) => openEdit(event.detail)}
    on:delete={(event) => openDelete(event.detail)}
  />
  <CustomersPagination page={data.page} pageCount={data.pageCount} filters={data.filters} />
  <CustomerCreateDialog bind:open={showCreateModal} formState={formState} />
  <CustomerEditDialog bind:open={showEditModal} customer={editingCustomer} formState={formState} />
  <CustomerDeleteDialog bind:open={showDeleteModal} customer={deletingCustomer} />
</div>
