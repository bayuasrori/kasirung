<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Dialog from '$lib/components/ui/dialog.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Select from '$lib/components/ui/select.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';

	type StaffPreview = {
		id: string;
		name: string;
		role: string;
		specialization?: string | null;
		phone?: string | null;
	};

	export let open = false;

	const dispatch = createEventDispatcher<{ select: StaffPreview }>();

	let search = '';
	let roleFilter = '';
	let loading = false;
	let errorMessage = '';
	let results: StaffPreview[] = [];

	const roleLabels: Record<string, string> = {
		doctor: 'Dokter',
		nurse: 'Perawat',
		midwife: 'Bidan',
		specialist: 'Spesialis',
		pharmacist: 'Apoteker',
		lab_technician: 'Teknisi Lab',
		receptionist: 'Penerima'
	};

	async function searchStaff() {
		const query = search.trim();

		if (!query && !roleFilter) {
			errorMessage = 'Masukkan kata kunci atau pilih role';
			results = [];
			return;
		}

		loading = true;
		errorMessage = '';

		try {
			const params = new URLSearchParams({
				search: query,
				role: roleFilter,
				page: '1',
				limit: '8'
			});

			const response = await fetch(`/api/simklinik/medical-staff?${params.toString()}`);
			if (!response.ok) {
				throw new Error('Gagal memuat data tenaga medis');
			}

			const payload = await response.json();
			results = payload.data ?? [];

			if (results.length === 0) {
				errorMessage = 'Tidak ada tenaga medis yang cocok';
			}
		} catch (error) {
			console.error('Error searching medical staff:', error);
			errorMessage = error instanceof Error ? error.message : 'Gagal memuat data tenaga medis';
		} finally {
			loading = false;
		}
	}

	function resetSearch() {
		search = '';
		roleFilter = '';
		results = [];
		errorMessage = '';
	}

	function selectStaff(staff: StaffPreview) {
		dispatch('select', staff);
		open = false;
	}

	$: if (!open) {
		resetSearch();
	}
</script>

<Dialog bind:open title="Pilih Tenaga Medis" description="Cari tenaga medis berdasarkan nama atau role">
	<form class="space-y-3" on:submit|preventDefault={searchStaff}>
		<div class="space-y-2">
			<label for="searchStaff" class="text-sm font-medium text-slate-700">Kata kunci</label>
			<Input
				id="searchStaff"
				name="search"
				placeholder="Contoh: dr. Budi"
				bind:value={search}
			/>
		</div>
		<div class="space-y-2">
			<label for="roleFilter" class="text-sm font-medium text-slate-700">Role</label>
			<Select id="roleFilter" name="role" bind:value={roleFilter}>
				<option value="">Semua role</option>
				{#each Object.entries(roleLabels) as [value, label]}
					<option value={value}>{label}</option>
				{/each}
			</Select>
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
				Atur ulang
			</Button>
		</div>
	</form>

	<div class="mt-4 space-y-3">
		{#if loading}
			<p class="text-sm text-muted-foreground">Memuat data tenaga medis...</p>
		{:else if results.length === 0}
			<p class="text-sm text-muted-foreground">
				{errorMessage || 'Belum ada hasil. Masukkan kata kunci kemudian tekan cari.'}
			</p>
		{:else}
			<div class="space-y-2">
				{#each results as staff (staff.id)}
					<div class="rounded-lg border p-3 space-y-2">
						<div class="flex items-center justify-between gap-3">
							<div>
								<p class="font-semibold">{staff.name}</p>
								<p class="text-xs text-muted-foreground">
									{roleLabels[staff.role] ?? staff.role}
								</p>
							</div>
							<Button size="sm" type="button" on:click={() => selectStaff(staff)}>
								Pilih
							</Button>
						</div>
						<div class="flex flex-wrap gap-2 text-xs text-muted-foreground">
							{#if staff.specialization}
								<Badge variant="muted">{staff.specialization}</Badge>
							{/if}
							{#if staff.phone}
								<span>{staff.phone}</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</Dialog>
