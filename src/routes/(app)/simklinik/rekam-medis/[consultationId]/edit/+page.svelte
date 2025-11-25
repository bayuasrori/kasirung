<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import CardDescription from '$lib/components/ui/card-description.svelte';
	import Separator from '$lib/components/ui/separator.svelte';
	import { 
		Save, 
		ArrowLeft, 
		CheckCircle, 
		Activity, 
		Pill, 
		FileText, 
		Plus, 
		Trash2,
		Bed 
	} from 'lucide-svelte';

	export let data: PageData;
	export let form: ActionData;

	let loading = false;

	// Vital signs form state
	let systolic = data.vitalSigns?.systolic ?? '';
	let diastolic = data.vitalSigns?.diastolic ?? '';
	let heartRate = data.vitalSigns?.heartRate ?? '';
	let respiratoryRate = data.vitalSigns?.respiratoryRate ?? '';
	let temperature = data.vitalSigns?.temperature ?? '';
	let oxygenSaturation = data.vitalSigns?.oxygenSaturation ?? '';
	let weight = data.vitalSigns?.weight ?? '';
	let height = data.vitalSigns?.height ?? '';

	// Prescription form state
	let medName = '';
	let medDosage = '';
	let medFreq = '';
	let medDuration = '';
	let medInstructions = '';

	const formatDateTime = (value?: string | Date | null) => {
		if (!value) return '-';
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return '-';
		return date.toLocaleString('id-ID');
	};
</script>

