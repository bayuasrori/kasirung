<script lang="ts">
	import { enhance } from '$app/forms';
	import { browser } from '$app/environment';
	import type { SubmitFunction } from '@sveltejs/kit';
	
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
	
	import { User, Phone, Mail, MapPin, Calendar, Heart, AlertCircle } from 'lucide-svelte';

	export let initialData = {
		name: '',
		dateOfBirth: '',
		gender: '',
		phone: '',
		email: '',
		address: '',
		bloodType: 'unknown',
		allergies: '',
		emergencyContactName: '',
		emergencyContactPhone: '',
		emergencyContactRelation: '',
		insuranceId: '',
		insuranceProvider: '',
		notes: ''
	};

	export let data: any = null; // Form data from server on error
	export let errors: any = {};
	export let message = '';
	export let onCancel: () => void;
	export let submitting = false;

	let formData = { ...initialData };

	// Reactively update form data when initialData changes (server response)
	$: formData = Object.keys(errors).length > 0 ? { ...data || initialData } : { ...initialData };

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

	function handlePhoneInput(e: Event) {
		const input = e.target as HTMLInputElement;
		input.value = formatPhoneNumber(input.value);
		formData.phone = input.value;
	}

	function handleReset() {
		formData = { ...initialData };
	}

	const handleEnhance: SubmitFunction = () => {
		submitting = true;
		return async ({ update }) => {
			submitting = false;
			await update();
		};
	};
</script>

<form method="POST" use:enhance={handleEnhance} class="space-y-6">
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
						bind:value={formData.name}
						placeholder="Masukkan nama lengkap pasien"
						class={errors.name ? 'border-red-500' : ''}
						required
					/>
					{#if errors.name}
						<p class="text-sm text-red-500">{errors.name}</p>
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
						bind:value={formData.dateOfBirth}
						class={errors.dateOfBirth ? 'border-red-500' : ''}
						required
					/>
					{#if errors.dateOfBirth}
						<p class="text-sm text-red-500">{errors.dateOfBirth}</p>
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
						bind:value={formData.gender}
						class={errors.gender ? 'border-red-500' : ''}
						required
					>
						<option value="">Pilih jenis kelamin</option>
						<option value="male">Laki-laki</option>
						<option value="female">Perempuan</option>
						<option value="other">Lainnya</option>
					</Select>
					{#if errors.gender}
						<p class="text-sm text-red-500">{errors.gender}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="bloodType">Golongan Darah</Label>
					<Select
						id="bloodType"
						name="bloodType"
						bind:value={formData.bloodType}
					>
						<option value="">Pilih golongan darah</option>
						<option value="unknown">Tidak diketahui</option>
					</Select>
					<p class="text-xs text-muted-foreground">
						Komponen golongan darah akan dikembangkan lebih lanjut
					</p>
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
						bind:value={formData.phone}
						placeholder="0812-3456-7890"
						class={errors.phone ? 'border-red-500' : ''}
						on:input={handlePhoneInput}
					/>
					{#if errors.phone}
						<p class="text-sm text-red-500">{errors.phone}</p>
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
						bind:value={formData.email}
						placeholder="pasien@example.com"
						class={errors.email ? 'border-red-500' : ''}
					/>
					{#if errors.email}
						<p class="text-sm text-red-500">{errors.email}</p>
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
					bind:value={formData.address}
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
					bind:value={formData.allergies}
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
						bind:value={formData.emergencyContactName}
						placeholder="Nama orang yang dapat dihubungi"
					/>
				</div>

				<div class="space-y-2">
					<Label for="emergencyContactRelation">Hubungan</Label>
					<Select
						id="emergencyContactRelation"
						name="emergencyContactRelation"
						bind:value={formData.emergencyContactRelation}
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
						bind:value={formData.emergencyContactPhone}
						placeholder="0812-3456-7890"
						on:input={handlePhoneInput}
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
						bind:value={formData.insuranceProvider}
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
						bind:value={formData.insuranceId}
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
					bind:value={formData.notes}
					placeholder="Informasi penting lainnya tentang pasien (preferensi dokter, kondisi khusus, dll)"
					rows={3}
				/>
			</div>
		</CardContent>
	</Card>

	<!-- Error Message -->
	{#if message}
		<div class="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
			<p class="text-sm font-medium">{message}</p>
		</div>
	{/if}

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
				on:click={handleReset}
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
					Simpan Pasien
				{/if}
			</Button>
		</div>
	</div>
</form>
