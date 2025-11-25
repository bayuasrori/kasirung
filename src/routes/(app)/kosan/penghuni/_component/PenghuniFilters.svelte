<script lang="ts">
	import { Search } from 'lucide-svelte';

	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Select from '$lib/components/ui/select.svelte';

	export let status = '';
	export let search = '';
</script>

<form method="GET" class="grid gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur md:grid-cols-[200px_auto]">
	<div class="space-y-2">
		<Label for="status">Status</Label>
		<Select id="status" name="status" bind:value={status}>
			<option value="">Semua status</option>
			<option value="aktif">Aktif</option>
			<option value="keluar">Keluar</option>
		</Select>
	</div>
	<div class="space-y-2">
		<Label for="search">Cari penghuni</Label>
		<div class="relative">
			<Input id="search" name="search" placeholder="Nama, kamar, atau gedung" bind:value={search} className="pl-9" />
			<Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
		</div>
	</div>
	<div class="md:col-span-2 flex items-center justify-end">
		<Button type="submit" className="gap-2">
			<Search class="h-4 w-4" />
			Terapkan filter
		</Button>
	</div>
</form>
