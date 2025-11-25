<script lang="ts">
	import { page } from '$app/stores';
	import { Plus, Pencil, Trash2 } from 'lucide-svelte';

	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import Dialog from '$lib/components/ui/dialog.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Select from '$lib/components/ui/select.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';

	type Account = {
		id: string;
		code: string;
		name: string;
		type: string;
		parentId: string | null;
		description: string | null;
		isActive: boolean;
		createdAt: Date;
		updatedAt: Date;
	};

	type FormState =
		| { form: 'create' | 'update' | 'delete'; errors?: Record<string, string[]> }
		| undefined;

	export let data: {
		accounts: Account[];
		totalsByType: Array<{ type: string; count: number }>;
	};

	const typeLabel: Record<string, string> = {
		asset: 'Aset',
		liability: 'Liabilitas',
		equity: 'Ekuitas',
		revenue: 'Pendapatan',
		expense: 'Beban',
		other: 'Lainnya'
	};

	const accountTypes = ['asset', 'liability', 'equity', 'revenue', 'expense', 'other'];

	let showCreateModal = false;
	let showEditModal = false;
	let showDeleteModal = false;
	let editingAccount: Account | null = null;
	let deletingAccount: Account | null = null;

	$: formState = $page.form as FormState;
	$: accountMap = new Map(data.accounts.map((account) => [account.id, account]));

	page.subscribe(($page) => {
		const form = $page.form as FormState;
		if (!form || !form.errors) return;
		if (form.form === 'create') showCreateModal = true;
		if (form.form === 'update') showEditModal = true;
		if (form.form === 'delete') showDeleteModal = true;
	});

	function openCreate() {
		showCreateModal = true;
	}

	function openEdit(account: Account) {
		editingAccount = account;
		showEditModal = true;
	}

	function openDelete(account: Account) {
		deletingAccount = account;
		showDeleteModal = true;
	}

	const parentOptions = (excludeId?: string) =>
		data.accounts.filter((account) => account.id !== excludeId);
</script>

