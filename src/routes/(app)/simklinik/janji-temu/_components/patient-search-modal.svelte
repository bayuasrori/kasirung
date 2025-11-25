<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Dialog from '$lib/components/ui/dialog.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';

	type PatientPreview = {
		id: string;
		name: string;
		mrNumber: string;
		phone?: string | null;
		gender?: string | null;
	};

	export let open = false;

	const dispatch = createEventDispatcher<{ select: PatientPreview }>();

	let search = '';
	let loading = false;
	let errorMessage = '';
	let results: PatientPreview[] = [];

	const genderLabels: Record<string, string> = {
		male: 'Laki-laki',
		female: 'Perempuan',
		other: 'Lainnya'
	};

	async function searchPatients() {
		const query = search.trim();
		if (!query) {
			errorMessage = 'Masukkan kata kunci pencarian';
			results = [];
			return;
		}

		loading = true;
		errorMessage = '';

		try {
			const params = new URLSearchParams({
				search: query,
				page: '1',
				limit: '8'
			});

			const response = await fetch(`/api/simklinik/patients?${params.toString()}`);
			if (!response.ok) {
				throw new Error('Gagal memuat data pasien');
			}

			const payload = await response.json();
			results = payload.data ?? [];

			if (results.length === 0) {
				errorMessage = 'Tidak ada pasien yang cocok dengan pencarian';
			}
		} catch (error) {
			console.error('Error searching patients:', error);
			errorMessage = error instanceof Error ? error.message : 'Gagal memuat data pasien';
		} finally {
			loading = false;
		}
	}

	function resetSearch() {
		search = '';
		results = [];
		errorMessage = '';
	}

	function selectPatient(patient: PatientPreview) {
		dispatch('select', patient);
		open = false;
	}

	$: if (!open) {
		resetSearch();
	}
</script>

<Dialog bind:open title="Cari Pasien" description="Temukan pasien berdasarkan nama, No.RM, atau nomor telepon">
	<form class="space-y-3" on:submit|preventDefault={searchPatients}>
		<div class="space-y-2">
			<label for="searchPatients" class="text-sm font-medium text-slate-700">Kata kunci</label>
			<Input
				id="searchPatients"
				name="search"
				placeholder="Contoh: Andi, RM001, 0812"
				bind:value={search}
			/>
		</div>
		<div class="flex flex-wrap gap-2">
			<Button type="submit" disabled={loading}>
				{#if loading}
					Mencari...
				{:else}
					Cari
				{/if}
			</Button>
			<Button type="button" variant="ghost" on:click={resetSearch}>
				Atur Ulang
			</Button>
		</div>
	</form>

	<div class="mt-4 space-y-3">
		{#if loading}
			<p class="text-sm text-muted-foreground">Memuat data pasien...</p>
		{:else if results.length === 0}
			<p class="text-sm text-muted-foreground">
				{errorMessage || 'Belum ada hasil. Masukkan kata kunci kemudian tekan cari.'}
			</p>
		{:else}
			<div class="space-y-2">
				{#each results as patient (patient.id)}
					<div class="rounded-lg border p-3">
						<div class="flex items-center justify-between gap-3">
							<div>
								<p class="font-semibold">{patient.name}</p>
								<p class="text-xs text-muted-foreground">No.RM {patient.mrNumber}</p>
							</div>
							<Button size="sm" type="button" on:click={() => selectPatient(patient)}>
								Pilih
							</Button>
						</div>
						<div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
							{#if patient.gender}
								<Badge variant="muted">{genderLabels[patient.gender] ?? patient.gender}</Badge>
							{/if}
							{#if patient.phone}
								<span>{patient.phone}</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</Dialog>
