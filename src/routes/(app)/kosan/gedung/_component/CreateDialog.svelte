<script lang="ts">
	import Dialog from '$lib/components/ui/dialog.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Button from '$lib/components/ui/button.svelte';

	import type { FormState } from './types';

	export let open = false;
	export let formState: FormState | null = null;

	const errors = formState?.form === 'create' ? formState.errors : undefined;
</script>

<Dialog bind:open title="Tambah gedung">
	<form method="POST" action="?/create" class="space-y-4">
		<div class="space-y-2">
			<Label for="namaGedung">Nama gedung</Label>
			<Input id="namaGedung" name="namaGedung" placeholder="Contoh: Gedung Melati" required />
		</div>
		<div class="space-y-2">
			<Label for="alamat">Alamat</Label>
			<Textarea id="alamat" name="alamat" rows={2} placeholder="Jalan dan kota" required />
		</div>
		<div class="space-y-2">
			<Label for="keterangan">Keterangan</Label>
			<Textarea id="keterangan" name="keterangan" rows={2} placeholder="Catatan tambahan" />
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
