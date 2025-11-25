<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Building2, BedDouble, Pencil, Trash2 } from 'lucide-svelte';

	import Button from '$lib/components/ui/button.svelte';
	import type { RoomItem } from './types';

	export let rooms: RoomItem[] = [];

	const dispatch = createEventDispatcher<{ edit: RoomItem; delete: RoomItem }>();
	const formatCurrency = (value: number) =>
		`Rp ${value.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
</script>

<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
	<table class="min-w-full divide-y divide-slate-200 text-sm">
		<thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
			<tr>
				<th class="px-4 py-3">Ruangan</th>
				<th class="px-4 py-3">Gedung</th>
				<th class="px-4 py-3 text-center">Kapasitas</th>
				<th class="px-4 py-3 text-center">Status</th>
				<th class="px-4 py-3 text-right">Harga bulanan</th>
				<th class="px-4 py-3 text-right">Aksi</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-slate-100">
			{#if rooms.length}
				{#each rooms as room (room.id)}
					<tr class="hover:bg-blue-50/40">
						<td class="px-4 py-3">
							<p class="font-medium text-slate-900">{room.namaRuangan}</p>
							{#if room.lantai}
								<p class="text-xs text-slate-500">Lantai {room.lantai}</p>
							{/if}
						</td>
						<td class="px-4 py-3 text-slate-600">
							<Building2 class="mr-2 inline h-4 w-4 text-slate-400" />
							{room.gedungNama}
						</td>
						<td class="px-4 py-3 text-center">
							<BedDouble class="mr-1 inline h-4 w-4 text-slate-400" />
							{room.kapasitas}
						</td>
						<td class="px-4 py-3 text-center">
							{#if room.status === 'kosong'}
								<span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
									Kosong
								</span>
							{:else}
								<span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
									Terisi ({room.penghuniAktif})
								</span>
							{/if}
						</td>
						<td class="px-4 py-3 text-right font-semibold text-slate-900">
							{formatCurrency(room.hargaBulanan)}
						</td>
						<td class="px-4 py-3 text-right">
							<div class="flex justify-end gap-2">
								<Button variant="ghost" size="sm" className="text-blue-600" on:click={() => dispatch('edit', room)}>
									<Pencil class="h-4 w-4" />
								</Button>
								<Button variant="ghost" size="sm" className="text-red-500" on:click={() => dispatch('delete', room)}>
									<Trash2 class="h-4 w-4" />
								</Button>
							</div>
						</td>
					</tr>
				{/each}
			{:else}
				<tr>
					<td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">
						Belum ada ruangan yang terdaftar.
					</td>
				</tr>
			{/if}
		</tbody>
	</table>
</div>
