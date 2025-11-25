<script lang="ts">
	import Dialog from '$lib/components/ui/dialog.svelte';
	import Button from '$lib/components/ui/button.svelte';

	import type { FormState, PenghuniItem } from './types';

	export let open = false;
	export let penghuni: PenghuniItem | null = null;
	export let formState: FormState | null = null;

	const errors = formState?.form === 'keluar' ? formState.errors : undefined;
</script>

<Dialog bind:open title="Konfirmasi penghuni keluar">
	{#if penghuni}
		<form method="POST" action="?/keluar" class="space-y-4">
			<input type="hidden" name="id" value={penghuni.id} />
			<p class="text-sm text-slate-600">
				Tandai penghuni <span class="font-semibold">{penghuni.pelangganNama}</span> keluar dari kamar
				<span class="font-semibold">{penghuni.ruanganNama}</span> di gedung {penghuni.gedungNama}? Tanggal keluar akan diisi otomatis hari ini.
			</p>

			{#if errors}
				{#each Object.entries(errors) as [field, messages] (field)}
					{#if messages?.length}
						<p class="text-sm text-red-500">{messages[0]}</p>
					{/if}
				{/each}
			{/if}

			<div class="flex justify-end gap-2">
				<Button type="button" variant="ghost" on:click={() => (open = false)}>Batal</Button>
				<Button type="submit" className="bg-amber-500 hover:bg-amber-600">Tandai keluar</Button>
			</div>
		</form>
	{/if}
</Dialog>
