<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { cva, type VariantProps } from 'class-variance-authority';
	import { cn } from '$lib/utils/cn';

	const buttonVariants = cva(
		'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 ring-offset-background',
		{
			variants: {
				variant: {
					default: 'bg-blue-600 text-white hover:bg-blue-500',
					secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
					outline: 'border border-slate-200 bg-transparent hover:bg-slate-100',
					ghost: 'hover:bg-slate-100 text-slate-600',
					destructive: 'bg-red-600 text-white hover:bg-red-500'
				},
				size: {
					default: 'h-10 px-4 py-2',
					sm: 'h-9 rounded-md px-3',
					lg: 'h-11 rounded-md px-5 text-base',
					icon: 'h-10 w-10'
				}
			},
			defaultVariants: {
				variant: 'default',
				size: 'default'
			}
		}
	);

	export type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];
	export type ButtonSize = VariantProps<typeof buttonVariants>['size'];

	export let variant: ButtonVariant = 'default';
	export let size: ButtonSize = 'default';
	export let className = '';
	export let type: HTMLButtonAttributes['type'] = 'button';
	export let href: HTMLAnchorAttributes['href'] | undefined = undefined;
	export let disabled = false;

	const dispatch = createEventDispatcher<{
		click: MouseEvent;
	}>();

	let element: 'button' | 'a' = href ? 'a' : 'button';

	$: element = href ? 'a' : 'button';
	$: computedClass = cn(buttonVariants({ variant, size }), className);

	function handleClick(event: MouseEvent) {
		if (disabled) {
			event.preventDefault();
			return;
		}
		dispatch('click', event);
	}
</script>

<svelte:element
	this={element}
	class={computedClass}
	{href}
	on:click={handleClick}
	type={element === 'button' ? type : undefined}
	data-variant={variant}
	data-size={size}
	disabled={element === 'button' ? disabled : undefined}
	aria-disabled={disabled}
	{...$$restProps}
>
	<slot />
</svelte:element>
