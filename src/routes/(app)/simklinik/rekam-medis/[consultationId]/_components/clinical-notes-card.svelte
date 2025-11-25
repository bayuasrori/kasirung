<script lang="ts">
	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import CardDescription from '$lib/components/ui/card-description.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import Separator from '$lib/components/ui/separator.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { Edit, FileText } from 'lucide-svelte';

	export let consultation;
	export let canEdit;

	const soapSections = [
		{
			title: 'S - Subjective (Keluhan Utama)',
			key: 'chiefComplaint',
			placeholder: 'Belum ada keluhan yang dicatat'
		},
		{
			title: 'O - Objective (Pemeriksaan Fisik)',
			key: 'physicalExamination',
			placeholder: 'Belum ada hasil pemeriksaan fisik'
		},
		{
			title: 'A - Assessment (Diagnosis)',
			key: 'diagnosis',
			placeholder: 'Belum ada diagnosis'
		},
		{
			title: 'P - Plan (Rencana Tindakan)',
			key: 'treatment',
			placeholder: 'Belum ada rencana tindakan'
		},
		{
			title: 'Catatan Tambahan',
			key: 'notes',
			placeholder: 'Tidak ada catatan tambahan'
		}
	];
</script>

<Card>
	<CardHeader>
		<CardTitle class="flex items-center space-x-2">
			<FileText class="h-5 w-5" />
			<span>Catatan Klinis (Format SOAP)</span>
		</CardTitle>
		<CardDescription>
			Dokumentasi medis menggunakan format SOAP
		</CardDescription>
	</CardHeader>
	<CardContent>
		<div class="space-y-6">
			{#each soapSections as section (section.key)}
				<div class="space-y-2">
					<h3 class="text-sm font-semibold text-slate-700">{section.title}</h3>
					<div class="text-sm bg-muted/50 p-4 rounded-md min-h-[60px] border border-slate-200">
						{#if consultation?.[section.key]}
							<pre class="whitespace-pre-wrap font-sans text-slate-900">{consultation[section.key]}</pre>
						{:else}
							<span class="text-muted-foreground italic">{section.placeholder}</span>
						{/if}
					</div>
				</div>
				{#if section.key !== 'notes'}
					<Separator />
				{/if}
			{/each}
		</div>
		
		{#if canEdit}
			<div class="mt-6 pt-4 border-t">
				<Button href={`/simklinik/rekam-medis/${consultation.id}/edit`} class="w-full">
					<Edit class="mr-2 h-4 w-4" />
					Perbarui Catatan Klinis
				</Button>
			</div>
		{/if}
	</CardContent>
</Card>
