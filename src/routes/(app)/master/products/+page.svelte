<script lang="ts">
	import { page } from '$app/stores';
	import { onDestroy } from 'svelte';
	import { derived } from 'svelte/store';
	import { Plus, Pencil, Trash2, Filter, PackageSearch } from 'lucide-svelte';

	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Select from '$lib/components/ui/select.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';
	import Dialog from '$lib/components/ui/dialog.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';

	export let data: {
		products: Array<{
			id: string;
			sku: string;
			name: string;
			description: string | null;
			price: string;
			categoryId: number | null;
			categoryName: string | null;
			isActive: boolean;
		}>;
		total: number;
		page: number;
		pageCount: number;
		pageSize: number;
		categories: Array<{ id: number; name: string }>;
		filters: { search: string; categoryId: string; sortBy: string; sortDir: string };
		form?: { form?: string; errors?: Record<string, string[]> } | null;
	};

	const actionForm = derived(page, ($page) => $page.form as typeof data.form | undefined);
	let form = data.form ?? null;
	$: form = $actionForm ?? data.form ?? null;

	let showCreateModal = false;
	let showEditModal = false;
	let showDeleteModal = false;
	let editingProduct: typeof data.products[number] | null = null;
	let deletingProduct: typeof data.products[number] | null = null;

	let createDefaults = {
		name: '',
		sku: '',
		description: '',
		price: '0',
		categoryId: ''
	};

	const unsubscribe = actionForm.subscribe(($form) => {
		if (!$form) return;
		if ($form.form === 'create' && $form.errors) {
			showCreateModal = true;
		}
		if ($form.form === 'update' && $form.errors && editingProduct) {
			showEditModal = true;
		}
		if ($form.form === 'delete' && $form.errors && deletingProduct) {
			showDeleteModal = true;
		}
	});
	onDestroy(unsubscribe);

	function openCreateModal() {
		createDefaults = { name: '', sku: '', description: '', price: '0', categoryId: '' };
		showCreateModal = true;
	}

	function openEditModal(product: typeof data.products[number]) {
		editingProduct = product;
		showEditModal = true;
	}

	function openDeleteModal(product: typeof data.products[number]) {
		deletingProduct = product;
		showDeleteModal = true;
	}

	function formatCurrency(value: string) {
		return `Rp ${Number(value ?? 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
	}
</script>

<div class="space-y-6">
	{#if form?.form === 'delete' && form.errors?.id}
		<div class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
			{form.errors.id[0]}
		</div>
	{/if}

	<Card>
		<CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
			<div>
				<CardTitle>Manajemen Produk</CardTitle>
				<p class="text-sm text-slate-500">Kelola daftar produk dan layanan yang tersedia di POS.</p>
			</div>
			<Button on:click={openCreateModal} className="gap-2 bg-blue-600 hover:bg-blue-500">
				<Plus class="h-4 w-4" />
				Produk Baru
			</Button>
		</CardHeader>
		<CardContent>
			<form method="GET" class="grid gap-4 md:grid-cols-[280px_200px_auto]"></form>
		</CardContent>
	</Card>

	<form method="GET" class="grid gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur md:grid-cols-[300px_200px_auto_120px]">
		<div class="space-y-2">
			<Label for="search">Cari Produk</Label>
			<div class="relative">
				<Input id="search" name="search" placeholder="Nama atau SKU" value={data.filters.search} className="pl-9" />
				<PackageSearch class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
			</div>
		</div>
		<div class="space-y-2">
			<Label for="category">Kategori</Label>
			<Select id="category" name="category" value={data.filters.categoryId}>
				<option value="">Semua kategori</option>
				{#each data.categories as category}
					<option value={category.id}>{category.name}</option>
				{/each}
			</Select>
		</div>
		<div class="space-y-2">
			<Label for="sortBy">Urutkan</Label>
			<Select id="sortBy" name="sortBy" value={data.filters.sortBy}>
				<option value="createdAt">Terbaru</option>
				<option value="name">Nama</option>
				<option value="price">Harga</option>
			</Select>
		</div>
		<div class="space-y-2">
			<Label for="sortDir">Arah</Label>
			<Select id="sortDir" name="sortDir" value={data.filters.sortDir}>
				<option value="desc">Menurun</option>
				<option value="asc">Menaik</option>
			</Select>
		</div>
		<div class="flex items-end">
			<Button type="submit" className="w-full gap-2">
				<Filter class="h-4 w-4" />
				Terapkan
			</Button>
		</div>
	</form>

	<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-sm">
		<table class="min-w-full divide-y divide-slate-200 text-sm">
			<thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
				<tr>
					<th class="px-4 py-3">Produk</th>
					<th class="px-4 py-3">Kategori</th>
					<th class="px-4 py-3 text-right">Harga</th>
					<th class="px-4 py-3 text-center">Status</th>
					<th class="px-4 py-3 text-right">Aksi</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-slate-100 bg-white">
				{#if data.products.length}
					{#each data.products as product}
						<tr class="hover:bg-blue-50/40">
							<td class="px-4 py-3">
								<p class="font-medium text-slate-900">{product.name}</p>
								<p class="text-xs text-slate-500">SKU: {product.sku}</p>
								{#if product.description}
									<p class="mt-1 text-xs text-slate-400 truncate">{product.description}</p>
								{/if}
							</td>
							<td class="px-4 py-3 text-slate-600">{product.categoryName ?? 'Tanpa kategori'}</td>
							<td class="px-4 py-3 text-right font-semibold text-slate-900">{formatCurrency(product.price)}</td>
							<td class="px-4 py-3 text-center">
								<Badge variant={product.isActive ? 'success' : 'muted'}>{product.isActive ? 'Aktif' : 'Arsip'}</Badge>
							</td>
							<td class="px-4 py-3 text-right">
								<div class="flex justify-end gap-2">
									<Button variant="ghost" size="sm" className="text-blue-600" on:click={() => openEditModal(product)}>
										<Pencil class="h-4 w-4" />
									</Button>
									<Button variant="ghost" size="sm" className="text-red-500" on:click={() => openDeleteModal(product)}>
										<Trash2 class="h-4 w-4" />
									</Button>
								</div>
							</td>
						</tr>
					{/each}
				{:else}
					<tr>
						<td colspan="5" class="px-4 py-8 text-center text-sm text-slate-500">Belum ada produk yang tersimpan.</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>

	{#if data.pageCount > 1}
		<div class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
			<p>Menampilkan halaman {data.page} dari {data.pageCount}</p>
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

	<Dialog bind:open={showCreateModal} title="Tambah Produk Baru">
		<form method="POST" action="?/create" class="space-y-4">
			<div class="grid gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<Label for="create-name">Nama Produk</Label>
					<Input id="create-name" name="name" placeholder="Contoh: Kopi Susu" value={createDefaults.name} required />
					{#if form?.form === 'create' && form.errors?.name}
						<p class="text-xs text-red-500">{form.errors.name[0]}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="create-sku">SKU</Label>
					<Input id="create-sku" name="sku" placeholder="SKU-001" required />
					{#if form?.form === 'create' && form.errors?.sku}
						<p class="text-xs text-red-500">{form.errors.sku[0]}</p>
					{/if}
				</div>
			</div>
			<div class="space-y-2">
				<Label for="create-description">Deskripsi</Label>
				<Textarea id="create-description" name="description" rows={3} placeholder="Catatan tambahan (opsional)" />
			</div>
			<div class="grid gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<Label for="create-price">Harga</Label>
					<Input id="create-price" name="price" type="number" min="0" step="100" required />
					{#if form?.form === 'create' && form.errors?.price}
						<p class="text-xs text-red-500">{form.errors.price[0]}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="create-category">Kategori</Label>
					<Select id="create-category" name="categoryId">
						<option value="">Tanpa kategori</option>
						{#each data.categories as category}
							<option value={category.id}>{category.name}</option>
						{/each}
					</Select>
				</div>
			</div>
			<Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">Simpan Produk</Button>
		</form>
	</Dialog>

	{#if editingProduct}
		<Dialog bind:open={showEditModal} title={`Edit ${editingProduct.name}`}>
			<form method="POST" action="?/update" class="space-y-4">
				<input type="hidden" name="id" value={editingProduct.id} />
				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="edit-name">Nama Produk</Label>
						<Input id="edit-name" name="name" value={editingProduct.name} required />
						{#if form?.form === 'update' && form.errors?.name}
							<p class="text-xs text-red-500">{form.errors.name[0]}</p>
						{/if}
					</div>
					<div class="space-y-2">
						<Label for="edit-price">Harga</Label>
						<Input id="edit-price" name="price" type="number" min="0" step="100" value={parseInt(editingProduct.price)} />
						{#if form?.form === 'update' && form.errors?.price}
							<p class="text-xs text-red-500">{form.errors.price[0]}</p>
						{/if}
					</div>
				</div>
				<div class="space-y-2">
					<Label for="edit-description">Deskripsi</Label>
					<Textarea id="edit-description" name="description" rows={3}>{editingProduct.description ?? ''}</Textarea>
				</div>
				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="edit-category">Kategori</Label>
					<Select
						id="edit-category"
						name="categoryId"
						value={editingProduct.categoryId !== null && editingProduct.categoryId !== undefined
							? String(editingProduct.categoryId)
							: ''}
					>
						<option value="">Tanpa kategori</option>
						{#each data.categories as category}
							<option value={category.id}>{category.name}</option>
						{/each}
					</Select>
					</div>
					<div class="space-y-2">
						<Label for="edit-status">Status</Label>
						<Select id="edit-status" name="isActive" value={editingProduct.isActive ? 'true' : 'false'}>
							<option value="true">Aktif</option>
							<option value="false">Arsip</option>
						</Select>
					</div>
				</div>
				<Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">Perbarui Produk</Button>
			</form>
		</Dialog>
	{/if}

	{#if deletingProduct}
		<Dialog bind:open={showDeleteModal} title="Hapus Produk" description={`Anda akan menghapus ${deletingProduct.name}. Tindakan ini tidak dapat dibatalkan.`}>
			<form method="POST" action="?/delete" class="space-y-4">
				<input type="hidden" name="id" value={deletingProduct.id} />
				{#if form?.form === 'delete' && form.errors?.id}
					<p class="text-sm text-red-500">{form.errors.id[0]}</p>
				{/if}
				<Button type="submit" variant="destructive" className="w-full bg-red-600 hover:bg-red-500">Hapus Produk</Button>
			</form>
		</Dialog>
	{/if}
</div>
