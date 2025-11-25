<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import type { RoleOption, UserFiltersState } from './types';

	export let filters: UserFiltersState;
	export let roles: RoleOption[] = [];
</script>

<form
	method="GET"
	class="grid gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur md:grid-cols-[minmax(200px,1fr)_180px_160px_160px_120px]"
>
	<div class="space-y-2">
		<Label for="search">Cari</Label>
		<Input id="search" name="search" placeholder="Nama atau email" bind:value={filters.search} />
	</div>
	<div class="space-y-2">
		<Label for="role">Role</Label>
		<select id="role" name="roleId" class="h-10 w-full rounded-md border border-slate-200 px-3 text-sm" bind:value={filters.roleId}>
			<option value="">Semua</option>
			{#each roles as role (role.id)}
				<option value={role.id}>{role.name}</option>
			{/each}
		</select>
	</div>
	<div class="space-y-2">
		<Label for="status">Status</Label>
		<select id="status" name="status" class="h-10 w-full rounded-md border border-slate-200 px-3 text-sm" bind:value={filters.status}>
			<option value="">Semua</option>
			<option value="active">Aktif</option>
			<option value="inactive">Nonaktif</option>
		</select>
	</div>
	<div class="space-y-2">
		<Label for="sortBy">Urutkan</Label>
		<select id="sortBy" name="sortBy" class="h-10 w-full rounded-md border border-slate-200 px-3 text-sm" bind:value={filters.sortBy}>
			<option value="createdAt">Terbaru</option>
			<option value="fullName">Nama</option>
			<option value="email">Email</option>
		</select>
	</div>
	<div class="space-y-2">
		<Label for="sortDir">Arah</Label>
		<select id="sortDir" name="sortDir" class="h-10 w-full rounded-md border border-slate-200 px-3 text-sm" bind:value={filters.sortDir}>
			<option value="desc">Menurun</option>
			<option value="asc">Menaik</option>
		</select>
	</div>
	<div class="flex items-end">
		<Button type="submit" className="w-full">Terapkan</Button>
	</div>
</form>
