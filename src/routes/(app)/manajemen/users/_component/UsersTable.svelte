<script lang="ts">
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { Pencil, RefreshCcw, Shield, Power } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';

	import type { UserItem } from './types';

	export let users: UserItem[] = [];

	const dispatch = createEventDispatcher<{ edit: UserItem; reset: UserItem }>();

	const formatDate = (value: Date) =>
		new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
	const statusVariant = (active: boolean) => (active ? 'success' : 'destructive');
	const statusLabel = (active: boolean) => (active ? 'Aktif' : 'Nonaktif');
</script>

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
			{#if users.length}
				{#each users as user (user.id)}
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
								<Button variant="ghost" size="sm" className="text-blue-600" on:click={() => dispatch('edit', user)}>
									<Pencil class="h-4 w-4" />
								</Button>
								<Button variant="ghost" size="sm" className="text-amber-600" on:click={() => dispatch('reset', user)}>
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
