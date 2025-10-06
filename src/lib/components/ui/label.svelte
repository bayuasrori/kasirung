<script lang="ts">
	import type { HTMLLabelAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils/cn';

	export let className = '';
	$: computedClass = cn('text-sm font-medium text-slate-700', className);
</script>

<label class={computedClass} {...$$restProps}>
	<slot />
</label>
