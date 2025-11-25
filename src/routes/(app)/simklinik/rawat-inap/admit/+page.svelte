<script lang="ts">
	import { enhance } from '$app/forms';
	import { ArrowLeft, Save } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';
	import Select from '$lib/components/ui/select.svelte';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	$: ({ availableBeds, patientList } = data);
</script>

<div class="mx-auto max-w-2xl space-y-6">
	<div class="flex items-center gap-4">
		<Button variant="ghost" size="icon" href="/simklinik/rawat-inap">
			<ArrowLeft class="h-4 w-4" />
		</Button>
		<div>
			<h1 class="text-2xl font-bold text-slate-900">Registrasi Rawat Inap</h1>
			<p class="text-slate-500">Daftarkan pasien untuk rawat inap</p>
		</div>
	</div>

	<div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
		<form method="POST" use:enhance class="space-y-6">
			{#if form?.message}
				<div class="rounded-lg bg-red-50 p-4 text-sm text-red-600">
					{form.message}
				</div>
			{/if}

			<div class="space-y-2">
				<Label for="patientId">Pasien</Label>
				<select
					name="patientId"
					id="patientId"
					class="w-full rounded-md border border-slate-200 p-2 text-sm focus:border-blue-500 focus:outline-none"
					required
				>
					<option value="">Pilih Pasien</option>
					{#each patientList as patient}
						<option value={patient.id}>
							{patient.mrNumber} - {patient.name}
						</option>
					{/each}
				</select>
				{#if form?.errors?.patientId}
					<p class="text-xs text-red-500">{form.errors.patientId[0]}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="bedId">Ruangan / Bed</Label>
				<select
					name="bedId"
					id="bedId"
					class="w-full rounded-md border border-slate-200 p-2 text-sm focus:border-blue-500 focus:outline-none"
					required
				>
					<option value="">Pilih Bed</option>
					{#each availableBeds as bed}
						<option value={bed.id}>
							{bed.room.name} - Bed {bed.bedNumber} ({bed.room.type})
						</option>
					{/each}
				</select>
				{#if form?.errors?.bedId}
					<p class="text-xs text-red-500">{form.errors.bedId[0]}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="diagnosis">Diagnosa Awal</Label>
				<Input name="diagnosis" id="diagnosis" placeholder="Diagnosa saat masuk" />
			</div>

			<div class="space-y-2">
				<Label for="notes">Catatan</Label>
				<Textarea name="notes" id="notes" placeholder="Catatan tambahan..." />
			</div>

			<div class="flex justify-end gap-3 pt-4">
				<Button variant="outline" href="/simklinik/rawat-inap">Batal</Button>
				<Button type="submit">
					<Save class="mr-2 h-4 w-4" />
					Simpan
				</Button>
			</div>
		</form>
	</div>
</div>
