<script lang="ts">
	import Dialog from '$lib/components/ui/dialog.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Select from '$lib/components/ui/select.svelte';
	import Button from '$lib/components/ui/button.svelte';

	import type { FormState, GedungOption, RoomItem } from './types';

	export let open = false;
	export let gedungList: GedungOption[] = [];
	export let room: RoomItem | null = null;
	export let formState: FormState | null = null;

	const errors = formState?.form === 'update' ? formState.errors : undefined;
</script>

<Dialog bind:open title="Edit ruangan">
	{#if room}
		<form method="POST" action="?/update" class="space-y-4">
			<input type="hidden" name="id" value={room.id} />
			<div class="space-y-2">
				<Label for="editGedung">Gedung</Label>
				<Select id="editGedung" name="gedungId" required>
					{#each gedungList as gedungItem (gedungItem.id)}
						<option value={gedungItem.id} selected={gedungItem.id === room.gedungId}>
							{gedungItem.namaGedung}
						</option>
					{/each}
				</Select>
			</div>
			<div class="space-y-2">
				<Label for="editNama">Nama ruangan</Label>
				<Input id="editNama" name="namaRuangan" value={room.namaRuangan} required />
			</div>
			<div class="grid gap-3 md:grid-cols-2">
				<div class="space-y-2">
					<Label for="editLantai">Lantai</Label>
					<Input id="editLantai" name="lantai" value={room.lantai ?? ''} />
				</div>
				<div class="space-y-2">
					<Label for="editKapasitas">Kapasitas</Label>
					<Input id="editKapasitas" name="kapasitas" type="number" min="1" value={room.kapasitas} required />
				</div>
			</div>
			<div class="space-y-2">
				<Label for="editHarga">Harga bulanan (Rp)</Label>
				<Input id="editHarga" name="hargaBulanan" type="number" min="0" step="100000" value={room.hargaBulanan} required />
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
				<Button type="submit">Simpan perubahan</Button>
			</div>
		</form>
	{/if}
</Dialog>
