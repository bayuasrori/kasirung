<script lang="ts">
	import { cn } from '$lib/utils/cn';
	export let className = '';
	$: computedClass = cn('text-sm text-slate-500', className);
</script>

<p class={computedClass} {...$$restProps}>
	<slot />
</p>
