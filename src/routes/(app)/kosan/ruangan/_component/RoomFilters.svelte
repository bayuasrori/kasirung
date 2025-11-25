<script lang="ts">
	import { Filter } from 'lucide-svelte';

	import Button from '$lib/components/ui/button.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Select from '$lib/components/ui/select.svelte';
	import type { GedungOption } from './types';

	export let gedungList: GedungOption[] = [];
	export let gedungId = '';
	export let status = '';
</script>

<form method="GET" class="grid gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur md:grid-cols-[240px_200px_auto]">
	<div class="space-y-2">
		<Label for="gedungFilter">Filter gedung</Label>
		<Select id="gedungFilter" name="gedungId" bind:value={gedungId}>
			<option value="">Semua gedung</option>
			{#each gedungList as gedungItem (gedungItem.id)}
				<option value={gedungItem.id}>{gedungItem.namaGedung}</option>
			{/each}
		</Select>
	</div>
	<div class="space-y-2">
		<Label for="statusFilter">Status</Label>
		<Select id="statusFilter" name="status" bind:value={status}>
			<option value="">Semua status</option>
			<option value="kosong">Kosong</option>
			<option value="terisi">Terisi</option>
		</Select>
	</div>
	<div class="flex items-end">
		<Button type="submit" className="w-full gap-2">
			<Filter class="h-4 w-4" />
			Terapkan
		</Button>
	</div>
</form>
