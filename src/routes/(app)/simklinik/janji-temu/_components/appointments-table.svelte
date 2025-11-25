<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import type { PageData } from '../$types';
import { CalendarDays, Clock, User2, Stethoscope, FileText, Check, X, Trash2 } from 'lucide-svelte';

	type Appointment = PageData['appointments'][number];
	type Pagination = PageData['pagination'];
	type Filters = PageData['filters'];

	export let appointments: Appointment[] = [];
	export let pagination: Pagination = { page: 1, total: 0, totalPages: 1, limit: 20 };
	export let filters: Filters = { status: '', staffId: '', dateFrom: '', dateTo: '' };

	const dispatch = createEventDispatcher<{ selectReschedule: Appointment }>();

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

	const getStatusVariant = (status: string): 'default' | 'success' | 'warning' | 'destructive' | 'muted' => {
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

	function formatDate(dateInput?: string | null) {
		if (!dateInput) {
			return '-';
		}

		const date = new Date(dateInput);
		return date.toLocaleDateString('id-ID', {
			weekday: 'short',
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		});
	}

	function buildPageLink(page: number) {
		const params = new URLSearchParams();
		params.set('page', page.toString());
		if (filters.status) params.set('status', filters.status);
		if (filters.staffId) params.set('staffId', filters.staffId);
		if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
		if (filters.dateTo) params.set('dateTo', filters.dateTo);
		return `?${params.toString()}`;
	}

	function confirmAction(event: Event, message: string) {
		if (!confirm(message)) {
			event.preventDefault();
			event.stopPropagation();
		}
	}

	const canConfirm = (status: string) => status === 'scheduled';
	const canComplete = (status: string) => status === 'confirmed';
	const canCancel = (status: string) => status === 'scheduled' || status === 'confirmed';
	const canDelete = (status: string) => status !== 'completed';
</script>

<div class="w-full overflow-x-auto">
	<table class="w-full min-w-[960px] text-sm">
		<thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
			<tr>
				<th class="p-3 text-left">Pasien</th>
				<th class="p-3 text-left">Tenaga Medis</th>
				<th class="p-3 text-left">Jadwal</th>
				<th class="p-3 text-left">Layanan</th>
				<th class="p-3 text-left">Status</th>
				<th class="p-3 text-left">Tipe</th>
				<th class="p-3 text-left">Catatan</th>
				<th class="p-3 text-left">Aksi</th>
			</tr>
		</thead>
		<tbody>
			{#if appointments.length === 0}
				<tr>
					<td colspan="8" class="p-6 text-center text-muted-foreground">
						Belum ada janji temu yang sesuai filter
					</td>
				</tr>
			{:else}
				{#each appointments as appointment (appointment.id)}
					<tr class="border-b last:border-b-0 hover:bg-slate-50">
						<td class="p-4 align-top">
							<div class="font-semibold">{appointment.patient?.name ?? 'Pasien'}</div>
							<p class="text-xs text-muted-foreground">No. RM {appointment.patient?.mrNumber ?? '-'}</p>
							<p class="text-xs text-muted-foreground flex items-center gap-1 mt-1">
								<User2 class="h-3.5 w-3.5" />
								{appointment.patient?.phone ?? '-'}
							</p>
						</td>
						<td class="p-4 align-top">
							<div class="font-medium">{appointment.staff?.name ?? 'Tenaga Medis'}</div>
							<p class="text-xs text-muted-foreground flex items-center gap-1">
								<Stethoscope class="h-3.5 w-3.5" />
								{appointment.staff?.specialization ?? appointment.staff?.role ?? '-'}
							</p>
						</td>
						<td class="p-4 align-top">
							<div class="flex items-center gap-1 text-sm">
								<CalendarDays class="h-4 w-4 text-muted-foreground" />
								{formatDate(appointment.appointmentDate)}
							</div>
							<div class="flex items-center gap-1 text-sm text-muted-foreground">
								<Clock class="h-4 w-4" />
								{appointment.appointmentTime ?? '-'}
							</div>
							{#if appointment.duration}
								<p class="text-xs text-muted-foreground mt-1">
									{appointment.duration} menit
								</p>
							{/if}
						</td>
						<td class="p-4 align-top">
							<div class="font-medium">{appointment.service?.name ?? '-'}</div>
							{#if appointment.service?.code}
								<p class="text-xs text-muted-foreground">Kode {appointment.service.code}</p>
							{/if}
						</td>
						<td class="p-4 align-top">
							<Badge variant={getStatusVariant(appointment.status)}>
								{statusLabels[appointment.status] ?? appointment.status}
							</Badge>
						</td>
						<td class="p-4 align-top">
							<Badge variant="muted">
								{typeLabels[appointment.type] ?? appointment.type}
							</Badge>
						</td>
						<td class="p-4 align-top">
							{#if appointment.notes}
								<div class="flex items-start gap-1 text-xs text-muted-foreground">
									<FileText class="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
									<span>{appointment.notes}</span>
								</div>
							{:else}
								<span class="text-muted-foreground text-xs">-</span>
							{/if}
						</td>
						<td class="p-4 align-top">
							<div class="flex flex-wrap gap-2">
								<Button
									variant="ghost"
									size="sm"
									type="button"
									on:click={() => dispatch('selectReschedule', appointment)}
									class="text-blue-600"
									title="Jadwalkan ulang"
								>
									<Clock class="h-4 w-4" />
								</Button>

								{#if canConfirm(appointment.status)}
									<form method="POST" action="?/confirm">
										<input type="hidden" name="appointmentId" value={appointment.id} />
										<Button variant="outline" size="sm" type="submit" title="Konfirmasi">
											<Check class="h-3.5 w-3.5" />
											Konfirmasi
										</Button>
									</form>
								{/if}

								{#if canComplete(appointment.status)}
									<form method="POST" action="?/complete">
										<input type="hidden" name="appointmentId" value={appointment.id} />
										<Button variant="outline" size="sm" type="submit" title="Selesaikan">
											<Check class="h-3.5 w-3.5" />
											Selesai
										</Button>
									</form>
								{/if}

								{#if canCancel(appointment.status)}
									<form method="POST" action="?/cancel">
										<input type="hidden" name="appointmentId" value={appointment.id} />
										<Button
											variant="ghost"
											size="sm"
											type="submit"
											class="text-amber-600"
											on:click={(event) =>
												confirmAction(event, `Batalkan janji temu ${appointment.patient?.name ?? ''}?`)}
											title="Batalkan"
										>
											<X class="h-3.5 w-3.5" />
											Batal
										</Button>
									</form>
								{/if}

								{#if canDelete(appointment.status)}
									<form method="POST" action="?/delete">
										<input type="hidden" name="appointmentId" value={appointment.id} />
										<Button
											variant="ghost"
											size="sm"
											type="submit"
											class="text-red-600"
											on:click={(event) =>
												confirmAction(event, `Hapus janji temu ${appointment.patient?.name ?? ''}?`)}
											title="Hapus"
										>
											<Trash2 class="h-3.5 w-3.5" />
										</Button>
									</form>
								{/if}
							</div>
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

{#if appointments.length > 0}
	<div class="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-sm text-muted-foreground">
		<p>
			Menampilkan {(pagination.page - 1) * pagination.limit + 1}
			-
			{(pagination.page - 1) * pagination.limit + appointments.length}
			dari {pagination.total} janji temu
		</p>
		<div class="flex items-center gap-2">
			<Button
				variant="outline"
				size="sm"
				href={buildPageLink(Math.max(1, pagination.page - 1))}
				disabled={pagination.page <= 1}
			>
				Sebelumnya
			</Button>
			<Button
				variant="outline"
				size="sm"
				href={buildPageLink(Math.min(pagination.totalPages, pagination.page + 1))}
				disabled={pagination.page >= pagination.totalPages}
			>
				Selanjutnya
			</Button>
		</div>
	</div>
{/if}
