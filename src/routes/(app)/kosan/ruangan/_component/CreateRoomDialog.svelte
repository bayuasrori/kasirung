<script lang="ts">
	import Dialog from '$lib/components/ui/dialog.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Select from '$lib/components/ui/select.svelte';
	import Button from '$lib/components/ui/button.svelte';

	import type { FormState, GedungOption } from './types';

	export let open = false;
	export let gedungList: GedungOption[] = [];
	export let formState: FormState | null = null;

	const errors = formState?.form === 'create' ? formState.errors : undefined;
</script>

<Dialog bind:open title="Tambah ruangan">
	<form method="POST" action="?/create" class="space-y-4">
		<div class="space-y-2">
			<Label for="gedungId">Gedung</Label>
			<Select id="gedungId" name="gedungId" required>
				<option value="">Pilih gedung</option>
				{#each gedungList as gedungItem (gedungItem.id)}
					<option value={gedungItem.id}>{gedungItem.namaGedung}</option>
				{/each}
			</Select>
		</div>
		<div class="space-y-2">
			<Label for="namaRuangan">Nama ruangan</Label>
			<Input id="namaRuangan" name="namaRuangan" placeholder="Contoh: Kamar A-1" required />
		</div>
		<div class="grid gap-3 md:grid-cols-2">
			<div class="space-y-2">
				<Label for="lantai">Lantai</Label>
				<Input id="lantai" name="lantai" placeholder="1" />
			</div>
			<div class="space-y-2">
				<Label for="kapasitas">Kapasitas</Label>
				<Input id="kapasitas" name="kapasitas" type="number" min="1" value="1" required />
			</div>
		</div>
		<div class="space-y-2">
			<Label for="hargaBulanan">Harga bulanan (Rp)</Label>
			<Input id="hargaBulanan" name="hargaBulanan" type="number" min="0" step="100000" required />
		</div>

		{#if errors}
			{#each Object.entries(errors) as [field, messages] (field)}
				{#if messages?.length}
					<p class="text-sm text-red-500">{messages[0]}</p>
				{/if}
			{/each}
		{/if}

		<div class="flex justify-end gap-2">
			<Button type="button" variant="ghost" on:click={() => (open = false)}>Batal</Button>
			<Button type="submit">Simpan</Button>
		</div>
	</form>
</Dialog>
