<script lang="ts">
	import { cn } from '$lib/utils/cn';

	export let name = '';
	export let email = '';
	export let className = '';

	const initials = name
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join('') || email[0]?.toUpperCase() || 'U';

	$: computedClass = cn(
		'flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 text-sm font-semibold text-white shadow-sm',
		className
	);
</script>

<div class={computedClass} aria-label={`Avatar ${name || email}`} {...$$restProps}>
	{initials}
</div>
