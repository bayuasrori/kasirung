<script lang="ts">
	import { page } from '$app/stores';
	import { Plus } from 'lucide-svelte';

	import Button from '$lib/components/ui/button.svelte';
	import UserFilters from './_component/UserFilters.svelte';
	import UsersTable from './_component/UsersTable.svelte';
	import PaginationSummary from './_component/PaginationSummary.svelte';
	import CreateUserDialog from './_component/CreateUserDialog.svelte';
	import EditUserDialog from './_component/EditUserDialog.svelte';
	import ResetPasswordDialog from './_component/ResetPasswordDialog.svelte';
	import type { FormState, RoleOption, UserFiltersState, UserItem } from './_component/types';

	export let data: {
		users: UserItem[];
		total: number;
		page: number;
		pageCount: number;
		roles: RoleOption[];
		filters: UserFiltersState;
		form?: FormState | null;
	};

	let filters: UserFiltersState = structuredClone(data.filters);
	$: paginationFilters = {
		search: filters.search,
		roleId: filters.roleId,
		status: filters.status,
		sortBy: filters.sortBy,
		sortDir: filters.sortDir
	};
	let showCreateModal = false;
	let showEditModal = false;
	let showResetModal = false;
	let editingUser: UserItem | null = null;
	let resettingUser: UserItem | null = null;
	let formState: FormState | null = data.form ?? null;

	function syncFormState(form: FormState | null) {
		formState = form;
		if (!form || !form.errors) return;
		if (form.form === 'create') showCreateModal = true;
		if (form.form === 'update') showEditModal = true;
		if (form.form === 'reset') showResetModal = true;
	}

	page.subscribe(($page) => {
		syncFormState($page.form as FormState | null);
	});

	syncFormState(formState);

	const openCreate = () => (showCreateModal = true);
	const handleEdit = (event: CustomEvent<UserItem>) => {
		editingUser = event.detail;
		showEditModal = true;
	};
	const handleReset = (event: CustomEvent<UserItem>) => {
		resettingUser = event.detail;
		showResetModal = true;
	};
</script>

<div class="space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div>
			<h1 class="text-xl font-semibold text-slate-900">Manajemen Pengguna</h1>
			<p class="text-sm text-slate-500">Kelola akun pengguna dan hak akses aplikasi.</p>
		</div>
		<Button on:click={openCreate} className="gap-2">
			<Plus class="h-4 w-4" />
			Pengguna Baru
		</Button>
	</div>

	<UserFilters bind:filters roles={data.roles} />

	<UsersTable users={data.users} on:edit={handleEdit} on:reset={handleReset} />

	{#if data.pageCount > 1}
		<PaginationSummary currentPage={data.page} pageCount={data.pageCount} filters={paginationFilters} />
	{/if}

	<CreateUserDialog bind:open={showCreateModal} roles={data.roles} formState={formState} />
	<EditUserDialog bind:open={showEditModal} roles={data.roles} user={editingUser} formState={formState} />
	<ResetPasswordDialog bind:open={showResetModal} user={resettingUser} formState={formState} />
</div>