<div class="flex-1 space-y-4 p-8">
	<div class="flex items-center justify-between space-y-2">
		<div class="flex items-center space-x-2">
			<Button variant="ghost" size="icon" href={`/simklinik/rekam-medis/${data.consultation.consultation.id}`}>
				<ArrowLeft class="h-4 w-4" />
			</Button>
			<div>
				<h2 class="text-3xl font-bold tracking-tight">Pemeriksaan Pasien</h2>
				<p class="text-muted-foreground">
					{data.patient?.name} - {data.patient?.mrNumber}
				</p>
			</div>
		</div>
		<div class="flex items-center space-x-2">
			<form action="?/finishConsultation" method="POST" use:enhance>
				<Button type="submit" variant="default" disabled={!data.canEdit}>
					<CheckCircle class="mr-2 h-4 w-4" />
					Selesaikan Konsultasi
				</Button>
			</form>
		</div>
	</div>

	{#if !data.canEdit}
		<div class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
			Anda tidak terdaftar sebagai tenaga medis yang dapat mengedit. Hubungi admin untuk memetakan user ini ke Tenaga Medis.
		</div>
	{/if}
	{#if form?.message}
		<div class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
			{form.message}
		</div>
	{/if}

	<div class="grid gap-6 md:grid-cols-2">
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center space-x-2">
					<Bed class="h-5 w-5" />
					<span>Rawat Inap</span>
				</CardTitle>
				<CardDescription>Status perawatan rawat inap pasien</CardDescription>
			</CardHeader>
			<CardContent>
				{#if data.inpatientAdmission}
					<div class="grid gap-4 md:grid-cols-2">
						<div>
							<p class="text-sm text-muted-foreground">Ruangan / Bed</p>
							<p class="text-base font-semibold">
								{data.inpatientAdmission.bed.room.name} • #{data.inpatientAdmission.bed.bedNumber}
							</p>
							<p class="text-xs text-muted-foreground">{data.inpatientAdmission.bed.room.type}</p>
						</div>
						<div>
							<p class="text-sm text-muted-foreground">Tanggal Masuk</p>
							<p class="text-base font-semibold">{formatDateTime(data.inpatientAdmission.admissionDate)}</p>
							<p class="text-xs text-muted-foreground capitalize">
								Status bed: {data.inpatientAdmission.bed.status}
							</p>
						</div>
					</div>
				{:else}
					<p class="text-sm text-muted-foreground">Pasien tidak sedang rawat inap.</p>
				{/if}
			</CardContent>
		</Card>

		<!-- Clinical Notes (SOAPI Format) -->
		<Card class="md:col-span-2">
			<CardHeader>
				<CardTitle class="flex items-center space-x-2">
					<FileText class="h-5 w-5" />
					<span>Catatan Klinis (Format SOAP)</span>
				</CardTitle>
				<CardDescription>Dokumentasi medis menggunakan format SOAP (Subjective, Objective, Assessment, Plan)</CardDescription>
			</CardHeader>
			<CardContent>
				<form action="?/updateConsultation" method="POST" use:enhance class="space-y-4">
					<!-- Subjective -->
					<div class="grid gap-2">
						<Label for="chiefComplaint">S - Subjective (Keluhan Utama)</Label>
						<Textarea 
							id="chiefComplaint" 
							name="chiefComplaint" 
							value={data.consultation.consultation.chiefComplaint ?? ''} 
							placeholder="Keluhan pasien, riwayat penyakit sekarang..."
							class="min-h-[80px]"
						/>
					</div>

					<!-- Objective -->
					<div class="grid gap-2">
						<Label for="physicalExamination">O - Objective (Pemeriksaan Fisik)</Label>
						<Textarea 
							id="physicalExamination" 
							name="physicalExamination" 
							value={data.consultation.consultation.physicalExamination ?? ''} 
							placeholder="Hasil pemeriksaan fisik, tanda vital, pemeriksaan penunjang..."
							class="min-h-[80px]"
						/>
					</div>

					<!-- Assessment -->
					<div class="grid gap-2">
						<Label for="diagnosis">A - Assessment (Diagnosis)</Label>
						<Input 
							id="diagnosis" 
							name="diagnosis" 
							value={data.consultation.consultation.diagnosis ?? ''} 
							placeholder="Diagnosis utama dan diagnosis banding"
						/>
					</div>

					<!-- Plan -->
					<div class="grid gap-2">
						<Label for="treatment">P - Plan (Rencana Tindakan)</Label>
						<Textarea 
							id="treatment" 
							name="treatment" 
							value={data.consultation.consultation.treatment ?? ''} 
							placeholder="Rencana pengobatan, tindakan, edukasi, rujukan..."
							class="min-h-[80px]"
						/>
					</div>

					<!-- Additional Notes -->
					<div class="grid gap-2">
						<Label for="notes">Catatan Tambahan (Opsional)</Label>
						<Textarea 
							id="notes" 
							name="notes" 
							value={data.consultation.consultation.notes ?? ''} 
							placeholder="Catatan penting lainnya..."
							class="min-h-[60px]"
						/>
					</div>

					<div class="flex justify-end">
						<Button type="submit" variant="secondary" disabled={!data.canEdit}>
							<Save class="mr-2 h-4 w-4" />
							Simpan Catatan SOAP
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>

		<!-- Vital Signs -->
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center space-x-2">
					<Activity class="h-5 w-5" />
					<span>Tanda Vital</span>
				</CardTitle>
				<CardDescription>Pengukuran tanda vital pasien saat ini</CardDescription>
			</CardHeader>
			<CardContent>
				<form action="?/updateVitals" method="POST" use:enhance class="space-y-4">
					<input type="hidden" name="patientId" value={data.patient?.id} />
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label>Tekanan Darah (mmHg)</Label>
							<div class="flex items-center space-x-2">
								<Input type="number" name="systolic" placeholder="Sys" bind:value={systolic} />
								<span>/</span>
								<Input type="number" name="diastolic" placeholder="Dia" bind:value={diastolic} />
							</div>
						</div>
						<div class="space-y-2">
							<Label for="heartRate">Detak Jantung (bpm)</Label>
							<Input type="number" id="heartRate" name="heartRate" bind:value={heartRate} />
						</div>
						<div class="space-y-2">
							<Label for="respiratoryRate">Laju Pernapasan (x/mnt)</Label>
							<Input type="number" id="respiratoryRate" name="respiratoryRate" bind:value={respiratoryRate} />
						</div>
						<div class="space-y-2">
							<Label for="temperature">Suhu (°C)</Label>
							<Input type="number" step="0.1" id="temperature" name="temperature" bind:value={temperature} />
						</div>
						<div class="space-y-2">
							<Label for="weight">Berat Badan (kg)</Label>
							<Input type="number" step="0.1" id="weight" name="weight" bind:value={weight} />
						</div>
						<div class="space-y-2">
							<Label for="height">Tinggi Badan (cm)</Label>
							<Input type="number" id="height" name="height" bind:value={height} />
						</div>
						<div class="space-y-2 col-span-2">
							<Label for="oxygenSaturation">Saturasi Oksigen (%)</Label>
							<Input type="number" id="oxygenSaturation" name="oxygenSaturation" bind:value={oxygenSaturation} />
						</div>
					</div>
					<div class="flex justify-end">
						<Button type="submit" variant="secondary" disabled={!data.canEdit}>
							<Save class="mr-2 h-4 w-4" />
							Simpan Tanda Vital
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>

		<!-- Prescriptions -->
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center space-x-2">
					<Pill class="h-5 w-5" />
					<span>Resep Obat</span>
				</CardTitle>
				<CardDescription>Tambahkan resep obat untuk pasien</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="space-y-6">
					<!-- Add Prescription Form -->
					<form 
						action="?/addPrescription" 
						method="POST" 
						use:enhance={() => {
							return async ({ result, update }) => {
								if (result.type === 'success') {
									// Clear form after successful submission
									medName = '';
									medDosage = '';
									medFreq = '';
									medDuration = '';
									medInstructions = '';
								}
								await update();
							};
						}}
						class="space-y-4 border p-4 rounded-md bg-muted/20"
					>
						<input type="hidden" name="patientId" value={data.patient?.id} />
						
						<!-- Medication Name with Quick Select -->
						<div class="grid gap-2">
							<Label for="medication">Nama Obat *</Label>
							<Input 
								id="medication" 
								name="medication" 
								bind:value={medName}
								placeholder="Ketik nama obat atau pilih dari daftar umum..." 
								required 
								list="common-medications"
							/>
							<datalist id="common-medications">
								<option value="Paracetamol"></option>
								<option value="Amoxicillin"></option>
								<option value="Ibuprofen"></option>
								<option value="Cetirizine"></option>
								<option value="Omeprazole"></option>
								<option value="Metformin"></option>
								<option value="Amlodipine"></option>
								<option value="Simvastatin"></option>
								<option value="Salbutamol"></option>
								<option value="Dexamethasone"></option>
							</datalist>
						</div>

						<div class="grid grid-cols-2 gap-2">
							<!-- Dosage with Examples -->
							<div class="space-y-2">
								<Label for="dosage">Dosis *</Label>
								<Input 
									id="dosage" 
									name="dosage" 
									bind:value={medDosage}
									placeholder="500mg, 10ml, 1 tablet" 
									required 
								/>
							</div>
							
							<!-- Frequency with Common Options -->
							<div class="space-y-2">
								<Label for="frequency">Frekuensi *</Label>
								<Input 
									id="frequency" 
									name="frequency" 
									bind:value={medFreq}
									placeholder="3x1, 2x1, 1x1" 
									required 
									list="common-frequencies"
								/>
								<datalist id="common-frequencies">
									<option value="1x1"></option>
									<option value="2x1"></option>
									<option value="3x1"></option>
									<option value="4x1"></option>
									<option value="3x2"></option>
									<option value="Bila perlu"></option>
								</datalist>
							</div>
						</div>

						<div class="grid grid-cols-2 gap-2">
							<!-- Duration with Common Options -->
							<div class="space-y-2">
								<Label for="duration">Durasi *</Label>
								<Input 
									id="duration" 
									name="duration" 
									bind:value={medDuration}
									placeholder="3 hari, 7 hari, 14 hari" 
									required 
									list="common-durations"
								/>
								<datalist id="common-durations">
									<option value="3 hari"></option>
									<option value="5 hari"></option>
									<option value="7 hari"></option>
									<option value="10 hari"></option>
									<option value="14 hari"></option>
									<option value="30 hari"></option>
									<option value="Habis"></option>
								</datalist>
							</div>
							
							<!-- Instructions with Common Options -->
							<div class="space-y-2">
								<Label for="instructions">Instruksi</Label>
								<Input 
									id="instructions" 
									name="instructions" 
									bind:value={medInstructions}
									placeholder="Sesudah makan, sebelum makan..." 
									list="common-instructions"
								/>
								<datalist id="common-instructions">
									<option value="Sesudah makan"></option>
									<option value="Sebelum makan"></option>
									<option value="Bersama makanan"></option>
									<option value="Sebelum tidur"></option>
									<option value="Pagi hari"></option>
									<option value="Bila perlu"></option>
									<option value="Dihabiskan"></option>
								</datalist>
							</div>
						</div>

						<Button type="submit" size="sm" class="w-full" disabled={!data.canEdit}>
							<Plus class="mr-2 h-4 w-4" />
							Tambah Resep
						</Button>
					</form>

					<!-- Prescription List -->
					<div class="space-y-2">
						<h4 class="text-sm font-medium">Daftar Resep</h4>
						{#if data.prescriptions.length > 0}
							<div class="border rounded-md">
								<div class="w-full overflow-auto">
									<table class="w-full caption-bottom text-sm">
										<thead class="[&_tr]:border-b">
											<tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
												<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Obat</th>
												<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Aturan</th>
												<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[50px]"></th>
											</tr>
										</thead>
										<tbody class="[&_tr:last-child]:border-0">
											{#each data.prescriptions as prescription}
												<tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
													<td class="p-4 align-middle [&:has([role=checkbox])]:pr-0">
														<div class="font-medium">{prescription.medication}</div>
														<div class="text-xs text-muted-foreground">{prescription.dosage}</div>
													</td>
													<td class="p-4 align-middle [&:has([role=checkbox])]:pr-0">
														<div class="text-sm">{prescription.frequency}</div>
														<div class="text-xs text-muted-foreground">{prescription.duration}</div>
													</td>
													<td class="p-4 align-middle [&:has([role=checkbox])]:pr-0">
														<form action="?/deletePrescription" method="POST" use:enhance>
															<input type="hidden" name="id" value={prescription.id} />
															<Button type="submit" variant="ghost" size="icon" class="h-8 w-8 text-destructive" disabled={!data.canEdit}>
																<Trash2 class="h-4 w-4" />
															</Button>
														</form>
													</td>
												</tr>
											{/each}
										</tbody>
									</table>
								</div>
							</div>
						{:else}
							<div class="text-center py-4 text-sm text-muted-foreground border rounded-md border-dashed">
								Belum ada resep ditambahkan
							</div>
						{/if}
					</div>
				</div>
			</CardContent>
		</Card>
	</div>
</div>
