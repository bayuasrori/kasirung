<script lang="ts">
	import type { PageData } from './$types';

	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import CardDescription from '$lib/components/ui/card-description.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import Separator from '$lib/components/ui/separator.svelte';
	import VitalSignsCard from './_components/vital-signs-card.svelte';
	import PrescriptionsCard from './_components/prescriptions-card.svelte';
	import ClinicalNotesCard from './_components/clinical-notes-card.svelte';
	import { Activity, Bed, Calendar, Heart, Stethoscope, User, ChevronLeft } from 'lucide-svelte';

	type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'muted';

	export let data: PageData;

	const getConsultationSummaryText = (status?: string) => {
		if (status === 'completed') return 'Konsultasi Selesai';
		if (status === 'ongoing') return 'Konsultasi Sedang Berlangsung';
		if (status === 'cancelled') return 'Konsultasi Dibatalkan';
		return 'Status konsultasi tidak tersedia';
	};

	const getConsultationStatusLabel = (status?: string) => {
		if (status === 'completed') return 'Selesai';
		if (status === 'ongoing') return 'Berlangsung';
		if (status === 'cancelled') return 'Dibatalkan';
		return 'Tidak diketahui';
	};

const getConsultationBadgeVariant = (status?: string): BadgeVariant => {
	if (status === 'completed') return 'success';
	if (status === 'ongoing') return 'muted';
	return 'destructive';
};

