<script lang="ts">
	import { page } from '$app/stores';
	import { Plus, Pencil, Trash2 } from 'lucide-svelte';

	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Dialog from '$lib/components/ui/dialog.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';
	import type { MenuKey } from '$lib/navigation/menus';

	type FormState = {
		form?: 'create' | 'update' | 'delete';
		errors?: Record<string, string[]>;
		values?: Record<string, unknown>;
	};

	interface RoleItem {
		id: number;
		name: string;
		description: string | null;
		userCount: number;
		createdAt: Date;
		updatedAt: Date;
		permissions: MenuKey[];
	}

	interface MenuSection {
		label: string;
		items: Array<{ key: MenuKey; label: string }>;
	}

	export let data: {
		roles: RoleItem[];
		total: number;
		page: number;
		pageCount: number;
		filters: { search: string; sortBy: string; sortDir: string };
		menuSections: MenuSection[];
		form?: FormState | null;
	};

	let showCreateModal = false;
	let showEditModal = false;
	let editingRole: RoleItem | null = null;

	let search = data.filters.search;
	let sortBy = data.filters.sortBy;
	let sortDir = data.filters.sortDir;

	const permissionLabelMap = new Map<MenuKey, string>();
	const knownPermissionKeys = new Set<MenuKey>();

	for (const section of data.menuSections) {
		for (const item of section.items) {
			permissionLabelMap.set(item.key, item.label);
			knownPermissionKeys.add(item.key);
		}
	}

	function isMenuKeyValue(value: unknown): value is MenuKey {
		return typeof value === 'string' && knownPermissionKeys.has(value as MenuKey);
	}

	function parseFormPermissions(
		form: FormState | null | undefined,
		formName: 'create' | 'update'
	): MenuKey[] {
		if (!form || form.form !== formName) return [];
		const raw = form.values?.permissions;
		if (!Array.isArray(raw)) return [];
		const collected: MenuKey[] = [];
		for (const entry of raw) {
			if (isMenuKeyValue(entry) && !collected.includes(entry)) {
				collected.push(entry);
			}
		}
		return collected;
	}

	page.subscribe(($page) => {
		const form = $page.form as FormState | undefined;
		if (!form) return;
		if (form.form === 'create' && form.errors) showCreateModal = true;
		if (form.form === 'update' && form.errors) showEditModal = true;
	});

	function openCreate() {
		showCreateModal = true;
	}

	function openEdit(role: RoleItem) {
		editingRole = role;
		showEditModal = true;
	}

	const formatDate = (value: Date) =>
		new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

	$: createDefaultPermissions = parseFormPermissions(data.form, 'create');
	$: updateDefaultPermissions = parseFormPermissions(data.form, 'update');
</script>

