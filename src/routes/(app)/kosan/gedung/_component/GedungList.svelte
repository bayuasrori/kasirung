<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Pencil, Trash2, MapPinned, Building2, Users2 } from 'lucide-svelte';

	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import Button from '$lib/components/ui/button.svelte';

	import type { GedungItem } from './types';

	export let items: GedungItem[] = [];

	const dispatch = createEventDispatcher<{
		edit: GedungItem;
		delete: GedungItem;
	}>();
	const notify = (type: 'edit' | 'delete', item: GedungItem) => dispatch(type, item);
</script>

{#if items.length}
	<div class="grid gap-4 lg:grid-cols-2">
		{#each items as gedungItem (gedungItem.id)}
			<Card className="border-slate-200">
				<CardHeader className="flex flex-row items-start justify-between gap-3">
					<div>
						<CardTitle className="text-lg">{gedungItem.namaGedung}</CardTitle>
						<p class="mt-1 flex items-center gap-2 text-sm text-slate-500">
							<MapPinned class="h-4 w-4" />
							{gedungItem.alamat}
						</p>
					</div>
					<div class="flex gap-2">
						<Button variant="ghost" size="icon" className="text-blue-600" on:click={() => notify('edit', gedungItem)}>
							<Pencil class="h-4 w-4" />
						</Button>
						<Button variant="ghost" size="icon" className="text-red-500" on:click={() => notify('delete', gedungItem)}>
							<Trash2 class="h-4 w-4" />
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-4 text-sm text-slate-600">
					{#if gedungItem.keterangan}
						<p>{gedungItem.keterangan}</p>
					{/if}
					<div class="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
						<div class="flex items-center gap-2 text-slate-600">
							<Building2 class="h-4 w-4 text-slate-400" />
							<span>Total ruangan</span>
							<span class="ml-auto font-semibold text-slate-900">{gedungItem.totalRuangan}</span>
						</div>
						<div class="flex items-center gap-2 text-emerald-600">
							<Building2 class="h-4 w-4" />
							<span>Ruangan kosong</span>
							<span class="ml-auto font-semibold">{gedungItem.ruanganKosong}</span>
						</div>
						<div class="flex items-center gap-2 text-blue-600">
							<Users2 class="h-4 w-4" />
							<span>Penghuni aktif</span>
							<span class="ml-auto font-semibold">{gedungItem.penghuniAktif}</span>
						</div>
					</div>
				</CardContent>
			</Card>
		{/each}
	</div>
{:else}
	<div class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center text-sm text-slate-500">
		Belum ada gedung yang terdaftar. Tambahkan gedung pertama Anda.
	</div>
{/if}
