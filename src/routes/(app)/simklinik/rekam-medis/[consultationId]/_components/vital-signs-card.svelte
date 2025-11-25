<script lang="ts">
	import type { VitalSign } from '$lib/db/schema';

	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import CardDescription from '$lib/components/ui/card-description.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { Activity, Droplets, Heart, Ruler, Scale, Wind } from 'lucide-svelte';

	type ConsultationStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled' | string;

export let vitalSigns: Partial<VitalSign> | null;
export let consultationId: string;
export let consultationStatus: ConsultationStatus;

let recordedAt: string | null = null;
$: recordedAt = vitalSigns?.createdAt
	? new Date(vitalSigns.createdAt).toLocaleString('id-ID')
	: null;

	const vialsSignsConfig = [
		{
			name: 'Tekanan Darah',
			icon: Heart,
			value: vitalSigns?.systolic && vitalSigns?.diastolic ? 
				`${vitalSigns.systolic}/${vitalSigns.diastolic} mmHg` : '-',
			color: 'text-blue-600',
			normal: (systolic: number) => systolic >= 90 && systolic <= 120
		},
		{
			name: 'Denyut Nadi',
			icon: Activity,
			value: vitalSigns?.heartRate ? `${vitalSigns.heartRate} bpm` : '-',
			color: 'text-green-600',
			normal: (heartRate: number) => heartRate >= 60 && heartRate <= 100
		},
		{
			name: 'Pernapasan',
			icon: Wind,
			value: vitalSigns?.respiratoryRate ? `${vitalSigns.respiratoryRate} breath/min` : '-',
			color: 'text-purple-600',
			normal: (respRate: number) => respRate >= 12 && respRate <= 20
		},
		{
			name: 'Saturasi O₂',
			icon: Droplets,
			value: vitalSigns?.oxygenSaturation ? `${vitalSigns.oxygenSaturation}%` : '-',
			color: 'text-cyan-600',
			normal: (saturation: number) => saturation >= 95
		},
		{
			name: 'Suhu',
			icon: Activity,
			value: vitalSigns?.temperature ? `${vitalSigns.temperature}°C` : '-',
			color: 'text-orange-600',
			normal: (temp: number) => temp >= 36 && temp <= 37.5
		},
		{
			name: 'Berat Badan',
			icon: Scale,
			value: vitalSigns?.weight ? `${vitalSigns.weight} kg` : '-',
			color: 'text-indigo-600',
			normal: () => true // No normal range for weight
		},
		{
			name: 'Tinggi Badan',
			icon: Ruler,
			value: vitalSigns?.height ? `${vitalSigns.height} cm` : '-',
			color: 'text-teal-600',
			normal: () => true // No normal range for height
		},
		{
			name: 'BMI',
			icon: Activity,
			value: vitalSigns?.bmi ? `${vitalSigns.bmi}` : '-',
			color: 'text-pink-600',
			normal: (bmi: number) => bmi >= 18.5 && bmi <= 24.9
		}
	];
</script>

<Card>
	<CardHeader>
		<CardTitle class="flex items-center space-x-2">
			<Heart class="h-5 w-5" />
			<span>Tanda Vital</span>
		</CardTitle>
		<CardDescription>
			{recordedAt ? `Dicatat pada ${recordedAt}` : 'Belum dicatat'}
		</CardDescription>
	</CardHeader>
	<CardContent>
		<div class="grid gap-4 md:grid-cols-4">
			{#each vialsSignsConfig as item (item.name)}
				<div class="flex flex-col items-center p-4 border rounded-lg">
					<item.icon class={`${item.color} mb-2 h-6 w-6`} />
					<span class="text-sm font-medium text-center">{item.name}</span>
					<span class="text-lg font-bold">{item.value}</span>
				</div>
			{/each}
		</div>
		
		{#if consultationStatus === 'ongoing'}
			<div class="mt-4 pt-4 border-t">
				<Button href={`/simklinik/rekam-medis/${consultationId}/edit`} class="w-full">
					<Heart class="mr-2 h-4 w-4" />
					Perbarui Tanda Vital
				</Button>
			</div>
		{/if}
	</CardContent>
</Card>