const getAdmissionBadgeVariant = (status?: string): BadgeVariant => {
	if (status === 'admitted') return 'success';
	if (status === 'transferred') return 'warning';
	return 'muted';
};

	const calculateAge = (dateOfBirth?: string | Date | null) => {
		if (!dateOfBirth) return null;
		const birth = new Date(dateOfBirth);
		if (Number.isNaN(birth.getTime())) return null;
		const today = new Date();
		let age = today.getFullYear() - birth.getFullYear();
		const beforeBirthday =
			today.getMonth() < birth.getMonth() ||
			(today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
		if (beforeBirthday) age -= 1;
		return age;
	};

	const formatDateTime = (value?: string | Date | null) => {
		if (!value) return '-';
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return '-';
		return date.toLocaleString('id-ID');
	};

	const getPatientAgeText = (dateOfBirth?: string | Date | null) => {
		const age = calculateAge(dateOfBirth);
		return age !== null ? `${age} tahun` : '-';
	};
</script>

<div class="flex-1 space-y-4 p-8">
	<div class="flex items-center justify-between space-y-2">
		<div class="flex items-center space-x-4">
			<Button variant="outline" size="icon" href="/simklinik/rekam-medis">
				<ChevronLeft class="h-4 w-4" />
			</Button>
			<div>
				<h2 class="text-3xl font-bold tracking-tight">Detail Konsultasi</h2>
				<p class="text-muted-foreground">
					{getConsultationSummaryText(data.consultation?.consultation.status)}
				</p>
			</div>
		</div>
		<div class="flex items-center space-x-2">
			{#if data.consultation?.consultation.status === 'ongoing'}
				<Button href={`/simklinik/rekam-medis/${data.consultation?.consultation.id}/edit`}>
					<Stethoscope class="mr-2 h-4 w-4" />
					Perbarui Konsultasi
				</Button>
			{/if}
		</div>
	</div>

	<div class="grid gap-6">
		<!-- Patient and Staff Information -->
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center space-x-2">
					<User class="h-5 w-5" />
					<span>Informasi Konsultasi</span>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<div class="text-sm font-medium text-muted-foreground">Pasien</div>
						<div>
							<p class="font-medium">{data.patient?.name}</p>
							<p class="text-sm text-muted-foreground">No. RM: {data.patient?.mrNumber}</p>
							<p class="text-sm text-muted-foreground">
								{data.patient?.gender === 'male' ? 'Laki-laki' : 'Perempuan'}, 
								{getPatientAgeText(data.patient?.dateOfBirth)}
							</p>
						</div>
					</div>
					<div class="space-y-2">
						<div class="text-sm font-medium text-muted-foreground">Tenaga Medis</div>
						<div>
							<p class="font-medium">{data.staff?.name}</p>
							<p class="text-sm text-muted-foreground">{data.staff?.role}</p>
							{#if data.staff?.specialization}
								<p class="text-sm text-muted-foreground">{data.staff.specialization}</p>
							{/if}
						</div>
					</div>
				</div>
				<Separator />
				<div class="grid gap-4 md:grid-cols-3">
					<div class="space-y-2">
						<div class="flex items-center space-x-2">
							<Calendar class="h-4 w-4" />
							<div class="text-sm font-medium text-muted-foreground">Tanggal & Waktu</div>
						</div>
						<div>
							<p class="text-sm">
								{formatDateTime(data.consultation?.consultation?.startTime)}
							</p>
							{#if data.consultation?.consultation?.endTime}
								<p class="text-sm text-muted-foreground">
									Selesai: {formatDateTime(data.consultation.consultation.endTime)}
								</p>
							{/if}
						</div>
					</div>
					<div class="space-y-2">
						<div class="flex items-center space-x-2">
							<Activity class="h-4 w-4" />
							<div class="text-sm font-medium text-muted-foreground">Layanan</div>
						</div>
						<div>
							{#if data.appointment}
								{#if data.appointment.serviceId}
									<p class="text-sm">ID Layanan: {data.appointment.serviceId}</p>
								{/if}
								<p class="text-sm text-muted-foreground">
									Durasi: {data.appointment.duration ?? '-'} menit
								</p>
							{:else}
								<p class="text-sm">Tidak ada layanan terkait</p>
							{/if}
						</div>
					</div>
					<div class="space-y-2">
						<div class="flex items-center space-x-2">
							<Heart class="h-4 w-4" />
							<div class="text-sm font-medium text-muted-foreground">Status</div>
						</div>
						<div>
							<Badge variant={getConsultationBadgeVariant(data.consultation?.consultation?.status)}>
								{getConsultationStatusLabel(data.consultation?.consultation?.status)}
							</Badge>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>

		<!-- Vital Signs -->
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center space-x-2">
					<Bed class="h-5 w-5" />
					<span>Rawat Inap</span>
				</CardTitle>
			</CardHeader>
			<CardContent>
				{#if data.inpatientAdmission}
					<div class="grid gap-4 md:grid-cols-3">
						<div>
							<div class="text-sm text-muted-foreground">Ruangan</div>
							<div class="text-base font-semibold">
								{data.inpatientAdmission.bed.room.name} • {data.inpatientAdmission.bed.room.type}
							</div>
							<div class="text-xs text-muted-foreground">
								Tarif: Rp {Number(data.inpatientAdmission.bed.room.rate).toLocaleString('id-ID')}/malam
							</div>
						</div>
						<div>
							<div class="text-sm text-muted-foreground">Bed</div>
							<div class="text-base font-semibold">#{data.inpatientAdmission.bed.bedNumber}</div>
							<div class="text-xs text-muted-foreground capitalize">Status: {data.inpatientAdmission.bed.status}</div>
						</div>
						<div class="space-y-2">
							<div class="text-sm text-muted-foreground">Status Rawat Inap</div>
							<Badge variant={getAdmissionBadgeVariant(data.inpatientAdmission.status)}>
								{data.inpatientAdmission.status === 'admitted' ? 'Dirawat' : data.inpatientAdmission.status}
							</Badge>
							<div class="text-xs text-muted-foreground">
								Masuk: {formatDateTime(data.inpatientAdmission.admissionDate)}
							</div>
						</div>
					</div>
				{:else}
					<p class="text-sm text-muted-foreground">Pasien tidak sedang menjalani rawat inap.</p>
				{/if}
			</CardContent>
		</Card>

		<VitalSignsCard 
			vitalSigns={data.vitalSigns} 
			consultationId={data.consultation?.consultation.id ?? ''}
			consultationStatus={data.consultation?.consultation?.status}
		/>

		<!-- Clinical Notes -->
		<ClinicalNotesCard 
			consultation={data.consultation?.consultation}
			canEdit={data.consultation?.consultation?.status === 'ongoing'}
		/>

		<!-- Prescriptions -->
		<PrescriptionsCard 
			prescriptions={data.prescriptions}
			consultationId={data.consultation?.consultation.id ?? ''}
			canEdit={data.consultation?.consultation?.status === 'ongoing'}
		/>
	</div>
</div>
