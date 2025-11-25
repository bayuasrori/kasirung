<script lang="ts">
	import Dialog from '$lib/components/ui/dialog.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Button from '$lib/components/ui/button.svelte';

	import type { FormState, RoleOption, UserItem } from './types';

	export let open = false;
	export let roles: RoleOption[] = [];
	export let user: UserItem | null = null;
	export let formState: FormState | null = null;

	const errors = formState?.form === 'update' ? formState.errors : undefined;
</script>

<Dialog bind:open title={user ? `Edit ${user.fullName}` : 'Edit pengguna'}>
	{#if user}
		<form method="POST" action="?/update" class="space-y-4">
			<input type="hidden" name="id" value={user.id} />
			<div class="space-y-2">
				<Label for="edit-fullName">Nama lengkap</Label>
				<Input id="edit-fullName" name="fullName" value={user.fullName} required />
				{#if errors?.fullName}
					<p class="text-xs text-red-500">{errors.fullName[0]}</p>
				{/if}
			</div>
			<div class="space-y-2">
				<Label for="edit-email">Email</Label>
				<Input id="edit-email" name="email" type="email" value={user.email} required />
				{#if errors?.email}
					<p class="text-xs text-red-500">{errors.email[0]}</p>
				{/if}
			</div>
			<div class="space-y-2">
				<Label for="edit-role">Role</Label>
				<select id="edit-role" name="roleId" class="h-10 w-full rounded-md border border-slate-200 px-3 text-sm">
					{#each roles as role (role.id)}
						<option value={role.id} selected={role.id === user.roleId}>{role.name}</option>
					{/each}
				</select>
				{#if errors?.roleId}
					<p class="text-xs text-red-500">{errors.roleId[0]}</p>
				{/if}
			</div>
			<div class="space-y-2">
				<Label for="edit-avatar">URL avatar</Label>
				<Input id="edit-avatar" name="avatarUrl" value={user.avatarUrl ?? ''} />
				{#if errors?.avatarUrl}
					<p class="text-xs text-red-500">{errors.avatarUrl[0]}</p>
				{/if}
			</div>
			<div class="space-y-2">
				<Label for="edit-status">Status</Label>
				<select id="edit-status" name="isActive" class="h-10 w-full rounded-md border border-slate-200 px-3 text-sm">
					<option value="true" selected={user.isActive}>Aktif</option>
					<option value="false" selected={!user.isActive}>Nonaktif</option>
				</select>
			</div>
			<Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">Perbarui</Button>
		</form>
	{/if}
</Dialog>
