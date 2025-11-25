<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	export let open = false;
	const dispatch = createEventDispatcher();

	function toggle() {
		open = !open;
	}

	function close() {
		open = false;
		dispatch('close');
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			close();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			close();
		}
	}
</script>

<div class="relative inline-block">
	<div on:click={toggle} on:keydown={(e) => e.key === 'Enter' && toggle()} role="button" tabindex="0">
		<slot name="trigger" />
	</div>

	{#if open}
		<div
			class="fixed inset-0 z-40"
			role="presentation"
			tabindex="-1"
			on:click={handleBackdropClick}
			on:keydown={handleKeydown}
		></div>
		<div
			class="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg z-50"
			role="menu"
			tabindex="-1"
			on:click={close}
			on:keydown={(e) => e.key === 'Enter' && close()}
		>
			<slot name="content" />
		</div>
	{/if}
</div>
