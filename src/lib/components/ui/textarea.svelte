<script lang="ts">
	import type { HTMLTextAreaAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils/cn';

	export let className = '';
	export let value: HTMLTextAreaAttributes['value'] = undefined;
	export let disabled = false;
	export let rows: HTMLTextAreaAttributes['rows'] = 3;

	$: computedClass = cn(
		'flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
		className
	);
</script>

<textarea bind:value {rows} {disabled} class={computedClass} {...$$restProps}></textarea>
