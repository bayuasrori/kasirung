<script lang="ts">
	export let open = false;
	export let title = '';
	export let description = '';

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			open = false;
		}
	}
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4" on:click={handleBackdropClick}>
		<div class="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
			{#if title}
				<h3 class="text-lg font-semibold text-slate-900">{title}</h3>
			{/if}
			{#if description}
				<p class="mt-1 text-sm text-slate-500">{description}</p>
			{/if}
			<div class="mt-4">
				<slot />
			</div>
		</div>
	</div>
{/if}
