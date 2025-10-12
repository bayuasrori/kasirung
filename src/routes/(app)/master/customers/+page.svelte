<script lang="ts">
	import { page } from '$app/stores';
	import { Plus, Pencil, Trash2, Filter, Mail, Phone, MapPin, BookOpen } from 'lucide-svelte';

	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';
	import Dialog from '$lib/components/ui/dialog.svelte';
	import Badge from '$lib/components/ui/badge.svelte';

	export let data: {
		customers: Array<{
			id: string;
			name: string;
			email: string | null;
			phone: string | null;
			address: string | null;
			notes: string | null;
			transactionCount: number;
			totalSpentThisMonth: number;
			outstandingThisMonth: number;
			createdAt: Date;
		}>;
		total: number;
		page: number;
		pageCount: number;
		filters: { search: string; sortBy: string; sortDir: string };
		form?: { form?: string; errors?: Record<string, string[]> } | null;
	};

	let search = data.filters.search;
	let sortBy = data.filters.sortBy;
	let sortDir = data.filters.sortDir;

	let showCreateModal = false;
	let showEditModal = false;
	let showDeleteModal = false;
	let editingCustomer: typeof data.customers[number] | null = null;
	let deletingCustomer: typeof data.customers[number] | null = null;

	page.subscribe(($page) => {
		const form = $page.form as typeof data.form;
		if (!form) return;
		if (form.form === 'create' && form.errors) showCreateModal = true;
		if (form.form === 'update' && form.errors) showEditModal = true;
	});

	const formatCurrency = (value: number | string) =>
		`Rp ${Number(value ?? 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;

	function openCreate() {
		showCreateModal = true;
	}

	function openEdit(customer: typeof data.customers[number]) {
		editingCustomer = customer;
		showEditModal = true;
	}

	function openDelete(customer: typeof data.customers[number]) {
		deletingCustomer = customer;
		showDeleteModal = true;
	}
</script>

<div class="space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div>
			<h1 class="text-xl font-semibold text-slate-900">Data Pelanggan</h1>
			<p class="text-sm text-slate-500">Kelola informasi pelanggan untuk program loyalti dan follow-up.</p>
		</div>
		<Button on:click={openCreate} className="gap-2">
			<Plus class="h-4 w-4" />
			Tambah Pelanggan
		</Button>
	</div>

	<form method="GET" class="grid gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur md:grid-cols-[320px_180px_160px_auto]">
		<div class="space-y-2">
			<Label for="search">Cari pelanggan</Label>
			<Input id="search" name="search" placeholder="Nama, email, atau telepon" bind:value={search} />
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
				<th class="px-4 py-3">Pelanggan</th>
				<th class="px-4 py-3">Kontak</th>
				<th class="px-4 py-3 text-center">Transaksi</th>
				<th class="px-4 py-3 text-right">Total Belanja (Bulan Ini)</th>
				<th class="px-4 py-3 text-right">Total Hutang (Bulan Ini)</th>
				<th class="px-4 py-3 text-right">Aksi</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-slate-100">
				{#if data.customers.length}
					{#each data.customers as customer}
						<tr class="hover:bg-blue-50/40">
							<td class="px-4 py-3">
								<p class="font-medium text-slate-900">{customer.name}</p>
								{#if customer.notes}
									<p class="text-xs text-slate-500">{customer.notes}</p>
								{/if}
							</td>
							<td class="space-y-1 px-4 py-3 text-sm text-slate-600">
								{#if customer.email}
									<p class="flex items-center gap-2"><Mail class="h-3.5 w-3.5 text-slate-400" /> {customer.email}</p>
								{/if}
								{#if customer.phone}
									<p class="flex items-center gap-2"><Phone class="h-3.5 w-3.5 text-slate-400" /> {customer.phone}</p>
								{/if}
								{#if customer.address}
									<p class="flex items-center gap-2"><MapPin class="h-3.5 w-3.5 text-slate-400" /> {customer.address}</p>
								{/if}
								{#if !customer.email && !customer.phone && !customer.address}
									<p class="text-xs text-slate-400">Belum ada kontak.</p>
								{/if}
							</td>
						<td class="px-4 py-3 text-center">
							<Badge variant="muted">{customer.transactionCount} trx</Badge>
						</td>
						<td class="px-4 py-3 text-right font-medium text-slate-900">
							{formatCurrency(customer.totalSpentThisMonth)}
						</td>
						<td
							class="px-4 py-3 text-right font-medium"
							class:text-amber-600={customer.outstandingThisMonth > 0}
							class:text-slate-500={customer.outstandingThisMonth === 0}
						>
							{formatCurrency(customer.outstandingThisMonth)}
						</td>
						<td class="px-4 py-3 text-right">
							<div class="flex justify-end gap-2">
								<Button
									variant="ghost"
									size="sm"
									className="text-slate-600"
									href={`/master/customers/${customer.id}`}
								>
									<BookOpen class="h-4 w-4" />
								</Button>
								<Button variant="ghost" size="sm" className="text-blue-600" on:click={() => openEdit(customer)}>
									<Pencil class="h-4 w-4" />
								</Button>
									<Button variant="ghost" size="sm" className="text-red-500" on:click={() => openDelete(customer)}>
										<Trash2 class="h-4 w-4" />
									</Button>
								</div>
							</td>
						</tr>
					{/each}
				{:else}
					<tr>
						<td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">Belum ada pelanggan yang terdaftar.</td>
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

	<Dialog bind:open={showCreateModal} title="Tambah pelanggan">
		<form method="POST" action="?/create" class="space-y-4">
			<div class="grid gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<Label for="create-name">Nama</Label>
					<Input id="create-name" name="name" required />
					{#if data.form?.form === 'create' && data.form.errors?.name}
						<p class="text-xs text-red-500">{data.form.errors.name[0]}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="create-email">Email</Label>
					<Input id="create-email" name="email" type="email" placeholder="contoh@mail.com" />
					{#if data.form?.form === 'create' && data.form.errors?.email}
						<p class="text-xs text-red-500">{data.form.errors.email[0]}</p>
					{/if}
				</div>
			</div>
			<div class="grid gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<Label for="create-phone">Telepon</Label>
					<Input id="create-phone" name="phone" placeholder="08xxxx" />
				</div>
				<div class="space-y-2">
					<Label for="create-address">Alamat</Label>
					<Input id="create-address" name="address" placeholder="Alamat singkat" />
				</div>
			</div>
			<div class="space-y-2">
				<Label for="create-notes">Catatan</Label>
				<Textarea id="create-notes" name="notes" rows={3} placeholder="Preferensi pelanggan, dll" />
			</div>
			<Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">Simpan</Button>
		</form>
	</Dialog>

	{#if editingCustomer}
		<Dialog bind:open={showEditModal} title={`Edit ${editingCustomer.name}`}>
			<form method="POST" action="?/update" class="space-y-4">
				<input type="hidden" name="id" value={editingCustomer.id} />
				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="edit-name">Nama</Label>
						<Input id="edit-name" name="name" value={editingCustomer.name} required />
						{#if data.form?.form === 'update' && data.form.errors?.name}
							<p class="text-xs text-red-500">{data.form.errors.name[0]}</p>
						{/if}
					</div>
					<div class="space-y-2">
						<Label for="edit-email">Email</Label>
						<Input id="edit-email" name="email" type="email" value={editingCustomer.email ?? ''} />
						{#if data.form?.form === 'update' && data.form.errors?.email}
							<p class="text-xs text-red-500">{data.form.errors.email[0]}</p>
						{/if}
					</div>
				</div>
				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="edit-phone">Telepon</Label>
						<Input id="edit-phone" name="phone" value={editingCustomer.phone ?? ''} />
					</div>
					<div class="space-y-2">
						<Label for="edit-address">Alamat</Label>
						<Input id="edit-address" name="address" value={editingCustomer.address ?? ''} />
					</div>
				</div>
				<div class="space-y-2">
					<Label for="edit-notes">Catatan</Label>
					<Textarea id="edit-notes" name="notes" rows={3}>{editingCustomer.notes ?? ''}</Textarea>
				</div>
				<Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">Perbarui</Button>
			</form>
		</Dialog>
	{/if}

	{#if deletingCustomer}
		<Dialog
			bind:open={showDeleteModal}
			title="Hapus pelanggan"
			description={`Data ${deletingCustomer.name} akan dihapus permanen.`}
		>
			<form method="POST" action="?/delete" class="space-y-4">
				<input type="hidden" name="id" value={deletingCustomer.id} />
				<Button type="submit" variant="destructive" className="w-full bg-red-600 hover:bg-red-500">Hapus</Button>
			</form>
		</Dialog>
	{/if}
</div>
