<script lang="ts">
	export let href: string | undefined = undefined;
	export let onClick: (() => void) | undefined = undefined;
	export let icon = '';
	export let danger = false;

	function handleClick() {
		if (onClick) {
			onClick();
		}
	}
</script>

{#if href}
	<a
		href={href}
		class="flex items-center gap-2 px-3 py-2 text-sm transition {$$props.class ?? ''} {danger 
			? 'text-red-600 hover:bg-red-50' 
			: 'text-slate-700 hover:bg-slate-100'}"
		{...$$restProps}
	>
		{#if icon}<span class="h-4 w-4">{@html icon}</span>{/if}
		<slot />
	</a>
{:else}
	<button
		type="button"
		on:click={handleClick}
		class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition {$$props.class ?? ''} {danger 
			? 'text-red-600 hover:bg-red-50' 
			: 'text-slate-700 hover:bg-slate-100'}"
		{...$$restProps}
	>
		{#if icon}<span class="h-4 w-4">{@html icon}</span>{/if}
		<slot />
	</button>
{/if}
