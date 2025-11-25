<script lang="ts">
	import { get } from 'svelte/store';
	import type { SuperForm, ValidationErrors } from 'sveltekit-superforms';

	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import CardDescription from '$lib/components/ui/card-description.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';
	import Select from '$lib/components/ui/select.svelte';

	import { AlertCircle, Calendar, Heart, Mail, MapPin, Phone, Save, User } from 'lucide-svelte';

	type PatientFormValues = {
		name: string;
		dateOfBirth: string;
		gender: string;
		phone: string;
		email: string;
		address: string;
		bloodType: string;
		allergies: string;
		emergencyContactName: string;
		emergencyContactPhone: string;
		emergencyContactRelation: string;
		insuranceId: string;
		insuranceProvider: string;
		notes: string;
	};

	export let form: SuperForm<PatientFormValues>;
	export let onCancel: () => void;

	const formData = form.form;
	const formErrors = form.errors;
	const submittingState = form.submitting;

	let values = get(formData);
	$: values = $formData;

	let errors: ValidationErrors<PatientFormValues> = get(formErrors);
	$: errors = $formErrors;

	let submitting = get(submittingState);
	$: submitting = $submittingState;

	function formatPhoneNumber(value: string) {
		// Remove all non-digit characters
		const cleaned = value.replace(/\D/g, '');
		
		// Format for Indonesian phone numbers
		if (cleaned.length <= 4) {
			return cleaned;
		} else if (cleaned.length <= 8) {
			return cleaned.slice(0, 4) + '-' + cleaned.slice(4);
		} else if (cleaned.length <= 12) {
			return cleaned.slice(0, 4) + '-' + cleaned.slice(4, 8) + '-' + cleaned.slice(8);
		} else {
			return cleaned.slice(0, 4) + '-' + cleaned.slice(4, 8) + '-' + cleaned.slice(8, 12);
		}
	}

	function updateField<K extends keyof PatientFormValues>(field: K, value: PatientFormValues[K]) {
		formData.update((current) => ({ ...current, [field]: value }));
	}

	function handlePhoneInput(field: 'phone' | 'emergencyContactPhone') {
		return (event: Event) => {
			const input = event.target as HTMLInputElement;
			const formatted = formatPhoneNumber(input.value);
			input.value = formatted;
			updateField(field, formatted);
		};
	}

	const getFieldError = (field: keyof PatientFormValues) => errors?.[field]?.[0];
	const hasFieldError = (field: keyof PatientFormValues) => Boolean(errors?.[field]?.length);
</script>

