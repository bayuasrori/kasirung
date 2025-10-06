<script lang="ts">
	import { cn } from '$lib/utils/cn';
	export let className = '';
	$: computedClass = cn('rounded-2xl border border-slate-200 bg-white shadow-sm', className);
</script>

<div class={computedClass} {...$$restProps}>
	<slot />
</div>
