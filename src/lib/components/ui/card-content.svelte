<script lang="ts">
	import { cn } from '$lib/utils/cn';
	export let className = '';
	$: computedClass = cn('px-6 py-4', className);
</script>

<div class={computedClass} {...$$restProps}>
	<slot />
</div>
