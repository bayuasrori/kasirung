<script lang="ts">
	import { page } from '$app/stores';
	import { Plus } from 'lucide-svelte';

	import Button from '$lib/components/ui/button.svelte';
	import RoomFilters from './_component/RoomFilters.svelte';
	import RoomTable from './_component/RoomTable.svelte';
	import CreateRoomDialog from './_component/CreateRoomDialog.svelte';
	import EditRoomDialog from './_component/EditRoomDialog.svelte';
	import DeleteRoomDialog from './_component/DeleteRoomDialog.svelte';
	import type { Filters, FormState, GedungOption, RoomItem } from './_component/types';

	export let data: {
		ruangan: RoomItem[];
		gedung: GedungOption[];
		filters: Filters;
		form?: FormState | null;
	};

	let gedungFilter = data.filters.gedungId;
	let statusFilter = data.filters.status;
	let showCreateModal = false;
	let showEditModal = false;
	let showDeleteModal = false;
	let editingRoom: RoomItem | null = null;
	let formState: FormState | null = data.form ?? null;

	function syncFormState(form: FormState | null) {
		formState = form;
		if (!form || !form.errors) return;
		if (form.form === 'create') showCreateModal = true;
		if (form.form === 'update') showEditModal = true;
		if (form.form === 'delete') showDeleteModal = true;
	}

	page.subscribe(($page) => {
		syncFormState($page.form as FormState | null);
	});

	if (formState) {
		syncFormState(formState);
	}

	const openCreate = () => (showCreateModal = true);
	const handleEdit = (event: CustomEvent<RoomItem>) => {
		editingRoom = event.detail;
		showEditModal = true;
	};
	const handleDelete = (event: CustomEvent<RoomItem>) => {
		editingRoom = event.detail;
		showDeleteModal = true;
	};
</script>

<div class="space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div>
			<h1 class="text-xl font-semibold text-slate-900">Master Ruangan Kosan</h1>
			<p class="text-sm text-slate-500">Kelola unit kamar, tarif bulanan, dan status keterisiannya.</p>
		</div>
		<Button on:click={openCreate} className="gap-2">
			<Plus class="h-4 w-4" />
			Tambah Ruangan
		</Button>
	</div>

	<RoomFilters gedungList={data.gedung} bind:gedungId={gedungFilter} bind:status={statusFilter} />

	<RoomTable rooms={data.ruangan} on:edit={handleEdit} on:delete={handleDelete} />

	<CreateRoomDialog bind:open={showCreateModal} gedungList={data.gedung} {formState} />
	<EditRoomDialog bind:open={showEditModal} gedungList={data.gedung} room={editingRoom} {formState} />
	<DeleteRoomDialog bind:open={showDeleteModal} room={editingRoom} {formState} />
</div>
