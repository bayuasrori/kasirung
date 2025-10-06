<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { HTMLSelectAttributes } from 'svelte/elements';

	export let className = '';
	export let value: HTMLSelectAttributes['value'] = undefined;
	export let disabled = false;

	$: computedClass = cn(
		'h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
		className
	);
</script>

<select bind:value {disabled} class={computedClass} {...$$restProps}>
	<slot />
</select>
