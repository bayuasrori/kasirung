<script lang="ts">
	export let orientation: 'horizontal' | 'vertical' = 'horizontal';
	export let className = '';
	export let decorative = false;

	const base =
		'shrink-0 bg-slate-200 dark:bg-slate-800';
	const size = orientation === 'vertical' ? 'w-px h-full' : 'h-px w-full';
</script>

<div
	role={decorative ? undefined : 'separator'}
	aria-orientation={orientation}
	class={`${base} ${size} ${className}`.trim()}
></div>