<form method="POST" use:form.enhance>
	<div class="space-y-6">
		<!-- Informasi Dasar Pasien -->
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<User class="h-5 w-5" />
					Informasi Dasar Pasien
				</CardTitle>
				<CardDescription>Data identitas utama pasien</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="name" class="flex items-center gap-1">
							Nama Lengkap
							<span class="text-red-500">*</span>
						</Label>
						<Input
							id="name"
							name="name"
							type="text"
							value={values.name ?? ''}
							on:input={(event) => updateField('name', (event.target as HTMLInputElement).value)}
							placeholder="Masukkan nama lengkap pasien"
							class={hasFieldError('name') ? 'border-red-500' : ''}
							required
						/>
						{#if getFieldError('name')}
							<p class="text-sm text-red-500">{getFieldError('name')}</p>
						{/if}
					</div>

					<div class="space-y-2">
						<Label for="dateOfBirth" class="flex items-center gap-1">
							<Calendar class="h-4 w-4" />
							Tanggal Lahir
							<span class="text-red-500">*</span>
						</Label>
						<Input
							id="dateOfBirth"
							name="dateOfBirth"
							type="date"
							value={values.dateOfBirth ?? ''}
							on:input={(event) => updateField('dateOfBirth', (event.target as HTMLInputElement).value)}
							class={hasFieldError('dateOfBirth') ? 'border-red-500' : ''}
							required
						/>
						{#if getFieldError('dateOfBirth')}
							<p class="text-sm text-red-500">{getFieldError('dateOfBirth')}</p>
						{/if}
					</div>

					<div class="space-y-2">
						<Label for="gender" class="flex items-center gap-1">
							Jenis Kelamin
							<span class="text-red-500">*</span>
						</Label>
							<Select
							id="gender"
							name="gender"
							value={values.gender ?? ''}
							on:change={(event) => updateField('gender', (event.target as HTMLSelectElement).value)}
							class={hasFieldError('gender') ? 'border-red-500' : ''}
							required
						>
							<option value="">Pilih jenis kelamin</option>
							<option value="L">Laki-laki</option>
							<option value="P">Perempuan</option>
						</Select>
						{#if getFieldError('gender')}
							<p class="text-sm text-red-500">{getFieldError('gender')}</p>
						{/if}
					</div>

					<div class="space-y-2">
						<Label for="bloodType">Golongan Darah</Label>
						<Select
							id="bloodType"
							name="bloodType"
							value={values.bloodType ?? ''}
							on:change={(event) => updateField('bloodType', (event.target as HTMLSelectElement).value)}
						>
							<option value="">Pilih golongan darah</option>
							<option value="A">A</option>
							<option value="B">B</option>
							<option value="AB">AB</option>
							<option value="O">O</option>
							<option value="unknown">Tidak diketahui</option>
						</Select>
					</div>
				</div>
			</CardContent>
		</Card>

		<!-- Informasi Kontak -->
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<Phone class="h-5 w-5" />
					Informasi Kontak
				</CardTitle>
				<CardDescription>Data untuk komunikasi dengan pasien</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="phone" class="flex items-center gap-1">
							<Phone class="h-4 w-4" />
							Nomor Telepon
						</Label>
						<Input
							id="phone"
							name="phone"
							type="tel"
							value={values.phone ?? ''}
							placeholder="0812-3456-7890"
							class={hasFieldError('phone') ? 'border-red-500' : ''}
							on:input={handlePhoneInput('phone')}
						/>
						{#if getFieldError('phone')}
							<p class="text-sm text-red-500">{getFieldError('phone')}</p>
						{/if}
					</div>

					<div class="space-y-2">
						<Label for="email" class="flex items-center gap-1">
							<Mail class="h-4 w-4" />
							Email
						</Label>
						<Input
							id="email"
							name="email"
							type="email"
							value={values.email ?? ''}
							on:input={(event) => updateField('email', (event.target as HTMLInputElement).value)}
							placeholder="pasien@example.com"
							class={hasFieldError('email') ? 'border-red-500' : ''}
						/>
						{#if getFieldError('email')}
							<p class="text-sm text-red-500">{getFieldError('email')}</p>
						{/if}
					</div>
				</div>

				<div class="space-y-2">
					<Label for="address" class="flex items-center gap-1">
						<MapPin class="h-4 w-4" />
						Alamat
					</Label>
					<Textarea
						id="address"
						name="address"
						value={values.address ?? ''}
						on:input={(event) => updateField('address', (event.target as HTMLTextAreaElement).value)}
						placeholder="Masukkan alamat lengkap pasien"
						rows={3}
					/>
				</div>
			</CardContent>
		</Card>

		<!-- Informasi Medis -->
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<Heart class="h-5 w-5" />
					Informasi Medis
				</CardTitle>
				<CardDescription>Riwayat medis dan kondisi kesehatan</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<Label for="allergies">Alergi</Label>
					<Textarea
						id="allergies"
						name="allergies"
						value={values.allergies ?? ''}
						on:input={(event) => updateField('allergies', (event.target as HTMLTextAreaElement).value)}
						placeholder="Contoh: Alergi terhadap obat penicilin, kacang-kacangan, makanan laut..."
						rows={2}
					/>
					<p class="text-xs text-muted-foreground">
						Informasi alergi sangat penting untuk keamanan pengobatan pasien
					</p>
				</div>
			</CardContent>
		</Card>

		<!-- Kontak Darurat -->
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<AlertCircle class="h-5 w-5" />
					Kontak Darurat
				</CardTitle>
				<CardDescription>Informasi kontak untuk keadaan darurat</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="emergencyContactName">Nama Kontak Darurat</Label>
						<Input
							id="emergencyContactName"
							name="emergencyContactName"
							value={values.emergencyContactName ?? ''}
							on:input={(event) =>
								updateField('emergencyContactName', (event.target as HTMLInputElement).value)}
							placeholder="Nama orang yang dapat dihubungi"
						/>
					</div>

					<div class="space-y-2">
						<Label for="emergencyContactRelation">Hubungan</Label>
						<Select
							id="emergencyContactRelation"
							name="emergencyContactRelation"
							value={values.emergencyContactRelation ?? ''}
							on:change={(event) =>
								updateField(
									'emergencyContactRelation',
									(event.target as HTMLSelectElement).value
								)}
						>
							<option value="">Pilih hubungan</option>
							<option value="Orang Tua">Orang Tua</option>
							<option value="Suami/Istri">Suami/Istri</option>
							<option value="Anak">Anak</option>
							<option value="Saudara">Saudara</option>
							<option value="Teman">Teman</option>
							<option value="Lainnya">Lainnya</option>
						</Select>
					</div>

					<div class="space-y-2 md:col-span-2">
						<Label for="emergencyContactPhone">Nomor Telepon Darurat</Label>
						<Input
							id="emergencyContactPhone"
							name="emergencyContactPhone"
							type="tel"
							value={values.emergencyContactPhone ?? ''}
							placeholder="0812-3456-7890"
							on:input={handlePhoneInput('emergencyContactPhone')}
						/>
					</div>
				</div>
			</CardContent>
		</Card>

		<!-- Informasi Asuransi -->
		<Card>
			<CardHeader>
				<CardTitle>Informasi Asuransi</CardTitle>
				<CardDescription>Data asuransi kesehatan (opsional)</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="insuranceProvider">Penyedia Asuransi</Label>
						<Select
							id="insuranceProvider"
							name="insuranceProvider"
							value={values.insuranceProvider ?? ''}
							on:change={(event) =>
								updateField('insuranceProvider', (event.target as HTMLSelectElement).value)}
						>
							<option value="">Tidak ada asuransi</option>
							<option value="BPJS">BPJS Kesehatan</option>
							<option value="Askes">Askes</option>
							<option value="Jiwasraya">Jiwasraya</option>
							<option value="AIA">AIA</option>
							<option value="Allianz">Allianz</option>
							<option value="Prudential">Prudential</option>
							<option value="Cigna">Cigna</option>
							<option value="Lainnya">Lainnya</option>
						</Select>
					</div>

					<div class="space-y-2">
						<Label for="insuranceId">Nomor Asuransi</Label>
						<Input
							id="insuranceId"
							name="insuranceId"
							value={values.insuranceId ?? ''}
							on:input={(event) => updateField('insuranceId', (event.target as HTMLInputElement).value)}
							placeholder="Masukkan nomor asuransi"
						/>
					</div>
				</div>
			</CardContent>
		</Card>

		<!-- Catatan Tambahan -->
		<Card>
			<CardHeader>
				<CardTitle>Catatan Tambahan</CardTitle>
				<CardDescription>Informasi penting lainnya tentang pasien</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="space-y-2">
					<Label for="notes">Catatan</Label>
					<Textarea
						id="notes"
						name="notes"
						value={values.notes ?? ''}
						on:input={(event) => updateField('notes', (event.target as HTMLTextAreaElement).value)}
						placeholder="Informasi penting lainnya tentang pasien (preferensi dokter, kondisi khusus, dll)"
						rows={3}
					/>
				</div>
			</CardContent>
		</Card>

		<!-- Form Actions -->
		<div class="flex justify-between items-center pt-6">
			<Button
				type="button"
				variant="outline"
				on:click={onCancel}
				disabled={submitting}
			>
				Batal
			</Button>
			<div class="flex gap-3">
				<Button
					type="reset"
					variant="outline"
					on:click={() => form.reset()}
					disabled={submitting}
				>
					Reset Form
				</Button>
				<Button
					type="submit"
					disabled={submitting}
				>
					{#if submitting}
						Menyimpan...
					{:else}
						<Save class="mr-2 h-4 w-4" />
						Simpan Pasien
					{/if}
				</Button>
			</div>
		</div>
	</div>
</form>
