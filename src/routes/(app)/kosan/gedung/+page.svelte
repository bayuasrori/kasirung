<script lang="ts">
	import { page } from '$app/stores';
	import { Plus } from 'lucide-svelte';

	import Button from '$lib/components/ui/button.svelte';
	import GedungList from './_component/GedungList.svelte';
	import CreateDialog from './_component/CreateDialog.svelte';
	import EditDialog from './_component/EditDialog.svelte';
	import DeleteDialog from './_component/DeleteDialog.svelte';
	import type { FormState, GedungItem } from './_component/types';

	export let data: {
		gedung: GedungItem[];
		form?: FormState | null;
	};

	let showCreateModal = false;
	let showEditModal = false;
	let showDeleteModal = false;
	let editingGedung: GedungItem | null = null;
let formState: FormState | null = data.form ?? null;

function syncFormState(newForm?: FormState | null) {
	formState = newForm ?? null;
	if (!newForm || !newForm.errors) return;
	if (newForm.form === 'create') showCreateModal = true;
	if (newForm.form === 'update') showEditModal = true;
	if (newForm.form === 'delete') showDeleteModal = true;
}

page.subscribe(($page) => {
	syncFormState($page.form as FormState | null);
});

const openCreate = () => (showCreateModal = true);
const openEdit = (item: GedungItem) => {
	editingGedung = item;
	showEditModal = true;
};
const openDelete = (item: GedungItem) => {
	editingGedung = item;
	showDeleteModal = true;
};
const handleEdit = (event: CustomEvent<GedungItem>) => openEdit(event.detail);
const handleDelete = (event: CustomEvent<GedungItem>) => openDelete(event.detail);

if (formState) {
	syncFormState(formState);
}
</script>

<div class="space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div>
			<h1 class="text-xl font-semibold text-slate-900">Master Gedung Kosan</h1>
			<p class="text-sm text-slate-500">Kelola daftar gedung dan pantau kapasitas hunian setiap gedung.</p>
		</div>
		<Button on:click={openCreate} className="gap-2">
			<Plus class="h-4 w-4" />
			Tambah Gedung
		</Button>
	</div>

	<GedungList items={data.gedung} on:edit={handleEdit} on:delete={handleDelete} />

	<CreateDialog bind:open={showCreateModal} {formState} />
	<EditDialog bind:open={showEditModal} gedung={editingGedung} {formState} />
	<DeleteDialog bind:open={showDeleteModal} gedung={editingGedung} {formState} />
</div>