<div class="space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div>
			<h1 class="text-xl font-semibold text-slate-900">Daftar Akun Buku Besar</h1>
			<p class="text-sm text-slate-500">Kelola chart of accounts untuk pencatatan jurnal dan laporan keuangan.</p>
		</div>
		<Button on:click={openCreate} className="gap-2">
			<Plus class="h-4 w-4" />
			Tambah Akun
		</Button>
	</div>

	<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
		{#each data.totalsByType as summary (summary.type)}
			<Card class="bg-white/90 shadow-sm backdrop-blur">
				<CardHeader>
					<CardTitle>{typeLabel[summary.type] ?? summary.type}</CardTitle>
				</CardHeader>
				<CardContent>
					<p class="text-3xl font-semibold text-slate-900">{summary.count}</p>
					<p class="mt-1 text-sm text-slate-500">Akun dalam kategori ini</p>
				</CardContent>
			</Card>
		{/each}
	</div>

	<Card class="bg-white/90 shadow-sm backdrop-blur">
		<CardHeader>
			<CardTitle>Chart of Accounts</CardTitle>
		</CardHeader>
		<CardContent>
			{#if data.accounts.length === 0}
				<p class="text-sm text-slate-500">Belum ada akun yang terdaftar.</p>
			{:else}
				<div class="overflow-x-auto">
					<table class="min-w-full text-left text-sm text-slate-600">
						<thead class="text-xs uppercase text-slate-400">
							<tr>
								<th class="pb-2 pr-4">Kode</th>
								<th class="pb-2 pr-4">Nama Akun</th>
								<th class="pb-2 pr-4">Tipe</th>
								<th class="pb-2 pr-4">Induk</th>
								<th class="pb-2 pr-4">Status</th>
								<th class="pb-2 pr-4">Terakhir Diperbarui</th>
								<th class="pb-2 text-right">Aksi</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-100">
							{#each data.accounts as account (account.id)}
								<tr>
									<td class="py-3 pr-4 font-medium text-slate-900">{account.code}</td>
									<td class="py-3 pr-4">
										<div class="font-medium text-slate-800">{account.name}</div>
										<p class="text-xs text-slate-500">{account.description || '—'}</p>
									</td>
									<td class="py-3 pr-4 text-slate-500">{typeLabel[account.type] ?? account.type}</td>
									<td class="py-3 pr-4 text-slate-500">
										{#if account.parentId}
											{#if accountMap.get(account.parentId)}
												{accountMap.get(account.parentId)?.code} — {accountMap.get(account.parentId)?.name}
											{:else}
												<span class="text-xs text-slate-400">Akun induk tidak ditemukan</span>
											{/if}
										{:else}
											<span class="text-xs text-slate-400">–</span>
										{/if}
									</td>
									<td class="py-3 pr-4">
										<Badge variant={account.isActive ? 'success' : 'muted'}>
											{account.isActive ? 'Aktif' : 'Arsip'}
										</Badge>
									</td>
									<td class="py-3 pr-4 text-slate-500">
										{new Date(account.updatedAt).toLocaleString('id-ID', {
											year: 'numeric',
											month: 'short',
											day: 'numeric'
										})}
									</td>
									<td class="py-3 text-right">
										<div class="flex justify-end gap-2">
											<Button type="button" variant="ghost" className="h-8 w-8 p-0" on:click={() => openEdit(account)}>
												<Pencil class="h-4 w-4" />
											</Button>
											<Button
												type="button"
												variant="ghost"
												className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
												on:click={() => openDelete(account)}
											>
												<Trash2 class="h-4 w-4" />
											</Button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</CardContent>
	</Card>

	<Dialog bind:open={showCreateModal} title="Tambah akun baru">
		<form method="POST" action="?/create" class="space-y-4">
			<div class="grid gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<Label for="create-code">Kode Akun</Label>
					<Input id="create-code" name="code" required maxlength={30} placeholder="1101" />
					{#if formState?.form === 'create' && formState.errors?.code}
						<p class="text-xs text-red-500">{formState.errors.code[0]}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="create-name">Nama Akun</Label>
					<Input id="create-name" name="name" required maxlength={120} placeholder="Kas" />
					{#if formState?.form === 'create' && formState.errors?.name}
						<p class="text-xs text-red-500">{formState.errors.name[0]}</p>
					{/if}
				</div>
			</div>
			<div class="grid gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<Label for="create-type">Tipe</Label>
					<Select id="create-type" name="type">
						{#each accountTypes as accountType (accountType)}
							<option value={accountType}>{typeLabel[accountType]}</option>
						{/each}
					</Select>
					{#if formState?.form === 'create' && formState.errors?.type}
						<p class="text-xs text-red-500">{formState.errors.type[0]}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="create-parent">Akun Induk</Label>
					<Select id="create-parent" name="parentId">
						<option value="">Tidak ada</option>
						{#each parentOptions() as option (option.id)}
							<option value={option.id}>{option.code} — {option.name}</option>
						{/each}
					</Select>
					{#if formState?.form === 'create' && formState.errors?.parentId}
						<p class="text-xs text-red-500">{formState.errors.parentId[0]}</p>
					{/if}
				</div>
			</div>
			<div class="grid gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<Label for="create-status">Status</Label>
					<Select id="create-status" name="isActive">
						<option value="true">Aktif</option>
						<option value="false">Arsip</option>
					</Select>
				</div>
				<div class="space-y-2">
					<Label for="create-description">Deskripsi</Label>
					<Textarea id="create-description" name="description" rows={3} placeholder="Catatan tambahan" />
					{#if formState?.form === 'create' && formState.errors?.description}
						<p class="text-xs text-red-500">{formState.errors.description[0]}</p>
					{/if}
				</div>
			</div>
			<Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">Simpan Akun</Button>
		</form>
	</Dialog>

	{#if editingAccount}
		<Dialog bind:open={showEditModal} title={`Edit ${editingAccount.name}`}>
			<form method="POST" action="?/update" class="space-y-4">
				<input type="hidden" name="id" value={editingAccount.id} />
				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="edit-code">Kode Akun</Label>
						<Input id="edit-code" name="code" value={editingAccount.code} required maxlength={30} />
						{#if formState?.form === 'update' && formState.errors?.code}
							<p class="text-xs text-red-500">{formState.errors.code[0]}</p>
						{/if}
					</div>
					<div class="space-y-2">
						<Label for="edit-name">Nama Akun</Label>
						<Input id="edit-name" name="name" value={editingAccount.name} required maxlength={120} />
						{#if formState?.form === 'update' && formState.errors?.name}
							<p class="text-xs text-red-500">{formState.errors.name[0]}</p>
						{/if}
					</div>
				</div>
				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="edit-type">Tipe</Label>
						<Select id="edit-type" name="type" value={editingAccount.type}>
							{#each accountTypes as accountType (accountType)}
								<option value={accountType}>{typeLabel[accountType]}</option>
							{/each}
						</Select>
						{#if formState?.form === 'update' && formState.errors?.type}
							<p class="text-xs text-red-500">{formState.errors.type[0]}</p>
						{/if}
					</div>
					<div class="space-y-2">
						<Label for="edit-parent">Akun Induk</Label>
						<Select id="edit-parent" name="parentId" value={editingAccount.parentId ?? ''}>
							<option value="">Tidak ada</option>
							{#each parentOptions(editingAccount.id) as option (option.id)}
								<option value={option.id}>{option.code} — {option.name}</option>
							{/each}
						</Select>
						{#if formState?.form === 'update' && formState.errors?.parentId}
							<p class="text-xs text-red-500">{formState.errors.parentId[0]}</p>
						{/if}
					</div>
				</div>
				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="edit-status">Status</Label>
						<Select id="edit-status" name="isActive" value={editingAccount.isActive ? 'true' : 'false'}>
							<option value="true">Aktif</option>
							<option value="false">Arsip</option>
						</Select>
					</div>
					<div class="space-y-2">
						<Label for="edit-description">Deskripsi</Label>
						<Textarea id="edit-description" name="description" rows={3}>{editingAccount.description ?? ''}</Textarea>
						{#if formState?.form === 'update' && formState.errors?.description}
							<p class="text-xs text-red-500">{formState.errors.description[0]}</p>
						{/if}
					</div>
				</div>
				<Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">Perbarui Akun</Button>
			</form>
		</Dialog>
	{/if}

	{#if deletingAccount}
		<Dialog
			bind:open={showDeleteModal}
			title="Hapus akun"
			description={`Akun ${deletingAccount.code} — ${deletingAccount.name} akan dihapus permanen.`}
		>
			<form method="POST" action="?/delete" class="space-y-4">
				<input type="hidden" name="id" value={deletingAccount.id} />
				{#if formState?.form === 'delete' && formState.errors?.id}
					<p class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
						{formState.errors.id[0]}
					</p>
				{/if}
				<Button type="submit" variant="destructive" className="w-full bg-red-600 hover:bg-red-500">
					Hapus Akun
				</Button>
			</form>
		</Dialog>
	{/if}
</div>
