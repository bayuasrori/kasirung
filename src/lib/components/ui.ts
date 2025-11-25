// UI Components exports
export type { ComponentType } from 'svelte';

// Re-export individual Svelte components with proper typing
export { default as Avatar } from './ui/avatar.svelte';
export { default as Badge } from './ui/badge.svelte';
export { default as Button } from './ui/button.svelte';
export { default as Card } from './ui/card.svelte';
export { default as CardContent } from './ui/card-content.svelte';
export { default as CardDescription } from './ui/card-description.svelte';
export { default as CardFooter } from './ui/card-footer.svelte';
export { default as CardHeader } from './ui/card-header.svelte';
export { default as CardTitle } from './ui/card-title.svelte';
export { default as Dialog } from './ui/dialog.svelte';
export { default as Input } from './ui/input.svelte';
export { default as Label } from './ui/label.svelte';
export { default as Select } from './ui/select.svelte';
export { default as Textarea } from './ui/textarea.svelte';

// Data table component types for when needed
export type ColumnDef<T = any> = {
    accessorKey?: string;
    header: string;
    cell?: ({ row }: { row: { getValue: (key: string) => any; original: T } }) => any;
};
