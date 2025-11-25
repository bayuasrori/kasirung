<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { LogOut, Phone, Mail, Building2, CalendarDays } from 'lucide-svelte';

	import Button from '$lib/components/ui/button.svelte';

	import type { PenghuniItem } from './types';

	export let items: PenghuniItem[] = [];

	const dispatch = createEventDispatcher<{ keluar: PenghuniItem }>();

	const formatCurrency = (value: number) =>
		`Rp ${value.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
	const formatDate = (date: Date | string | null) => {
		if (!date) return '-';
		const value = typeof date === 'string' ? date : date.toISOString();
		return new Date(value).toLocaleDateString('id-ID');
	};
</script>

<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
	<table class="min-w-full divide-y divide-slate-200 text-sm">
		<thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
			<tr>
				<th class="px-4 py-3">Penghuni</th>
				<th class="px-4 py-3">Kontak</th>
				<th class="px-4 py-3">Gedung &amp; Kamar</th>
				<th class="px-4 py-3">Periode</th>
				<th class="px-4 py-3 text-right">Tarif</th>
				<th class="px-4 py-3 text-right">Aksi</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-slate-100">
			{#if items.length}
				{#each items as penghuni (penghuni.id)}
					<tr class="hover:bg-blue-50/40">
						<td class="px-4 py-3">
							<p class="font-medium text-slate-900">{penghuni.pelangganNama}</p>
							<p class={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${penghuni.status === 'aktif' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
								{penghuni.status === 'aktif' ? 'Aktif' : 'Keluar'}
							</p>
						</td>
						<td class="space-y-1 px-4 py-3 text-slate-600">
							{#if penghuni.pelangganPhone}
								<p class="flex items-center gap-2">
									<Phone class="h-3.5 w-3.5 text-slate-400" />
									{penghuni.pelangganPhone}
								</p>
							{/if}
							{#if penghuni.pelangganEmail}
								<p class="flex items-center gap-2">
									<Mail class="h-3.5 w-3.5 text-slate-400" />
									{penghuni.pelangganEmail}
								</p>
							{/if}
							{#if !penghuni.pelangganPhone && !penghuni.pelangganEmail}
								<p class="text-xs text-slate-400">Tidak ada kontak.</p>
							{/if}
						</td>
						<td class="px-4 py-3 text-slate-600">
							<p class="flex items-center gap-2">
								<Building2 class="h-4 w-4 text-slate-400" />
								{penghuni.gedungNama}
							</p>
							<p class="mt-1 text-xs text-slate-500">Kamar {penghuni.ruanganNama}</p>
						</td>
						<td class="px-4 py-3 text-slate-600">
							<p class="flex items-center gap-2">
								<CalendarDays class="h-4 w-4 text-slate-400" />
								Masuk: {formatDate(penghuni.tanggalMasuk)}
							</p>
							<p class="flex items-center gap-2">
								<CalendarDays class="h-4 w-4 text-slate-400" />
								Keluar: {formatDate(penghuni.tanggalKeluar)}
							</p>
						</td>
						<td class="px-4 py-3 text-right font-semibold text-slate-900">
							{formatCurrency(penghuni.hargaBulanan)}
						</td>
						<td class="px-4 py-3 text-right">
							{#if penghuni.status === 'aktif'}
								<Button
									variant="outline"
									size="sm"
									className="gap-2 border-amber-300 text-amber-600"
									on:click={() => dispatch('keluar', penghuni)}
								>
									<LogOut class="h-4 w-4" /> Keluar
								</Button>
							{/if}
						</td>
					</tr>
				{/each}
			{:else}
				<tr>
					<td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">Belum ada data penghuni.</td>
				</tr>
			{/if}
		</tbody>
	</table>
</div>
