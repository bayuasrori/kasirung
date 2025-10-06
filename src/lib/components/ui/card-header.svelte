<script lang="ts">
	import { cn } from '$lib/utils/cn';
	export let className = '';
	$: computedClass = cn('border-b border-slate-100 px-6 py-4', className);
</script>

<div class={computedClass} {...$$restProps}>
	<slot />
</div>
