<script lang="ts">
	import { cva, type VariantProps } from 'class-variance-authority';
	import { cn } from '$lib/utils/cn';

	const badgeVariants = cva('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', {
		variants: {
			variant: {
				default: 'bg-blue-100 text-blue-700',
				success: 'bg-emerald-100 text-emerald-700',
				warning: 'bg-amber-100 text-amber-700',
				destructive: 'bg-red-100 text-red-700',
				muted: 'bg-slate-100 text-slate-600'
			}
		},
		defaultVariants: { variant: 'default' }
	});

	type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

	export let variant: BadgeVariant = 'default';
	export let className = '';

	$: computedClass = cn(badgeVariants({ variant }), className);
</script>

<span class={computedClass} {...$$restProps}>
	<slot />
</span>
