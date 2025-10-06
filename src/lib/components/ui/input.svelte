<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils/cn';

	export let className = '';
	export let type: HTMLInputAttributes['type'] = 'text';
	export let value: HTMLInputAttributes['value'] = undefined;
	export let disabled = false;

	$: computedClass = cn(
		'flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
		className
	);
</script>

<input {type} bind:value {disabled} class={computedClass} {...$$restProps} />
