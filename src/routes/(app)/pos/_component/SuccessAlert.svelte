<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import { Download } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';

	export let transactionId: string | null = null;
	export let receiptId: string | null = null;
	export let isDownloading = false;
	export let receiptError: string | null = null;

	const dispatch = createEventDispatcher<{ download: string }>();
</script>

{#if transactionId}
	<div class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 sm:flex sm:items-center sm:justify-between">
		<span>Transaksi <span class="font-semibold">{transactionId}</span> berhasil disimpan.</span>
		{#if receiptId}
			<Button
				type="button"
				variant="outline"
				className="mt-3 inline-flex items-center gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-100 sm:mt-0"
				on:click={() => dispatch('download', receiptId)}
				disabled={isDownloading}
			>
				<Download class={`h-4 w-4 ${isDownloading ? 'animate-pulse' : ''}`} />
				{isDownloading ? 'Mengunduh…' : 'Download kwitansi'}
			</Button>
		{/if}
	</div>
	{#if receiptError}
		<p class="mt-2 text-sm text-red-500">{receiptError}</p>
	{/if}
{/if}
