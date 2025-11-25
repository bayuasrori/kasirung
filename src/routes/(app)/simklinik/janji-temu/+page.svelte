<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import CardDescription from '$lib/components/ui/card-description.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Select from '$lib/components/ui/select.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';
	import Toast from '$lib/components/ui/toast.svelte';
	import { CalendarDays, Plus } from 'lucide-svelte';
	import AppointmentsTable from './_components/appointments-table.svelte';
	import PatientSearchModal from './_components/patient-search-modal.svelte';
	import StaffSearchModal from './_components/staff-search-modal.svelte';

	type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'muted';

	export let data: PageData;

type AppointmentListItem = PageData['appointments'][number];
type PatientSelection = {
	id: string;
	name: string;
	mrNumber: string;
	phone?: string | null;
	gender?: string | null;
};
type StaffSelection = {
	id: string;
	name: string;
	role: string;
	specialization?: string | null;
	phone?: string | null;
};

	const todayAppointments = data.todayAppointments ?? [];
	const upcomingAppointments = data.upcomingAppointments ?? [];
	const staffOptions = data.staffOptions ?? [];
	const serviceOptions = data.serviceOptions ?? [];

	const statusLabels: Record<string, string> = {
		scheduled: 'Terjadwal',
		confirmed: 'Terkonfirmasi',
		completed: 'Selesai',
		cancelled: 'Dibatalkan',
		no_show: 'Tidak Hadir'
	};

	const typeLabels: Record<string, string> = {
		consultation: 'Konsultasi',
		checkup: 'Pemeriksaan',
		follow_up: 'Kontrol',
		emergency: 'Darurat',
		vaccination: 'Vaksinasi',
		procedure: 'Tindakan'
	};

	const appointmentTypes = Object.entries(typeLabels).map(([value, label]) => ({ value, label }));
	const staffRoleLabels: Record<string, string> = {
		doctor: 'Dokter',
		nurse: 'Perawat',
		midwife: 'Bidan',
		specialist: 'Spesialis',
		pharmacist: 'Apoteker',
		lab_technician: 'Teknisi Lab',
		receptionist: 'Penerima'
	};

	const getStatusVariant = (status: string): BadgeVariant => {
		switch (status) {
			case 'completed':
				return 'success';
			case 'confirmed':
				return 'default';
			case 'cancelled':
			case 'no_show':
				return 'destructive';
			default:
				return 'warning';
		}
	};

	const formatDate = (dateInput?: string | null) => {
		if (!dateInput) return '-';
		const date = new Date(dateInput);
		return date.toLocaleDateString('id-ID', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	};

	const formatTime = (time?: string | null) => time ?? '-';

	let showToast = false;
	let toastMessage = '';
	let toastType: 'success' | 'error' = 'success';

	$: {
		const success = $page.url.searchParams.get('success');
		if (success === 'true' || success === 'false') {
			toastMessage = decodeURIComponent($page.url.searchParams.get('message') || '');
			toastType = success === 'true' ? 'success' : 'error';
			showToast = true;
		}
	}

	function clearFilters() {
		const url = new URL(window.location.href);
		url.searchParams.delete('status');
		url.searchParams.delete('staffId');
		url.searchParams.delete('dateFrom');
		url.searchParams.delete('dateTo');
		url.searchParams.delete('page');
		window.location.assign(url.toString());
	}

	function scrollToCreate(event: Event) {
		event.preventDefault();
		const element = document.getElementById('create-appointment');
		element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	let rescheduleAppointmentId = '';
	let reschedulePatient = '';
	let rescheduleDate = '';
	let rescheduleTime = '';
	let patientModalOpen = false;
	let selectedPatient: PatientSelection | null = null;
	let patientWarning = false;
	let staffModalOpen = false;
	let selectedStaff: StaffSelection | null = null;
	let staffWarning = false;

	function handleSelectReschedule(event: CustomEvent<AppointmentListItem>) {
		const appointment = event.detail;
		rescheduleAppointmentId = appointment.id;
		reschedulePatient = appointment.patient?.name ?? 'Pasien';
		rescheduleDate = appointment.appointmentDate ?? '';
		rescheduleTime = appointment.appointmentTime ?? '';
	}

	function clearReschedule() {
		rescheduleAppointmentId = '';
		reschedulePatient = '';
		rescheduleDate = '';
		rescheduleTime = '';
	}

	function handlePatientSelected(event: CustomEvent<PatientSelection>) {
		selectedPatient = event.detail;
		patientModalOpen = false;
		patientWarning = false;
	}

	function clearSelectedPatient() {
		selectedPatient = null;
	}

	function handleStaffSelected(event: CustomEvent<StaffSelection>) {
		selectedStaff = event.detail;
		staffModalOpen = false;
		staffWarning = false;
	}

	function clearSelectedStaff() {
		selectedStaff = null;
	}

	function handleCreateSubmit(event: SubmitEvent) {
		if (!selectedPatient || !selectedStaff) {
			event.preventDefault();
			if (!selectedPatient) {
				patientWarning = true;
				patientModalOpen = true;
			}
			if (!selectedStaff) {
				staffWarning = true;
				staffModalOpen = true;
			}
		}
	}
</script>

<div class="flex-1 space-y-6 p-8">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div>
			<h2 class="text-3xl font-bold tracking-tight">Manajemen Janji Temu</h2>
			<p class="text-muted-foreground">Pantau dan kelola seluruh jadwal klinik</p>
		</div>
		<div class="flex flex-wrap gap-2">
			<Button on:click={scrollToCreate}>
				<Plus class="mr-2 h-4 w-4" />
				Buat Janji Temu
			</Button>
			<Button variant="outline" href="/simklinik/janji-temu/kalender">
				<CalendarDays class="mr-2 h-4 w-4" />
				Kalender
			</Button>
		</div>
	</div>

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card>
			<CardHeader class="space-y-1">
				<CardTitle class="text-sm font-medium">Janji Temu Hari Ini</CardTitle>
				<CardDescription>Pasien terjadwal hari ini</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.totalToday}</div>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="space-y-1">
				<CardTitle class="text-sm font-medium">7 Hari Ke Depan</CardTitle>
				<CardDescription>Janji temu mendatang</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.totalUpcoming}</div>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="space-y-1">
				<CardTitle class="text-sm font-medium">Tenaga Medis Aktif</CardTitle>
				<CardDescription>Siap menerima pasien</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.availableStaff.length}</div>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="space-y-1">
				<CardTitle class="text-sm font-medium">Total Janji Terfilter</CardTitle>
				<CardDescription>Data sesuai filter saat ini</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.pagination.total}</div>
			</CardContent>
		</Card>
	</div>

	<div class="grid gap-4 lg:grid-cols-3">
		<Card class="lg:col-span-2">
			<CardHeader>
				<CardTitle>Data Janji Temu</CardTitle>
				<CardDescription>Gunakan filter untuk menyaring jadwal</CardDescription>
			</CardHeader>
			<CardContent class="space-y-6">
				<form method="GET" class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<div class="space-y-2">
						<Label for="status">Status</Label>
						<Select id="status" name="status" value={data.filters.status}>
							<option value="">Semua Status</option>
							{#each Object.entries(statusLabels) as [value, label]}
								<option value={value}>{label}</option>
							{/each}
						</Select>
					</div>
					<div class="space-y-2">
						<Label for="staffId">Tenaga Medis</Label>
						<Select id="staffId" name="staffId" value={data.filters.staffId}>
							<option value="">Semua Tenaga Medis</option>
							{#each staffOptions as staff (staff.id)}
								<option value={staff.id}>{staff.name}</option>
							{/each}
						</Select>
					</div>
					<div class="space-y-2">
						<Label for="dateFrom">Tanggal Mulai</Label>
						<Input id="dateFrom" type="date" name="dateFrom" value={data.filters.dateFrom} />
					</div>
					<div class="space-y-2">
						<Label for="dateTo">Tanggal Selesai</Label>
						<Input id="dateTo" type="date" name="dateTo" value={data.filters.dateTo} />
					</div>
					<div class="md:col-span-2 lg:col-span-4 flex gap-2">
						<Button type="submit">Terapkan Filter</Button>
						<Button type="button" variant="ghost" on:click={clearFilters}>
							Atur Ulang
						</Button>
					</div>
				</form>

				<AppointmentsTable
					appointments={data.appointments}
					pagination={data.pagination}
					filters={data.filters}
					on:selectReschedule={handleSelectReschedule}
				/>
			</CardContent>
		</Card>

		<div class="space-y-4">
			<Card>
				<CardHeader>
					<CardTitle>Hari Ini</CardTitle>
					<CardDescription>
						{new Date().toLocaleDateString('id-ID', {
							weekday: 'long',
							day: 'numeric',
							month: 'long',
							year: 'numeric'
						})}
					</CardDescription>
				</CardHeader>
				<CardContent class="space-y-3 max-h-96 overflow-y-auto">
					{#if todayAppointments.length === 0}
						<p class="text-sm text-muted-foreground text-center py-6">
							Tidak ada janji temu hari ini
						</p>
					{:else}
						{#each todayAppointments as appointment (appointment.id)}
							<div class="rounded-lg border p-3 space-y-2">
								<div class="flex items-center justify-between gap-2">
									<div>
										<p class="font-semibold">{appointment.patient?.name ?? 'Pasien'}</p>
										<p class="text-xs text-muted-foreground">{appointment.staff?.name ?? 'Tenaga Medis'}</p>
									</div>
									<Badge variant={getStatusVariant(appointment.status)}>
										{statusLabels[appointment.status] ?? appointment.status}
									</Badge>
								</div>
								<p class="text-sm text-muted-foreground">
									{formatTime(appointment.appointmentTime)} • {appointment.service?.name ?? '-'}
								</p>
							</div>
						{/each}
					{/if}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>7 Hari Mendatang</CardTitle>
					<CardDescription>Prioritas jadwal terdekat</CardDescription>
				</CardHeader>
				<CardContent class="space-y-3 max-h-96 overflow-y-auto">
					{#if upcomingAppointments.length === 0}
						<p class="text-sm text-muted-foreground text-center py-6">
							Belum ada jadwal mendatang
						</p>
					{:else}
						{#each upcomingAppointments as appointment (appointment.id)}
							<div class="rounded-lg border p-3 space-y-2">
								<div class="flex items-center justify-between gap-2">
									<div>
										<p class="font-semibold">{appointment.patient?.name ?? 'Pasien'}</p>
										<p class="text-xs text-muted-foreground">{appointment.staff?.name ?? 'Tenaga Medis'}</p>
									</div>
									<Badge variant="muted">{typeLabels[appointment.type] ?? appointment.type}</Badge>
								</div>
								<p class="text-sm text-muted-foreground">
									{formatDate(appointment.appointmentDate)} • {formatTime(appointment.appointmentTime)}
								</p>
							</div>
						{/each}
					{/if}
				</CardContent>
			</Card>
		</div>
	</div>

	<div id="create-appointment" class="grid gap-4 lg:grid-cols-2">
		<Card>
			<CardHeader>
				<CardTitle>Buat Janji Temu Baru</CardTitle>
				<CardDescription>Isi formulir untuk menjadwalkan pasien</CardDescription>
			</CardHeader>
			<CardContent>
				<form method="POST" action="?/create" class="space-y-4" on:submit={handleCreateSubmit}>
					<div class="grid gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<Label>Pasien</Label>
							<div class="rounded-lg border border-slate-200 bg-slate-50/60 p-4 space-y-3">
								{#if selectedPatient}
									<input type="hidden" name="patientId" value={selectedPatient.id} />
									<div>
										<p class="text-lg font-semibold">{selectedPatient.name}</p>
										<p class="text-sm text-muted-foreground">No.RM {selectedPatient.mrNumber}</p>
										{#if selectedPatient.phone}
											<p class="text-sm text-muted-foreground">Telp. {selectedPatient.phone}</p>
										{/if}
									</div>
									<div class="flex flex-wrap gap-2">
										<Button type="button" variant="outline" on:click={() => (patientModalOpen = true)}>
											Ganti Pasien
										</Button>
										<Button type="button" variant="ghost" on:click={clearSelectedPatient}>
											Hapus
										</Button>
									</div>
								{:else}
									<p class="text-sm text-muted-foreground">
										Belum ada pasien dipilih. Cari pasien terlebih dahulu.
									</p>
									<Button type="button" on:click={() => (patientModalOpen = true)}>
										Cari Pasien
									</Button>
									{#if patientWarning}
										<p class="text-sm text-red-600">Silakan pilih pasien sebelum menyimpan janji.</p>
									{/if}
								{/if}
							</div>
						</div>
						<div class="space-y-2">
							<Label>Tenaga Medis</Label>
							<div class="rounded-lg border border-slate-200 bg-slate-50/60 p-4 space-y-3">
								{#if selectedStaff}
									<input type="hidden" name="staffId" value={selectedStaff.id} />
									<div>
										<p class="text-lg font-semibold">{selectedStaff.name}</p>
										<p class="text-sm text-muted-foreground">
											{selectedStaff.specialization ??
												staffRoleLabels[selectedStaff.role] ??
												selectedStaff.role}
										</p>
										{#if selectedStaff.phone}
											<p class="text-sm text-muted-foreground">{selectedStaff.phone}</p>
										{/if}
									</div>
									<div class="flex flex-wrap gap-2">
										<Button type="button" variant="outline" on:click={() => (staffModalOpen = true)}>
											Ganti Tenaga Medis
										</Button>
										<Button type="button" variant="ghost" on:click={clearSelectedStaff}>
											Hapus
										</Button>
									</div>
								{:else}
									<p class="text-sm text-muted-foreground">
										Belum ada tenaga medis dipilih. Cari tenaga medis terlebih dahulu.
									</p>
									<Button type="button" on:click={() => (staffModalOpen = true)}>
										Cari Tenaga Medis
									</Button>
									{#if staffWarning}
										<p class="text-sm text-red-600">Silakan pilih tenaga medis.</p>
									{/if}
								{/if}
							</div>
						</div>
					</div>
					<div class="space-y-2">
						<Label for="serviceId">Layanan (opsional)</Label>
						<Select id="serviceId" name="serviceId">
							<option value="">Tanpa layanan</option>
							{#each serviceOptions as service (service.id)}
								<option value={service.id}>{service.name}</option>
							{/each}
						</Select>
					</div>
					<div class="grid gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<Label for="appointmentDate">Tanggal</Label>
							<Input id="appointmentDate" name="appointmentDate" type="date" required />
						</div>
						<div class="space-y-2">
							<Label for="appointmentTime">Waktu</Label>
							<Input id="appointmentTime" name="appointmentTime" type="time" required />
						</div>
					</div>
					<div class="grid gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<Label for="type">Tipe Janji</Label>
							<Select id="type" name="type" required>
								{#each appointmentTypes as option}
									<option value={option.value}>{option.label}</option>
								{/each}
							</Select>
						</div>
						<div class="space-y-2">
							<Label for="duration">Perkiraan Durasi (menit)</Label>
							<Input id="duration" name="duration" type="number" min="0" placeholder="Contoh 30" />
						</div>
					</div>
					<div class="space-y-2">
						<Label for="notes">Catatan</Label>
						<Textarea id="notes" name="notes" placeholder="Catatan untuk tenaga medis" rows={3} />
					</div>
					<div class="flex justify-end">
						<Button type="submit" disabled={!selectedPatient}>Simpan Janji Temu</Button>
					</div>
				</form>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Penjadwalan Ulang</CardTitle>
				<CardDescription>Pilih janji temu dari tabel untuk otomatis mengisi data</CardDescription>
			</CardHeader>
			<CardContent>
				<form method="POST" action="?/reschedule" class="space-y-4">
					<input type="hidden" name="appointmentId" value={rescheduleAppointmentId} />
					<div class="space-y-2">
						<Label>Janji Temu</Label>
						<Input value={reschedulePatient} placeholder="Belum ada janji dipilih" readonly />
					</div>
					<div class="grid gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<Label for="rescheduleDate">Tanggal Baru</Label>
							<Input
								id="rescheduleDate"
								name="appointmentDate"
								type="date"
								bind:value={rescheduleDate}
								required
								disabled={!rescheduleAppointmentId}
							/>
						</div>
						<div class="space-y-2">
							<Label for="rescheduleTime">Waktu Baru</Label>
							<Input
								id="rescheduleTime"
								name="appointmentTime"
								type="time"
								bind:value={rescheduleTime}
								required
								disabled={!rescheduleAppointmentId}
							/>
						</div>
					</div>
					<div class="flex items-center justify-between">
						<Button type="button" variant="ghost" on:click={clearReschedule} disabled={!rescheduleAppointmentId}>
							Hapus pilihan
						</Button>
						<Button type="submit" disabled={!rescheduleAppointmentId}>
							Simpan Jadwal Baru
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	</div>
</div>

<PatientSearchModal bind:open={patientModalOpen} on:select={handlePatientSelected} />
<StaffSearchModal bind:open={staffModalOpen} on:select={handleStaffSelected} />
<Toast bind:show={showToast} message={toastMessage} type={toastType} on:dismiss={() => (showToast = false)} />
