<script lang="ts">
	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import CardDescription from '$lib/components/ui/card-description.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
import Button from '$lib/components/ui/button.svelte';
import Badge from '$lib/components/ui/badge.svelte';
import Separator from '$lib/components/ui/separator.svelte';
import { CheckCircle, Edit, Pill, Plus, Trash2 } from 'lucide-svelte';

	export let prescriptions;
	export let consultationId;
	export let canEdit;

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'active':
				return { label: 'Aktif', variant: 'success' as const };
			case 'completed':
				return { label: 'Selesai', variant: 'default' as const };
			case 'cancelled':
				return { label: 'Dibatalkan', variant: 'destructive' as const };
			default:
				return { label: status, variant: 'muted' as const };
		}
	};
</script>

<Card>
	<CardHeader>
		<CardTitle class="flex items-center justify-between">
			<div class="flex items-center space-x-2">
				<Pill class="h-5 w-5" />
				<span>Resep</span>
			</div>
			{#if canEdit}
			<Button variant="outline" size="sm" href={`/simklinik/rekam-medis/${consultationId}/edit`}>
				<Plus class="mr-2 h-4 w-4" />
				Tambah Resep
			</Button>
		{/if}
		</CardTitle>
		<CardDescription>
			Resep yang diberikan selama konsultasi ini
		</CardDescription>
	</CardHeader>
	<CardContent>
		<div class="space-y-4">
			{#each prescriptions as prescription (prescription.id)}
				{@const statusBadge = getStatusBadge(prescription.status)}
				<div class="border rounded-lg p-4 space-y-3">
					<div class="flex items-start justify-between">
						<div class="flex-1 space-y-2">
							<div class="flex items-center space-x-2">
								<h4 class="font-medium">{prescription.medication}</h4>
								<Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
							</div>
							
							<div class="grid gap-2 md:grid-cols-2">
								<div>
									<span class="text-sm font-medium text-muted-foreground">Dosis:</span>
									<p class="text-sm">{prescription.dosage}</p>
								</div>
								<div>
									<span class="text-sm font-medium text-muted-foreground">Frekuensi:</span>
									<p class="text-sm">{prescription.frequency}</p>
								</div>
								<div>
									<span class="text-sm font-medium text-muted-foreground">Durasi:</span>
									<p class="text-sm">{prescription.duration}</p>
								</div>
								<div class="md:col-span-2">
									{#if prescription.instructions}
										<span class="text-sm font-medium text-muted-foreground">Instruksi:</span>
										<p class="text-sm">{prescription.instructions}</p>
									{/if}
								</div>
							</div>
							
							<div class="text-xs text-muted-foreground">
								Dibuat: {new Date(prescription.createdAt).toLocaleString('id-ID')}
							</div>
						</div>
						

					</div>
				</div>
			{/each}
			
			{#if prescriptions.length === 0}
				<div class="text-center py-8">
					<Pill class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
					<p class="text-muted-foreground">Belum ada resep</p>
					{#if canEdit}
						<Button variant="outline" class="mt-4" href={`/simklinik/rekam-medis/${consultationId}/edit`}>
							<Plus class="mr-2 h-4 w-4" />
							Tambah Resep Pertama
						</Button>
					{/if}
				</div>
			{/if}
		</div>
	</CardContent>
</Card>
