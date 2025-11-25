<script lang="ts">
	import Dialog from '$lib/components/ui/dialog.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Button from '$lib/components/ui/button.svelte';

	import type { FormState, GedungItem } from './types';

	export let open = false;
	export let gedung: GedungItem | null = null;
	export let formState: FormState | null = null;

	const errors = formState?.form === 'update' ? formState.errors : undefined;
</script>

<Dialog bind:open title="Edit gedung">
	{#if gedung}
		<form method="POST" action="?/update" class="space-y-4">
			<input type="hidden" name="id" value={gedung.id} />
			<div class="space-y-2">
				<Label for="editNamaGedung">Nama gedung</Label>
				<Input id="editNamaGedung" name="namaGedung" value={gedung.namaGedung} required />
			</div>
			<div class="space-y-2">
				<Label for="editAlamat">Alamat</Label>
				<Textarea id="editAlamat" name="alamat" rows={2} value={gedung.alamat} required />
			</div>
			<div class="space-y-2">
				<Label for="editKeterangan">Keterangan</Label>
				<Textarea id="editKeterangan" name="keterangan" rows={2} value={gedung.keterangan ?? ''} />
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
