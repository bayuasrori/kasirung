<script lang="ts">
	import Dialog from '$lib/components/ui/dialog.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { Search } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';

	import type { Tenant } from './types';

	export let open = false;
	export let tenants: Tenant[] = [];
	export let search = '';

	const dispatch = createEventDispatcher<{ select: Tenant; search: string }>();
</script>

<Dialog bind:open title="Pilih penghuni aktif">
	<div class="space-y-4">
		<div class="relative">
			<Input
				placeholder="Cari nama, kamar, atau gedung"
				value={search}
				on:input={(event) => dispatch('search', (event.currentTarget as HTMLInputElement).value)}
				className="pl-8"
			/>
			<Search class="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
		</div>
		<div class="max-h-72 space-y-2 overflow-y-auto pr-2">
			{#if tenants.length}
				{#each tenants as tenant (tenant.id)}
					<button
						type="button"
						on:click={() => dispatch('select', tenant)}
						class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm hover:border-blue-300 hover:bg-blue-50/60"
					>
						<p class="font-semibold text-slate-900">{tenant.pelangganNama}</p>
						<p class="mt-1 text-xs text-slate-500">{tenant.gedungNama} • Kamar {tenant.ruanganNama}</p>
						{#if tenant.pelangganKontak}
							<p class="text-xs text-slate-500">{tenant.pelangganKontak}</p>
						{/if}
					</button>
				{/each}
			{:else}
				<p class="text-sm text-slate-500">Tidak ada penghuni yang cocok.</p>
			{/if}
		</div>
		<div class="flex justify-end">
			<Button type="button" variant="ghost" on:click={() => (open = false)}>Tutup</Button>
		</div>
	</div>
</Dialog>
