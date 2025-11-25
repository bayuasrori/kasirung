<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';

	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Dropdown from '$lib/components/ui/dropdown.svelte';
	import Dialog from '$lib/components/ui/dialog.svelte';
	import { 
		Activity, 
		CalendarDays, 
		Heart, 
		Pill, 
		Search, 
		Plus, 
		MoreHorizontal, 
		FileEdit, 
		Trash2, 
		XCircle,
		Filter,
		User,
		Clock,
		FileText
	} from 'lucide-svelte';
	import Avatar from '$lib/components/ui/avatar.svelte';

	type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'muted';

	export let data: PageData;

	let search = '';
	let statusFilter = 'all';
	let isNewConsultationOpen = false;

	const getStatusVariant = (status: string): BadgeVariant => {
		if (status === 'completed') return 'success';
		if (status === 'ongoing') return 'muted'; // Using muted for ongoing as 'default' might be too strong or 'warning' too alarming
		if (status === 'cancelled') return 'destructive';
		return 'default';
	};

	const getStatusLabel = (status: string) => {
		if (status === 'completed') return 'Selesai';
		if (status === 'ongoing') return 'Berlangsung';
		if (status === 'cancelled') return 'Dibatalkan';
		return status;
	};

	function handleSearch() {
		const url = new URL(window.location.href);
		url.searchParams.set('search', search);
		url.searchParams.set('page', '1');
		goto(url.toString());
	}

	function handleStatusFilter(value: string) {
		statusFilter = value;
		const url = new URL(window.location.href);
		if (value === 'all') {
			url.searchParams.delete('status');
		} else {
			url.searchParams.set('status', value);
		}
		url.searchParams.set('page', '1');
		goto(url.toString());
	}

	function handlePageChange(newPage: number) {
		const url = new URL(window.location.href);
		url.searchParams.set('page', newPage.toString());
		goto(url.toString());
	}
</script>

