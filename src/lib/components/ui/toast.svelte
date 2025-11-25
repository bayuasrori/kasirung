<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { CheckCircle, XCircle, AlertCircle } from 'lucide-svelte';

	export let show = false;
	export let message = '';
	export let type: 'success' | 'error' | 'warning' = 'success';
	export let duration = 5000;

	let timeoutId: ReturnType<typeof setTimeout> | undefined;

	onMount(() => {
		if (show) {
			timeoutId = setTimeout(() => {
				show = false;
			}, duration);
		}
	});

	function dismiss() {
		if (timeoutId) clearTimeout(timeoutId);
		show = false;
	}

	$: icon = type === 'success' ? CheckCircle : type === 'error' ? XCircle : AlertCircle;
	$: bgColor = type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800';
	$: iconColor = type === 'success' ? 'text-green-600' : type === 'error' ? 'text-red-600' : 'text-yellow-600';
</script>

{#if show}
	<div 
		transition:fly={{ y: -20, duration: 300 }}
		class="fixed top-4 right-4 z-50 flex items-center gap-3 p-4 rounded-lg border {bgColor} shadow-lg max-w-md"
		role="alert"
	>
		<span class={iconColor}>
			<svelte:component this={icon} class="h-5 w-5" />
		</span>
		<p class="text-sm font-medium flex-1">{message}</p>
		<button
			type="button"
			on:click={dismiss}
			class="text-current opacity-60 hover:opacity-100 transition-opacity ml-2"
			aria-label="Tutup notifikasi"
		>
			X
		</button>
	</div>
{/if}
