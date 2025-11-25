<script lang="ts">
	import Dialog from '$lib/components/ui/dialog.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { Plus } from 'lucide-svelte';

	import type { FormState } from './types';

	export let open = false;
	export let formState: FormState | null = null;

	let customerName = '';
	let customerEmail = '';
	let customerPhone = '';
	let customerAddress = '';
	let customerNotes = '';

	const errors = formState?.form === 'createCustomer' ? formState.errors : undefined;
</script>

<Dialog bind:open title="Tambah pelanggan baru">
	<form method="POST" action="?/createCustomer" class="space-y-4">
		<div class="space-y-2">
			<Label for="customerName">Nama</Label>
			<Input id="customerName" name="name" bind:value={customerName} required />
			{#if errors?.name}
				<p class="text-sm text-red-500">{errors.name[0]}</p>
			{/if}
		</div>
		<div class="grid gap-4 md:grid-cols-2">
			<div class="space-y-2">
				<Label for="customerEmail">Email</Label>
				<Input id="customerEmail" name="email" type="email" bind:value={customerEmail} />
				{#if errors?.email}
					<p class="text-sm text-red-500">{errors.email[0]}</p>
				{/if}
			</div>
			<div class="space-y-2">
				<Label for="customerPhone">Telepon</Label>
				<Input id="customerPhone" name="phone" bind:value={customerPhone} />
				{#if errors?.phone}
					<p class="text-sm text-red-500">{errors.phone[0]}</p>
				{/if}
			</div>
		</div>
		<div class="space-y-2">
			<Label for="customerAddress">Alamat</Label>
			<Textarea id="customerAddress" name="address" rows={2} bind:value={customerAddress} />
			{#if errors?.address}
				<p class="text-sm text-red-500">{errors.address[0]}</p>
			{/if}
		</div>
		<div class="space-y-2">
			<Label for="customerNotes">Catatan</Label>
			<Textarea id="customerNotes" name="notes" rows={2} bind:value={customerNotes} />
		</div>

		{#if errors?.root}
			<p class="text-sm text-red-500">{errors.root[0]}</p>
		{/if}

		<div class="flex justify-end gap-2">
			<Button type="button" variant="ghost" on:click={() => (open = false)}>Batal</Button>
			<Button type="submit" className="gap-2">
				<Plus class="h-4 w-4" />
				Simpan pelanggan
			</Button>
		</div>
	</form>
</Dialog>
