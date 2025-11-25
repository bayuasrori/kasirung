<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
import CardTitle from '$lib/components/ui/card-title.svelte';
import CardContent from '$lib/components/ui/card-content.svelte';
import { Bed, FileText, CheckCircle, Trash2 } from 'lucide-svelte';

	export let data: PageData;
	export let form: ActionData;

	const formatDateTime = (value?: string | Date | null) => {
		if (!value) return '-';
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return '-';
		return date.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
	};
</script>

<div class="flex-1 space-y-6 p-8">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-3xl font-bold tracking-tight">Rekam Medis Inap</h2>
			<p class="text-muted-foreground">Catatan konsultasi yang terhubung ke sesi rawat inap</p>
		</div>
	</div>

	{#if form?.message}
		<div class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
			{form.message}
		</div>
	{/if}

	<Card>
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<Bed class="h-5 w-5" />
				Pasien Rawat Inap Aktif
			</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			{#if data.inpatientAdmissions.length === 0}
				<div class="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
					Tidak ada pasien rawat inap aktif.
				</div>
			{:else}
				<div class="grid gap-4 md:grid-cols-2">
					{#each data.inpatientAdmissions as admission}
						<div class="rounded-lg border p-4 shadow-sm bg-white">
							<div class="flex items-center justify-between mb-3">
								<div>
									<div class="text-sm text-muted-foreground">Pasien</div>
									<div class="font-semibold text-slate-900">{admission.patient.name}</div>
									<div class="text-xs text-muted-foreground">{admission.patient.mrNumber}</div>
								</div>
								<Badge variant="success" className="capitalize">
									{admission.status === 'admitted' ? 'Dirawat' : admission.status}
								</Badge>
							</div>
							<div class="grid grid-cols-2 gap-3 text-sm">
								<div>
									<div class="text-xs text-muted-foreground">Ruangan</div>
									<div class="font-medium">{admission.bed.room.name}</div>
									<div class="text-xs text-muted-foreground">{admission.bed.room.type}</div>
								</div>
								<div>
									<div class="text-xs text-muted-foreground">Bed</div>
									<div class="font-medium">#{admission.bed.bedNumber}</div>
									<div class="text-xs text-muted-foreground capitalize">{admission.bed.status}</div>
								</div>
								<div>
									<div class="text-xs text-muted-foreground">Masuk</div>
									<div class="font-medium">{formatDateTime(admission.admissionDate)}</div>
								</div>
								<div>
									<div class="text-xs text-muted-foreground">Dokter</div>
									<div class="font-medium">{admission.admittedBy?.fullName ?? '-'}</div>
								</div>
							</div>
							<div class="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
								<form method="post" action="?/create" class="flex gap-2">
									<input type="hidden" name="patientId" value={admission.patient.id} />
									<input type="hidden" name="admissionId" value={admission.id} />
									{#if data.staffList.length > 0}
										<select
											name="staffId"
											class="w-full rounded-md border border-slate-200 p-2 text-sm focus:border-blue-500 focus:outline-none"
											aria-label="Pilih tenaga medis"
										>
											{#each data.staffList as staffMember}
												<option value={staffMember.id}>{staffMember.name} ({staffMember.role})</option>
											{/each}
										</select>
									{/if}
									<Button size="sm" type="submit">
										Buat Catatan
									</Button>
								</form>
								<Button size="sm" variant="outline" href={`/simklinik/rekam-medis?search=${encodeURIComponent(admission.patient.name)}`}>
									Lihat Rekam Medis
								</Button>
							</div>

							{#if data.inpatientConsultations?.filter((item) => item.consultation.admissionId === admission.id).length}
								<div class="mt-4 border-t border-slate-200 pt-3">
									<div class="text-sm font-semibold text-slate-900 mb-2">Riwayat Konsultasi</div>
									<div class="space-y-2">
										{#each data.inpatientConsultations.filter((item) => item.consultation.admissionId === admission.id) as item}
											<div class="flex items-center justify-between rounded-lg border border-slate-200 p-3">
												<div>
													<div class="text-sm font-medium text-slate-900">
														{formatDateTime(item.consultation.startTime)}
													</div>
													<div class="text-xs text-muted-foreground">
														{item.staff?.name} • {item.consultation.status}
													</div>
												</div>
												<Button size="sm" variant={item.consultation.status === 'ongoing' ? 'default' : 'outline'} href={`/simklinik/rekam-medis/${item.consultation.id}${item.consultation.status === 'ongoing' ? '/edit' : ''}`}>
													{item.consultation.status === 'ongoing' ? 'Periksa' : 'Detail'}
												</Button>
											</div>
										{/each}
									</div>
								</div>
							{:else}
								<p class="mt-3 text-xs text-muted-foreground">Belum ada konsultasi untuk admission ini.</p>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<FileText class="h-5 w-5" />
				Catatan Rawat Inap
			</CardTitle>
		</CardHeader>
		<CardContent>
			{#if data.inpatientConsultations?.length}
				<div class="rounded-md border overflow-hidden">
					<table class="w-full text-sm">
						<thead class="bg-slate-50 text-slate-500">
							<tr>
								<th class="px-4 py-2 text-left font-medium">Pasien</th>
								<th class="px-4 py-2 text-left font-medium">Tenaga Medis</th>
								<th class="px-4 py-2 text-left font-medium">Waktu</th>
								<th class="px-4 py-2 text-left font-medium">Status</th>
								<th class="px-4 py-2 text-right font-medium">Aksi</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-200">
							{#each data.inpatientConsultations as item}
								<tr class="hover:bg-slate-50">
									<td class="px-4 py-2">
										<div class="font-medium text-slate-900">{item.patient?.name}</div>
										<div class="text-xs text-muted-foreground">{item.patient?.mrNumber}</div>
									</td>
									<td class="px-4 py-2">
										<div class="font-medium text-slate-900">{item.staff?.name}</div>
										<div class="text-xs text-muted-foreground">{item.staff?.role}</div>
									</td>
									<td class="px-4 py-2">
										<div class="text-sm">{formatDateTime(item.consultation.startTime)}</div>
									</td>
									<td class="px-4 py-2">
										<Badge variant={item.consultation.status === 'completed' ? 'success' : item.consultation.status === 'ongoing' ? 'muted' : 'destructive'} className="capitalize">
											{item.consultation.status}
										</Badge>
									</td>
									<td class="px-4 py-2 text-right">
										<div class="flex justify-end gap-2">
											<Button size="sm" variant={item.consultation.status === 'ongoing' ? 'default' : 'outline'} href={`/simklinik/rekam-medis/${item.consultation.id}${item.consultation.status === 'ongoing' ? '/edit' : ''}`}>
												{item.consultation.status === 'ongoing' ? 'Periksa' : 'Detail'}
											</Button>
											{#if item.consultation.status === 'ongoing'}
												<form method="post" action="?/finish">
													<input type="hidden" name="id" value={item.consultation.id} />
													<Button size="sm" variant="outline" type="submit">
														<CheckCircle class="mr-1 h-4 w-4" /> Selesaikan
													</Button>
												</form>
											{/if}
											<form method="post" action="?/delete">
												<input type="hidden" name="id" value={item.consultation.id} />
												<Button size="sm" variant="destructive" type="submit">
													<Trash2 class="mr-1 h-4 w-4" /> Hapus
												</Button>
											</form>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<p class="text-sm text-muted-foreground">Belum ada konsultasi rawat inap.</p>
			{/if}
		</CardContent>
	</Card>
</div>
