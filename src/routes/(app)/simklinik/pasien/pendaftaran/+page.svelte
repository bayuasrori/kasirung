<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { browser } from '$app/environment';
	
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
	import Badge from '$lib/components/ui/badge.svelte';
	import Toast from '$lib/components/ui/toast.svelte';
	
	import { ArrowLeft, Save, User, Phone, Mail, MapPin, Calendar, Heart, AlertCircle } from 'lucide-svelte';
import PatientForm from './_components/patient-form-plain.svelte';
import type { PageData } from './$types';

export let data: PageData & Record<string, any>;

	let showToast = false;
	let toastMessage = '';
	let toastType: 'success' | 'error' | 'warning' = 'success';

	$: if (data.success) {
		if (browser) {
			// Show confirmation dialog first (using standard browser confirm)
			const confirmed = confirm(`${data.message}\n\nApakah Anda ingin melihat daftar pasien sekarang?`);
			
			if (confirmed && data.redirectUrl) {
				// Only redirect if user confirms
				window.location.href = data.redirectUrl;
			}
		}
		
		if (data.message) {
			toastMessage = data.message;
			toastType = 'success';
			showToast = true;
		}
	}

	function handleCancel() {
		goto('/simklinik/pasien');
	}
</script>

<svelte:head>
	<title>Pendaftaran Pasien - Kasirung SIMKlinik</title>
</svelte:head>

<div class="flex-1 space-y-4 p-8">
	<div class="flex items-center space-y-2">
		<Button 
			variant="ghost" 
			class="mr-4" 
			on:click={handleCancel}
		>
			<ArrowLeft class="mr-2 h-4 w-4" />
			Kembali
		</Button>
		<div>
			<h2 class="text-3xl font-bold tracking-tight">Pendaftaran Pasien Baru</h2>
			<p class="text-muted-foreground">Tambah data pasien baru ke sistem klinik</p>
		</div>
	</div>

	<div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
		<div class="xl:col-span-2 space-y-6">
			<!-- Form Informasi Dasar -->
			<PatientForm 
				initialData={data.form}
				data={data.data}
				errors={data.errors}
				message={data.message}
				onCancel={handleCancel}
			/>
		</div>

		<!-- Sidebar Informasi -->
		<div class="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<AlertCircle class="h-5 w-5" />
						Petungan Pendaftaran
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-3">
					<div class="space-y-2">
						<Label class="text-sm font-medium">Informasi Wajib</Label>
						<div class="space-y-1 text-sm">
							<div class="flex items-center gap-2">
								<div class="w-2 h-2 bg-green-500 rounded-full"></div>
								<span>Nama lengkap pasien</span>
							</div>
							<div class="flex items-center gap-2">
								<div class="w-2 h-2 bg-green-500 rounded-full"></div>
								<span>Tanggal lahir</span>
							</div>
							<div class="flex items-center gap-2">
								<div class="w-2 h-2 bg-green-500 rounded-full"></div>
								<span>Jenis kelamin</span>
							</div>
						</div>
					</div>
					
					<div class="space-y-2">
						<Label class="text-sm font-medium">Nama File Format</Label>
						<p class="text-sm text-muted-foreground">
							Nomor Rekam Medis (RM) akan digenerate otomatis dengan format: MR2024XXXX
						</p>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<Heart class="h-5 w-5" />
						Darurat
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-3">
					<div class="space-y-2">
						<Label class="text-sm font-medium">Kontak Darurat</Label>
						<p class="text-sm text-muted-foreground">
							Isi informasi kontak darurat untuk keadaan emergency. Informasi ini penting untuk komunikasi cepat dengan keluarga.
						</p>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<MapPin class="h-5 w-5" />
						Asuransi
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-3">
					<div class="space-y-2">
						<Label class="text-sm font-medium">Informasi Asuransi</Label>
						<p class="text-sm text-muted-foreground">
							Jika pasien memiliki asuransi kesehatan, lengkapi informasi asuransi untuk kemudahan prosedur klaim.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>
</div>

<!-- Toast Notification -->
<Toast 
	bind:show={showToast} 
	message={toastMessage} 
	type={toastType}
	on:dismiss={() => showToast = false}
/>
