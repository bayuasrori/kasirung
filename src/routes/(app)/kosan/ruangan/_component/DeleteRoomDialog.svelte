<script lang="ts">
	import Dialog from '$lib/components/ui/dialog.svelte';
	import Button from '$lib/components/ui/button.svelte';

	import type { FormState, RoomItem } from './types';

	export let open = false;
	export let room: RoomItem | null = null;
	export let formState: FormState | null = null;

	const errors = formState?.form === 'delete' ? formState.errors : undefined;
</script>

<Dialog bind:open title="Hapus ruangan">
	{#if room}
		<form method="POST" action="?/delete" class="space-y-4">
			<input type="hidden" name="id" value={room.id} />
			<p class="text-sm text-slate-600">
				Hapus ruangan <span class="font-semibold">{room.namaRuangan}</span> dari gedung {room.gedungNama}?
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