<div class="space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div>
			<h1 class="text-xl font-semibold text-slate-900">Manajemen Role</h1>
			<p class="text-sm text-slate-500">Atur role dan hak akses yang tersedia untuk pengguna.</p>
		</div>
		<Button on:click={openCreate} className="gap-2">
			<Plus class="h-4 w-4" />
			Role Baru
		</Button>
	</div>

	<form
		method="GET"
		class="grid gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur md:grid-cols-[minmax(240px,1fr)_160px_120px]"
	>
		<div class="space-y-2">
			<Label for="search">Cari</Label>
			<Input id="search" name="search" placeholder="Nama role" bind:value={search} />
		</div>
		<div class="space-y-2">
			<Label for="sortBy">Urutkan</Label>
			<select
				id="sortBy"
				name="sortBy"
				class="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
				bind:value={sortBy}
			>
				<option value="createdAt">Terbaru</option>
				<option value="name">Nama</option>
			</select>
		</div>
		<div class="space-y-2">
			<Label for="sortDir">Arah</Label>
			<select
				id="sortDir"
				name="sortDir"
				class="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
				bind:value={sortDir}
			>
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
			<thead
				class="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
			>
				<tr>
					<th class="px-4 py-3">Role</th>
					<th class="px-4 py-3">Deskripsi</th>
					<th class="px-4 py-3">Menu Akses</th>
					<th class="px-4 py-3 text-center">Pengguna</th>
					<th class="px-4 py-3 text-right">Diperbarui</th>
					<th class="px-4 py-3 text-right">Aksi</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-slate-100">
				{#if data.roles.length}
					{#each data.roles as role}
						<tr class="hover:bg-blue-50/40">
							<td class="px-4 py-3">
								<p class="font-medium text-slate-900">{role.name}</p>
								<p class="text-xs text-slate-500">Dibuat {formatDate(role.createdAt)}</p>
							</td>
							<td class="px-4 py-3 text-slate-600">{role.description ?? '-'}</td>
							<td class="px-4 py-3">
								{#if role.permissions.length}
									<div class="flex flex-wrap gap-1">
										{#each role.permissions as perm}
											<Badge variant="muted">{permissionLabelMap.get(perm) ?? perm}</Badge>
										{/each}
									</div>
								{:else}
									<span class="text-xs text-slate-400">Tidak ada</span>
								{/if}
							</td>
							<td class="px-4 py-3 text-center">
								<Badge variant="muted">{role.userCount} pengguna</Badge>
							</td>
							<td class="px-4 py-3 text-right text-slate-500">{formatDate(role.updatedAt)}</td>
							<td class="px-4 py-3 text-right">
								<div class="flex justify-end gap-2">
									<Button
										variant="ghost"
										size="sm"
										className="text-blue-600"
										on:click={() => openEdit(role)}
									>
										<Pencil class="h-4 w-4" />
									</Button>
									<form method="POST" action="?/delete" class="inline-flex">
										<input type="hidden" name="id" value={role.id} />
										<Button
											type="submit"
											variant="ghost"
											size="sm"
											disabled={role.userCount > 0}
											className={role.userCount > 0 ? 'text-slate-300' : 'text-red-600'}
										>
											<Trash2 class="h-4 w-4" />
										</Button>
									</form>
								</div>
							</td>
						</tr>
					{/each}
				{:else}
					<tr>
						<td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500"
							>Belum ada role yang terdaftar.</td
						>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>

	{#if data.pageCount > 1}
		<div
			class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600"
		>
			<p>Halaman {data.page} dari {data.pageCount}</p>
			<div class="flex items-center gap-2">
				{#if data.page > 1}
					<a
						class="rounded-lg border border-slate-200 px-3 py-1"
						href={`?${new URLSearchParams({ ...data.filters, page: String(data.page - 1) }).toString()}`}
					>
						Sebelumnya
					</a>
				{/if}
				{#if data.page < data.pageCount}
					<a
						class="rounded-lg border border-slate-200 px-3 py-1"
						href={`?${new URLSearchParams({ ...data.filters, page: String(data.page + 1) }).toString()}`}
					>
						Berikutnya
					</a>
				{/if}
			</div>
		</div>
	{/if}

	<Dialog bind:open={showCreateModal} title="Role baru">
		<form method="POST" action="?/create" class="space-y-4">
			<div class="space-y-2">
				<Label for="create-name">Nama role</Label>
				<Input id="create-name" name="name" required />
				{#if data.form?.form === 'create' && data.form.errors?.name}
					<p class="text-xs text-red-500">{data.form.errors.name[0]}</p>
				{/if}
			</div>
			<div class="space-y-2">
				<Label for="create-description">Deskripsi</Label>
				<Textarea
					id="create-description"
					name="description"
					rows={3}
					placeholder="Tanggung jawab role (opsional)"
				/>
				{#if data.form?.form === 'create' && data.form.errors?.description}
					<p class="text-xs text-red-500">{data.form.errors.description[0]}</p>
				{/if}
			</div>
			<div class="space-y-3">
				<p class="text-sm font-medium text-slate-700">Akses Menu</p>
				{#each data.menuSections as section}
					<div class="rounded-xl border border-slate-200 bg-slate-50/40 p-3">
						<p class="text-xs font-semibold tracking-wide text-slate-400 uppercase">
							{section.label}
						</p>
						<div class="mt-2 flex flex-wrap gap-3">
							{#each section.items as item}
								<label class="flex items-center gap-2 text-sm text-slate-600">
									<input
										type="checkbox"
										name="permissions"
										value={item.key}
										class="rounded border-slate-300"
										checked={createDefaultPermissions.includes(item.key)}
									/>
									<span>{item.label}</span>
								</label>
							{/each}
						</div>
					</div>
				{/each}
				{#if data.form?.form === 'create' && data.form.errors?.permissions}
					<p class="text-xs text-red-500">{data.form.errors.permissions[0]}</p>
				{/if}
			</div>
			<Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">Simpan</Button>
		</form>
	</Dialog>

	{#if editingRole}
		<Dialog bind:open={showEditModal} title={`Edit ${editingRole.name}`}>
			<form method="POST" action="?/update" class="space-y-4">
				<input type="hidden" name="id" value={editingRole.id} />
				<div class="space-y-2">
					<Label for="edit-name">Nama role</Label>
					<Input id="edit-name" name="name" value={editingRole.name} required />
					{#if data.form?.form === 'update' && data.form.errors?.name}
						<p class="text-xs text-red-500">{data.form.errors.name[0]}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="edit-description">Deskripsi</Label>
					<Textarea id="edit-description" name="description" rows={3}
						>{editingRole.description ?? ''}</Textarea
					>
					{#if data.form?.form === 'update' && data.form.errors?.description}
						<p class="text-xs text-red-500">{data.form.errors.description[0]}</p>
					{/if}
				</div>
				<div class="space-y-3">
					<p class="text-sm font-medium text-slate-700">Akses Menu</p>
					{#each data.menuSections as section}
						<div class="rounded-xl border border-slate-200 bg-slate-50/40 p-3">
							<p class="text-xs font-semibold tracking-wide text-slate-400 uppercase">
								{section.label}
							</p>
							<div class="mt-2 flex flex-wrap gap-3">
								{#each section.items as item}
									<label class="flex items-center gap-2 text-sm text-slate-600">
										<input
											type="checkbox"
											name="permissions"
											value={item.key}
											class="rounded border-slate-300"
											checked={(updateDefaultPermissions.length
												? updateDefaultPermissions
												: editingRole.permissions
											).includes(item.key)}
										/>
										<span>{item.label}</span>
									</label>
								{/each}
							</div>
						</div>
					{/each}
					{#if data.form?.form === 'update' && data.form.errors?.permissions}
						<p class="text-xs text-red-500">{data.form.errors.permissions[0]}</p>
					{/if}
				</div>
				<Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">Perbarui</Button>
			</form>
		</Dialog>
	{/if}
</div>
