<script lang="ts">
	import { page } from '$app/stores';
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import CardDescription from '$lib/components/ui/card-description.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import type { PageData } from './$types';

	type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'muted';

	export let data: PageData;

	const getPatientStatusVariant = (status: string): BadgeVariant => {
		return status === 'aktif' ? 'success' : 'muted';
	};

	const getAppointmentVariant = (status: string): BadgeVariant => {
		if (status === 'completed') return 'success';
		if (status === 'cancelled') return 'destructive';
		return 'warning';
	};
</script>

<div class="flex-1 space-y-4 p-8">
	<div class="flex items-center justify-between space-y-2">
		<div>
			<h2 class="text-3xl font-bold tracking-tight">Dashboard Simklinik</h2>
			<p class="text-muted-foreground">Ringkasan data klinik</p>
		</div>
		<div class="flex items-center space-x-2">
			<Button size="sm" href="/simklinik/pasien">Daftar Pasien</Button>
			<Button size="sm" variant="outline" href="/simklinik/janji-temu">
				Janji Temu
			</Button>
		</div>
	</div>

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Total Pasien</CardTitle>
				<div class="h-4 w-4 text-muted-foreground"></div>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.stats.totalPatients}</div>
				<p class="text-xs text-muted-foreground">Total pasien terdaftar</p>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Pasien Aktif</CardTitle>
				<div class="h-4 w-4 text-muted-foreground"></div>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.stats.activePatients}</div>
				<p class="text-xs text-muted-foreground">Pasien dengan status aktif</p>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Total Janji Temu</CardTitle>
				<div class="h-4 w-4 text-muted-foreground"></div>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.stats.totalAppointments}</div>
				<p class="text-xs text-muted-foreground">Semua janji temu</p>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Janji Temu Hari Ini</CardTitle>
				<div class="h-4 w-4 text-muted-foreground"></div>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.stats.todayAppointments}</div>
				<p class="text-xs text-muted-foreground">Janji temu untuk hari ini</p>
			</CardContent>
		</Card>
	</div>

	<div class="grid gap-4 md:grid-cols-2">
		<Card>
			<CardHeader>
				<CardTitle>Pasien Terbaru</CardTitle>
				<CardDescription>5 pasien yang baru terdaftar</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="space-y-2">
					{#each data.recentPatients as patient}
						<div class="flex items-center justify-between">
							<div>
								<p class="font-medium">{patient.name}</p>
								<p class="text-sm text-muted-foreground">{patient.mrNumber}</p>
							</div>
							<Badge variant={getPatientStatusVariant(patient.status)}>
								{patient.status}
							</Badge>
						</div>
					{/each}
					{#if data.recentPatients.length === 0}
						<p class="text-muted-foreground text-center py-4">Tidak ada data pasien</p>
					{/if}
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Janji Temu Terkini</CardTitle>
				<CardDescription>5 janji temu terbaru</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="space-y-4">
					{#each data.recentAppointments as appointment (appointment.id)}
						<div class="flex items-center space-x-4">
							<div class="flex-1 space-y-1">
								<p class="text-sm font-medium leading-none">{appointment.patientName}</p>
								<p class="text-sm text-muted-foreground">
									{appointment.appointmentDate} {appointment.appointmentTime}
								</p>
							</div>
							<Badge variant={getAppointmentVariant(appointment.status)}>
								{appointment.status}
							</Badge>
						</div>
					{/each}
				</div>
			</CardContent>
		</Card>
	</div>
</div>
