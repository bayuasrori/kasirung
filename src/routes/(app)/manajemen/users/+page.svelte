<script lang="ts">
	import { page } from '$app/stores';
	import { Plus, Pencil, RefreshCcw, Shield, Power } from 'lucide-svelte';

	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Dialog from '$lib/components/ui/dialog.svelte';
	import Badge from '$lib/components/ui/badge.svelte';

	export let data: {
		users: Array<{
			id: string;
			fullName: string;
			email: string;
			avatarUrl: string | null;
			roleId: number;
			roleName: string;
			isActive: boolean;
			createdAt: Date;
			updatedAt: Date;
		}>;
		total: number;
		page: number;
		pageCount: number;
		roles: Array<{ id: number; name: string }>;
		filters: { search: string; roleId: string; status: string; sortBy: string; sortDir: string };
		form?: { form?: string; errors?: Record<string, string[]> } | null;
	};

	let showCreateModal = false;
	let showEditModal = false;
	let showResetModal = false;
	let editingUser: typeof data.users[number] | null = null;
	let resettingUser: typeof data.users[number] | null = null;

	let search = data.filters.search;
	let roleId = data.filters.roleId;
	let status = data.filters.status;
	let sortBy = data.filters.sortBy;
	let sortDir = data.filters.sortDir;

	page.subscribe(($page) => {
		const form = $page.form as typeof data.form;
		if (!form) return;
		if (form.form === 'create' && form.errors) showCreateModal = true;
		if (form.form === 'update' && form.errors) showEditModal = true;
		if (form.form === 'reset' && form.errors) showResetModal = true;
	});

	function openCreate() {
		showCreateModal = true;
	}

	function openEdit(user: typeof data.users[number]) {
		editingUser = user;
		showEditModal = true;
	}

	function openReset(user: typeof data.users[number]) {
		resettingUser = user;
		showResetModal = true;
	}

	const formatDate = (value: Date) =>
		new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

	const statusVariant = (active: boolean) => (active ? 'success' : 'destructive');
	const statusLabel = (active: boolean) => (active ? 'Aktif' : 'Nonaktif');
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

	<form method="GET" class="grid gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur md:grid-cols-[minmax(200px,1fr)_180px_160px_160px_120px]">
		<div class="space-y-2">
			<Label for="search">Cari</Label>
			<Input id="search" name="search" placeholder="Nama atau email" bind:value={search} />
		</div>
		<div class="space-y-2">
			<Label for="role">Role</Label>
			<select id="role" name="roleId" class="h-10 w-full rounded-md border border-slate-200 px-3 text-sm" bind:value={roleId}>
				<option value="">Semua</option>
				{#each data.roles as role}
					<option value={role.id}>{role.name}</option>
				{/each}
			</select>
		</div>
		<div class="space-y-2">
			<Label for="status">Status</Label>
			<select id="status" name="status" class="h-10 w-full rounded-md border border-slate-200 px-3 text-sm" bind:value={status}>
				<option value="">Semua</option>
				<option value="active">Aktif</option>
				<option value="inactive">Nonaktif</option>
			</select>
		</div>
		<div class="space-y-2">
			<Label for="sortBy">Urutkan</Label>
			<select id="sortBy" name="sortBy" class="h-10 w-full rounded-md border border-slate-200 px-3 text-sm" bind:value={sortBy}>
				<option value="createdAt">Terbaru</option>
				<option value="fullName">Nama</option>
				<option value="email">Email</option>
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
			<Button type="submit" className="w-full">Terapkan</Button>
		</div>
	</form>

	<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
		<table class="min-w-full divide-y divide-slate-200 text-sm">
			<thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
				<tr>
					<th class="px-4 py-3">Nama</th>
					<th class="px-4 py-3">Email</th>
					<th class="px-4 py-3">Role</th>
					<th class="px-4 py-3 text-center">Status</th>
					<th class="px-4 py-3 text-right">Dibuat</th>
					<th class="px-4 py-3 text-right">Aksi</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-slate-100">
				{#if data.users.length}
					{#each data.users as user}
						<tr class="hover:bg-blue-50/40">
							<td class="px-4 py-3">
								<p class="font-medium text-slate-900">{user.fullName}</p>
								<p class="text-xs text-slate-500">Diperbarui {formatDate(user.updatedAt)}</p>
							</td>
							<td class="px-4 py-3 text-slate-600">{user.email}</td>
							<td class="px-4 py-3">
								<span class="inline-flex items-center gap-1 text-sm text-slate-700">
									<Shield class="h-4 w-4 text-slate-400" />
									{user.roleName}
								</span>
							</td>
							<td class="px-4 py-3 text-center">
								<Badge variant={statusVariant(user.isActive)}>{statusLabel(user.isActive)}</Badge>
							</td>
							<td class="px-4 py-3 text-right text-slate-500">{formatDate(user.createdAt)}</td>
							<td class="px-4 py-3 text-right">
								<div class="flex justify-end gap-2">
									<Button variant="ghost" size="sm" className="text-blue-600" on:click={() => openEdit(user)}>
										<Pencil class="h-4 w-4" />
									</Button>
									<Button variant="ghost" size="sm" className="text-amber-600" on:click={() => openReset(user)}>
										<RefreshCcw class="h-4 w-4" />
									</Button>
									<form method="POST" action="?/toggle" class="inline-flex">
										<input type="hidden" name="id" value={user.id} />
										<Button variant="ghost" size="sm" type="submit" className={user.isActive ? 'text-red-600' : 'text-green-600'}>
											<Power class="h-4 w-4" />
										</Button>
									</form>
								</div>
							</td>
						</tr>
					{/each}
				{:else}
					<tr>
						<td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">Belum ada pengguna yang cocok.</td>
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
					<a class="rounded-lg border border-slate-200 px-3 py-1" href={`?${new URLSearchParams({ ...data.filters, page: String(data.page - 1) }).toString()}`}>
						Sebelumnya
					</a>
				{/if}
				{#if data.page < data.pageCount}
					<a class="rounded-lg border border-slate-200 px-3 py-1" href={`?${new URLSearchParams({ ...data.filters, page: String(data.page + 1) }).toString()}`}>
						Berikutnya
					</a>
				{/if}
			</div>
		</div>
	{/if}

	<Dialog bind:open={showCreateModal} title="Tambah pengguna">
		<form method="POST" action="?/create" class="space-y-4">
			<div class="space-y-2">
				<Label for="create-fullName">Nama lengkap</Label>
				<Input id="create-fullName" name="fullName" required />
				{#if data.form?.form === 'create' && data.form.errors?.fullName}
					<p class="text-xs text-red-500">{data.form.errors.fullName[0]}</p>
				{/if}
			</div>
			<div class="space-y-2">
				<Label for="create-email">Email</Label>
				<Input id="create-email" name="email" type="email" required />
				{#if data.form?.form === 'create' && data.form.errors?.email}
					<p class="text-xs text-red-500">{data.form.errors.email[0]}</p>
				{/if}
			</div>
			<div class="space-y-2">
				<Label for="create-password">Kata sandi awal</Label>
				<Input id="create-password" name="password" type="password" minlength="8" required />
				{#if data.form?.form === 'create' && data.form.errors?.password}
					<p class="text-xs text-red-500">{data.form.errors.password[0]}</p>
				{/if}
			</div>
			<div class="space-y-2">
				<Label for="create-role">Role</Label>
				<select id="create-role" name="roleId" class="h-10 w-full rounded-md border border-slate-200 px-3 text-sm" required>
					<option value="">Pilih role</option>
					{#each data.roles as role}
						<option value={role.id}>{role.name}</option>
					{/each}
				</select>
				{#if data.form?.form === 'create' && data.form.errors?.roleId}
					<p class="text-xs text-red-500">{data.form.errors.roleId[0]}</p>
				{/if}
			</div>
			<div class="space-y-2">
				<Label for="create-avatar">URL avatar (opsional)</Label>
				<Input id="create-avatar" name="avatarUrl" placeholder="https://" />
				{#if data.form?.form === 'create' && data.form.errors?.avatarUrl}
					<p class="text-xs text-red-500">{data.form.errors.avatarUrl[0]}</p>
				{/if}
			</div>
			<div class="space-y-2">
				<Label for="create-status">Status</Label>
				<select id="create-status" name="isActive" class="h-10 w-full rounded-md border border-slate-200 px-3 text-sm">
					<option value="true">Aktif</option>
					<option value="false">Nonaktif</option>
				</select>
			</div>
			<Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">Simpan</Button>
		</form>
	</Dialog>

	{#if editingUser}
		<Dialog bind:open={showEditModal} title={`Edit ${editingUser.fullName}`}>
			<form method="POST" action="?/update" class="space-y-4">
				<input type="hidden" name="id" value={editingUser.id} />
				<div class="space-y-2">
					<Label for="edit-fullName">Nama lengkap</Label>
					<Input id="edit-fullName" name="fullName" value={editingUser.fullName} required />
					{#if data.form?.form === 'update' && data.form.errors?.fullName}
						<p class="text-xs text-red-500">{data.form.errors.fullName[0]}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="edit-email">Email</Label>
					<Input id="edit-email" name="email" type="email" value={editingUser.email} required />
					{#if data.form?.form === 'update' && data.form.errors?.email}
						<p class="text-xs text-red-500">{data.form.errors.email[0]}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="edit-role">Role</Label>
					<select id="edit-role" name="roleId" class="h-10 w-full rounded-md border border-slate-200 px-3 text-sm">
						{#each data.roles as role}
							<option value={role.id} selected={role.id === editingUser.roleId}>{role.name}</option>
						{/each}
					</select>
					{#if data.form?.form === 'update' && data.form.errors?.roleId}
						<p class="text-xs text-red-500">{data.form.errors.roleId[0]}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="edit-avatar">URL avatar</Label>
					<Input id="edit-avatar" name="avatarUrl" value={editingUser.avatarUrl ?? ''} />
					{#if data.form?.form === 'update' && data.form.errors?.avatarUrl}
						<p class="text-xs text-red-500">{data.form.errors.avatarUrl[0]}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="edit-status">Status</Label>
					<select id="edit-status" name="isActive" class="h-10 w-full rounded-md border border-slate-200 px-3 text-sm">
						<option value="true" selected={editingUser.isActive}>Aktif</option>
						<option value="false" selected={!editingUser.isActive}>Nonaktif</option>
					</select>
				</div>
				<Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">Perbarui</Button>
			</form>
		</Dialog>
	{/if}

	{#if resettingUser}
		<Dialog bind:open={showResetModal} title={`Reset kata sandi ${resettingUser.fullName}`}>
			<form method="POST" action="?/reset" class="space-y-4">
				<input type="hidden" name="id" value={resettingUser.id} />
				<div class="space-y-2">
					<Label for="reset-password">Kata sandi baru</Label>
					<Input id="reset-password" name="password" type="password" minlength="8" required />
					{#if data.form?.form === 'reset' && data.form.errors?.password}
						<p class="text-xs text-red-500">{data.form.errors.password[0]}</p>
					{/if}
				</div>
				<Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">Reset</Button>
			</form>
		</Dialog>
	{/if}
</div>
