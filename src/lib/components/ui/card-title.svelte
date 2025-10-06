<script lang="ts">
	import { cn } from '$lib/utils/cn';
	export let className = '';
	$: computedClass = cn('text-lg font-semibold text-slate-900', className);
</script>

<h3 class={computedClass} {...$$restProps}>
	<slot />
</h3>
