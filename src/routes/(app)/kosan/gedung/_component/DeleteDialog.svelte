<script lang="ts">
	import Dialog from '$lib/components/ui/dialog.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import type { FormState, GedungItem } from './types';

	export let open = false;
	export let gedung: GedungItem | null = null;
	export let formState: FormState | null = null;

	const errors = formState?.form === 'delete' ? formState.errors : undefined;
</script>

<Dialog bind:open title="Hapus gedung">
	{#if gedung}
		<form method="POST" action="?/delete" class="space-y-4">
			<input type="hidden" name="id" value={gedung.id} />
			<p class="text-sm text-slate-600">
				Apakah Anda yakin ingin menghapus
				<span class="font-semibold">{gedung.namaGedung}</span>? Tindakan ini tidak dapat dibatalkan.
			</p>

			{#if errors?.root}
				<p class="text-sm text-red-500">{errors.root[0]}</p>
			{/if}

			<div class="flex justify-end gap-2">
				<Button type="button" variant="ghost" on:click={() => (open = false)}>Batal</Button>
				<Button type="submit" className="bg-red-500 hover:bg-red-600">Hapus</Button>
			</div>
		</form>
	{/if}
</Dialog>