<div class="flex-1 space-y-4 p-8">
	<div class="flex items-center justify-between space-y-2">
		<div>
			<h2 class="text-3xl font-bold tracking-tight">Rekam Medis</h2>
			<p class="text-muted-foreground">Kelola catatan medis dan riwayat konsultasi pasien</p>
		</div>
		<div class="flex items-center space-x-2">
			<Button on:click={() => isNewConsultationOpen = true}>
				<Plus class="mr-2 h-4 w-4" />
				Konsultasi Baru
			</Button>

			<Dialog 
				bind:open={isNewConsultationOpen} 
				title="Mulai Konsultasi Baru" 
				description="Pilih janji temu yang sudah dikonfirmasi untuk memulai konsultasi hari ini."
			>
				<div class="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
					{#if data.confirmedAppointments && data.confirmedAppointments.length > 0}
						{#each data.confirmedAppointments as appointment}
							<div class="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
								<div class="space-y-1">
									<div class="flex items-center space-x-2">
										<User class="h-4 w-4 text-muted-foreground" />
										<span class="font-medium">{appointment.patient?.name || 'Unknown'}</span>
									</div>
									<div class="flex items-center space-x-2 text-sm text-muted-foreground">
										<Clock class="h-3 w-3" />
										<span>{appointment.appointmentTime}</span>
										<span>•</span>
										<span>{appointment.staff?.name || 'Unknown'}</span>
									</div>
									<div class="text-xs text-muted-foreground">
										{appointment.type}
									</div>
								</div>
								<form action="?/create" method="POST" use:enhance>
									<input type="hidden" name="appointmentId" value={appointment.id} />
									<input type="hidden" name="patientId" value={appointment.patient?.id || ''} />
									<input type="hidden" name="staffId" value={appointment.staff?.id || ''} />
									<Button type="submit" size="sm">Mulai</Button>
								</form>
							</div>
						{/each}
					{:else}
						<div class="text-center py-8 text-muted-foreground">
							<p>Tidak ada janji temu yang dikonfirmasi untuk hari ini.</p>
							<Button variant="ghost" href="/simklinik/janji-temu" class="mt-2">
								Lihat Jadwal Janji Temu
							</Button>
						</div>
					{/if}
				</div>
			</Dialog>
		</div>
	</div>

	<!-- Stats Cards -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Konsultasi Hari Ini</CardTitle>
				<CalendarDays class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.consultationStats.today}</div>
				<p class="text-xs text-muted-foreground">Jadwal hari ini</p>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Minggu Ini</CardTitle>
				<Heart class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.consultationStats.thisWeek}</div>
				<p class="text-xs text-muted-foreground">7 hari terakhir</p>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Bulan Ini</CardTitle>
				<Activity class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.consultationStats.thisMonth}</div>
				<p class="text-xs text-muted-foreground">30 hari terakhir</p>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Total Arsip</CardTitle>
				<Pill class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.totalConsultations}</div>
				<p class="text-xs text-muted-foreground">Semua rekam medis</p>
			</CardContent>
		</Card>
	</div>

	<Card>
		<CardHeader>
			<div class="flex items-center justify-between">
				<div>
					<CardTitle>Daftar Konsultasi</CardTitle>
					<p class="text-sm text-muted-foreground mt-1">
						Daftar riwayat konsultasi dan rekam medis pasien
					</p>
				</div>
			</div>
		</CardHeader>
		<CardContent>
			<!-- Filters -->
			<div class="flex items-center justify-between py-4 gap-4">
				<div class="flex flex-1 items-center space-x-2">
					<div class="relative w-full max-w-sm">
						<Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Cari pasien..."
							class="pl-8"
							bind:value={search}
							on:keydown={(e) => e.key === 'Enter' && handleSearch()}
						/>
					</div>
					<Dropdown>
						<div slot="trigger">
							<Button variant="outline">
								<Filter class="mr-2 h-4 w-4" />
								Status: {statusFilter === 'all' ? 'Semua' : getStatusLabel(statusFilter)}
							</Button>
						</div>
						<div slot="content" class="p-1">
							<button class="w-full text-left px-2 py-1.5 text-sm hover:bg-slate-100 rounded-sm" on:click={() => handleStatusFilter('all')}>Semua</button>
							<button class="w-full text-left px-2 py-1.5 text-sm hover:bg-slate-100 rounded-sm" on:click={() => handleStatusFilter('ongoing')}>Berlangsung</button>
							<button class="w-full text-left px-2 py-1.5 text-sm hover:bg-slate-100 rounded-sm" on:click={() => handleStatusFilter('completed')}>Selesai</button>
							<button class="w-full text-left px-2 py-1.5 text-sm hover:bg-slate-100 rounded-sm" on:click={() => handleStatusFilter('cancelled')}>Dibatalkan</button>
						</div>
					</Dropdown>
				</div>
			</div>

			<!-- Table -->
			<div class="rounded-md border">
				<div class="w-full overflow-auto">
					<table class="w-full caption-bottom text-sm">
						<thead class="[&_tr]:border-b">
							<tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
								<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[300px]">Pasien</th>
								<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Dokter</th>
								<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Tanggal & Waktu</th>
								<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Status</th>
								<th class="h-12 px-4 text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Aksi</th>
							</tr>
						</thead>
						<tbody class="[&_tr:last-child]:border-0">
							{#each data.recentConsultations as item (item.consultation.id)}
								<tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted group">
									<td class="p-4 align-middle [&:has([role=checkbox])]:pr-0">
										<div class="flex items-center gap-3">
											<Avatar name={item.patient?.name} className="h-9 w-9" />
											<div>
												<div class="font-medium text-slate-900">{item.patient?.name}</div>
												<div class="text-xs text-muted-foreground flex items-center gap-1">
													<span class="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-600">
														{item.patient?.mrNumber}
													</span>
												</div>
											</div>
										</div>
									</td>
									<td class="p-4 align-middle [&:has([role=checkbox])]:pr-0">
										<div class="flex items-center gap-3">
											<Avatar name={item.staff?.name} className="h-8 w-8 bg-slate-100 text-slate-600" />
											<div>
												<div class="font-medium text-slate-900">{item.staff?.name}</div>
												<div class="text-xs text-muted-foreground">{item.staff?.specialization || 'Dokter Umum'}</div>
											</div>
										</div>
									</td>
									<td class="p-4 align-middle [&:has([role=checkbox])]:pr-0">
										<div class="flex flex-col">
											<span class="font-medium text-slate-900">
												{new Date(item.consultation.startTime).toLocaleDateString('id-ID', {
													day: 'numeric',
													month: 'short',
													year: 'numeric'
												})}
											</span>
											<span class="text-xs text-muted-foreground">
												{new Date(item.consultation.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
											</span>
										</div>
									</td>
									<td class="p-4 align-middle [&:has([role=checkbox])]:pr-0">
										<Badge variant={getStatusVariant(item.consultation.status)} className="capitalize">
											{getStatusLabel(item.consultation.status)}
										</Badge>
									</td>
									<td class="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right">
										<div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
											{#if item.consultation.status === 'ongoing'}
												<Button variant="default" size="sm" href={`/simklinik/rekam-medis/${item.consultation.id}/edit`}>
													Periksa
												</Button>
											{:else}
												<Button variant="outline" size="sm" href={`/simklinik/rekam-medis/${item.consultation.id}`}>
													Detail
												</Button>
											{/if}
											
											<Dropdown>
												<div slot="trigger">
													<Button variant="ghost" size="icon" class="h-8 w-8">
														<MoreHorizontal class="h-4 w-4" />
														<span class="sr-only">Menu</span>
													</Button>
												</div>
												<div slot="content" class="p-1 min-w-[150px]">
													<div class="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aksi</div>
													<a href={`/simklinik/rekam-medis/${item.consultation.id}`} class="flex items-center w-full px-2 py-1.5 text-sm hover:bg-slate-100 rounded-sm">
														<FileEdit class="mr-2 h-4 w-4 text-slate-500" />
														Detail Lengkap
													</a>
													{#if item.consultation.status === 'ongoing'}
														<a href={`/simklinik/rekam-medis/${item.consultation.id}/edit`} class="flex items-center w-full px-2 py-1.5 text-sm hover:bg-slate-100 rounded-sm">
															<Activity class="mr-2 h-4 w-4 text-blue-500" />
															Lanjutkan Pemeriksaan
														</a>
														<div class="h-px bg-slate-200 my-1"></div>
														<form action="?/cancel" method="POST" use:enhance>
															<input type="hidden" name="id" value={item.consultation.id} />
															<button type="submit" class="w-full flex items-center px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded-sm">
																<XCircle class="mr-2 h-4 w-4" />
																Batalkan
															</button>
														</form>
													{/if}
													<div class="h-px bg-slate-200 my-1"></div>
													<form action="?/delete" method="POST" use:enhance>
														<input type="hidden" name="id" value={item.consultation.id} />
														<button type="submit" class="w-full flex items-center px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded-sm">
															<Trash2 class="mr-2 h-4 w-4" />
															Hapus
														</button>
													</form>
												</div>
											</Dropdown>
										</div>
									</td>
								</tr>
							{/each}
							{#if data.recentConsultations.length === 0}
								<tr>
									<td colspan="5" class="p-8 align-middle text-center">
										<div class="flex flex-col items-center justify-center text-muted-foreground">
											<div class="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
												<FileText class="h-6 w-6 text-slate-400" />
											</div>
											<p class="font-medium text-slate-900">Belum ada data konsultasi</p>
											<p class="text-sm mt-1 max-w-xs mx-auto">
												Mulai konsultasi baru dari menu di atas atau tunggu pasien mendaftar.
											</p>
										</div>
									</td>
								</tr>
							{/if}
						</tbody>
					</table>
				</div>
			</div>

			<!-- Pagination -->
			<div class="flex items-center justify-end space-x-2 py-4">
				<Button
					variant="outline"
					size="sm"
					on:click={() => handlePageChange(data.pagination.page - 1)}
					disabled={data.pagination.page <= 1}
				>
					Sebelumnya
				</Button>
				<div class="text-sm text-muted-foreground">
					Halaman {data.pagination.page} dari {data.pagination.totalPages || 1}
				</div>
				<Button
					variant="outline"
					size="sm"
					on:click={() => handlePageChange(data.pagination.page + 1)}
					disabled={data.pagination.page >= data.pagination.totalPages}
				>
					Selanjutnya
				</Button>
			</div>
		</CardContent>
	</Card>
</div>
