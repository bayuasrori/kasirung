<script lang="ts">
	import { page } from '$app/stores';

import Button from '$lib/components/ui/button.svelte';
import PenghuniFilters from './_component/PenghuniFilters.svelte';
	import PenghuniTable from './_component/PenghuniTable.svelte';
	import KeluarDialog from './_component/KeluarDialog.svelte';
	import type { Filters, FormState, PenghuniItem } from './_component/types';

	export let data: {
		penghuni: PenghuniItem[];
		filters: Filters;
		form?: FormState | null;
	};

	let statusFilter = data.filters.status;
	let searchKeyword = data.filters.search;
	let keluarModal = false;
	let penghuniKeluar: PenghuniItem | null = null;
	let formState: FormState | null = data.form ?? null;

	page.subscribe(($page) => {
		const form = $page.form as FormState | null;
		formState = form;
		if (form?.form === 'keluar' && form.errors) {
			keluarModal = true;
		}
	});

	const openKeluar = (event: CustomEvent<PenghuniItem>) => {
		penghuniKeluar = event.detail;
		keluarModal = true;
	};
</script>

<div class="space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div>
			<h1 class="text-xl font-semibold text-slate-900">Daftar Penghuni Kos</h1>
			<p class="text-sm text-slate-500">Pantau penghuni aktif dan riwayat penghuni yang sudah keluar.</p>
		</div>
		<Button href="/kosan/pendaftaran" className="gap-2">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M12 5v14" />
				<path d="M5 12h14" />
			</svg>
			Pendaftaran Penghuni
		</Button>
	</div>

	<PenghuniFilters bind:status={statusFilter} bind:search={searchKeyword} />

	<PenghuniTable items={data.penghuni} on:keluar={openKeluar} />

	<KeluarDialog bind:open={keluarModal} penghuni={penghuniKeluar} {formState} />
</div>
