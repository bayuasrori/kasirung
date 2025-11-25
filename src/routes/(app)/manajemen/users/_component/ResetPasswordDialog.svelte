<script lang="ts">
	import Dialog from '$lib/components/ui/dialog.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Button from '$lib/components/ui/button.svelte';

	import type { FormState, UserItem } from './types';

	export let open = false;
	export let user: UserItem | null = null;
	export let formState: FormState | null = null;

	const errors = formState?.form === 'reset' ? formState.errors : undefined;
</script>

<Dialog bind:open title={user ? `Reset kata sandi ${user.fullName}` : 'Reset kata sandi'}>
	{#if user}
		<form method="POST" action="?/reset" class="space-y-4">
			<input type="hidden" name="id" value={user.id} />
			<div class="space-y-2">
				<Label for="reset-password">Kata sandi baru</Label>
				<Input id="reset-password" name="password" type="password" minlength="8" required />
				{#if errors?.password}
					<p class="text-xs text-red-500">{errors.password[0]}</p>
				{/if}
			</div>
			<Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">Reset</Button>
		</form>
	{/if}
</Dialog>
