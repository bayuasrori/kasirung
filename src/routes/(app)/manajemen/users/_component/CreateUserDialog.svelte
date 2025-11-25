<script lang="ts">
	import Dialog from '$lib/components/ui/dialog.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Button from '$lib/components/ui/button.svelte';

	import type { FormState, RoleOption } from './types';

	export let open = false;
	export let roles: RoleOption[] = [];
	export let formState: FormState | null = null;

	const errors = formState?.form === 'create' ? formState.errors : undefined;
</script>

<Dialog bind:open title="Tambah pengguna">
	<form method="POST" action="?/create" class="space-y-4">
		<div class="space-y-2">
			<Label for="create-fullName">Nama lengkap</Label>
			<Input id="create-fullName" name="fullName" required />
			{#if errors?.fullName}
				<p class="text-xs text-red-500">{errors.fullName[0]}</p>
			{/if}
		</div>
		<div class="space-y-2">
			<Label for="create-email">Email</Label>
			<Input id="create-email" name="email" type="email" required />
			{#if errors?.email}
				<p class="text-xs text-red-500">{errors.email[0]}</p>
			{/if}
		</div>
		<div class="space-y-2">
			<Label for="create-password">Kata sandi awal</Label>
			<Input id="create-password" name="password" type="password" minlength="8" required />
			{#if errors?.password}
				<p class="text-xs text-red-500">{errors.password[0]}</p>
			{/if}
		</div>
		<div class="space-y-2">
			<Label for="create-role">Role</Label>
			<select id="create-role" name="roleId" class="h-10 w-full rounded-md border border-slate-200 px-3 text-sm" required>
				<option value="">Pilih role</option>
				{#each roles as role (role.id)}
					<option value={role.id}>{role.name}</option>
				{/each}
			</select>
			{#if errors?.roleId}
				<p class="text-xs text-red-500">{errors.roleId[0]}</p>
			{/if}
		</div>
		<div class="space-y-2">
			<Label for="create-avatar">URL avatar (opsional)</Label>
			<Input id="create-avatar" name="avatarUrl" placeholder="https://" />
			{#if errors?.avatarUrl}
				<p class="text-xs text-red-500">{errors.avatarUrl[0]}</p>
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
