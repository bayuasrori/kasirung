<script lang="ts">
	import { page } from '$app/stores';
	import { Plus, Pencil, Trash2, Filter } from 'lucide-svelte';

	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';
	import Dialog from '$lib/components/ui/dialog.svelte';
	import Badge from '$lib/components/ui/badge.svelte';

	export let data: {
		categories: Array<{ id: number; name: string; description: string | null; productCount: number }>;
		total: number;
		page: number;
		pageCount: number;
		filters: { search: string; sortBy: string; sortDir: string };
		form?: { form?: string; errors?: Record<string, string[]> } | null;
	};

	let showCreateModal = false;
	let search = data.filters.search;
	let sortBy = data.filters.sortBy;
	let sortDir = data.filters.sortDir;
	let showEditModal = false;
	let showDeleteModal = false;
	let editingCategory: typeof data.categories[number] | null = null;
	let deletingCategory: typeof data.categories[number] | null = null;

	page.subscribe(($page) => {
		const form = $page.form as typeof data.form;
		if (!form) return;
		if (form.form === 'create' && form.errors) showCreateModal = true;
		if (form.form === 'update' && form.errors) showEditModal = true;
	});

	function openCreate() {
		showCreateModal = true;
	}

	function openEdit(category: typeof data.categories[number]) {
		editingCategory = category;
		showEditModal = true;
	}

	function openDelete(category: typeof data.categories[number]) {
		deletingCategory = category;
		showDeleteModal = true;
	}
</script>

<div class="space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div>
			<h1 class="text-xl font-semibold text-slate-900">Kategori Produk</h1>
			<p class="text-sm text-slate-500">Kelompokkan produk berdasarkan kategori untuk laporan yang lebih akurat.</p>
		</div>
		<Button on:click={openCreate} className="gap-2">
			<Plus class="h-4 w-4" />
			Kategori Baru
		</Button>
	</div>

	<form method="GET" class="grid gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur md:grid-cols-[320px_180px_160px_auto]">
		<div class="space-y-2">
			<Label for="search">Cari</Label>
			<Input id="search" name="search" placeholder="Nama kategori" bind:value={search} />
		</div>
		<div class="space-y-2">
			<Label for="sortBy">Urutkan</Label>
			<select id="sortBy" name="sortBy" class="h-10 w-full rounded-md border border-slate-200 px-3 text-sm" bind:value={sortBy}>
				<option value="createdAt">Terbaru</option>
				<option value="name">Nama</option>
			</select>
		</div>
		<div class="space-y-2">
			<Label for="sortDir">Arah</Label>
			<select id="sortDir" name="sortDir" class="h-10 w-full rounded-md border border-slate-200 px-3 text-sm" bind:value={sortDir}>
				<option value="desc">Menurun</option>
				<option value="asc">Menaik</option>
			</select>
		</div>
		<div class="flex items-end">
			<Button type="submit" className="w-full gap-2">
				<Filter class="h-4 w-4" />
				Terapkan
			</Button>
		</div>
	</form>

	<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
		<table class="min-w-full divide-y divide-slate-200 text-sm">
			<thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
				<tr>
					<th class="px-4 py-3">Kategori</th>
					<th class="px-4 py-3 text-center">Produk</th>
					<th class="px-4 py-3 text-right">Aksi</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-slate-100">
				{#if data.categories.length}
					{#each data.categories as category}
						<tr class="hover:bg-blue-50/40">
							<td class="px-4 py-3">
								<p class="font-medium text-slate-900">{category.name}</p>
								{#if category.description}
									<p class="text-xs text-slate-500">{category.description}</p>
								{/if}
							</td>
							<td class="px-4 py-3 text-center">
								<Badge variant="muted">{category.productCount} produk</Badge>
							</td>
							<td class="px-4 py-3 text-right">
								<div class="flex justify-end gap-2">
									<Button variant="ghost" size="sm" className="text-blue-600" on:click={() => openEdit(category)}>
										<Pencil class="h-4 w-4" />
									</Button>
									<Button variant="ghost" size="sm" className="text-red-500" on:click={() => openDelete(category)}>
										<Trash2 class="h-4 w-4" />
									</Button>
								</div>
							</td>
						</tr>
					{/each}
				{:else}
					<tr>
						<td colspan="3" class="px-4 py-8 text-center text-sm text-slate-500">Belum ada kategori.</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>

	{#if data.pageCount > 1}
		<div class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
			<p>Halaman {data.page} dari {data.pageCount}</p>
			<div class="flex items-center gap-2">
				{#if data.page > 1}
					<a class="rounded-lg border border-slate-200 px-3 py-1" href={`?${new URLSearchParams({ ...data.filters, page: String(data.page - 1) }).toString()}`}>Sebelumnya</a>
				{/if}
				{#if data.page < data.pageCount}
					<a class="rounded-lg border border-slate-200 px-3 py-1" href={`?${new URLSearchParams({ ...data.filters, page: String(data.page + 1) }).toString()}`}>Berikutnya</a>
				{/if}
			</div>
		</div>
	{/if}

	<Dialog bind:open={showCreateModal} title="Tambah kategori">
		<form method="POST" action="?/create" class="space-y-4">
			<div class="space-y-2">
				<Label for="create-name">Nama Kategori</Label>
				<Input id="create-name" name="name" required />
				{#if data.form?.form === 'create' && data.form.errors?.name}
					<p class="text-xs text-red-500">{data.form.errors.name[0]}</p>
				{/if}
			</div>
			<div class="space-y-2">
				<Label for="create-description">Deskripsi</Label>
				<Textarea id="create-description" name="description" placeholder="Catatan (opsional)" rows={3} />
			</div>
			<Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">Simpan</Button>
		</form>
	</Dialog>

	{#if editingCategory}
		<Dialog bind:open={showEditModal} title={`Edit ${editingCategory.name}`}>
			<form method="POST" action="?/update" class="space-y-4">
				<input type="hidden" name="id" value={editingCategory.id} />
				<div class="space-y-2">
					<Label for="edit-name">Nama Kategori</Label>
					<Input id="edit-name" name="name" value={editingCategory.name} required />
					{#if data.form?.form === 'update' && data.form.errors?.name}
						<p class="text-xs text-red-500">{data.form.errors.name[0]}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="edit-description">Deskripsi</Label>
					<Textarea id="edit-description" name="description" rows={3}>{editingCategory.description ?? ''}</Textarea>
				</div>
				<Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">Perbarui</Button>
			</form>
		</Dialog>
	{/if}

	{#if deletingCategory}
		<Dialog
			bind:open={showDeleteModal}
			title="Hapus kategori"
			description={`Kategori ${deletingCategory.name} akan dihapus dari sistem.`}
		>
			<form method="POST" action="?/delete" class="space-y-4">
				<input type="hidden" name="id" value={deletingCategory.id} />
				<Button type="submit" variant="destructive" className="w-full bg-red-600 hover:bg-red-500">Hapus</Button>
			</form>
		</Dialog>
	{/if}
</div>
