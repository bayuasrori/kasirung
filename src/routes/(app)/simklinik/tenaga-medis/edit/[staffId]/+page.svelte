<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';
	import Select from '$lib/components/ui/select.svelte';
	import { ArrowLeft, Save, Phone, Mail, Briefcase, Hospital, ShieldCheck } from 'lucide-svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import {
		medicalStaffRoles,
		medicalStaffUpdateSchema
	} from '$lib/validations/simklinik/medical-staff';

	export let data: PageData;

	const superform = superForm(data.form, {
		validators: zod4(medicalStaffUpdateSchema),
		resetForm: false
	});

	const { form, errors, submitting, enhance: enhanceForm } = superform;

	function handleCancel() {
		goto('/simklinik/tenaga-medis');
	}

	function getRoleLabel(role: (typeof medicalStaffRoles)[number]) {
		switch (role) {
			case 'doctor':
				return 'Dokter';
			case 'nurse':
				return 'Perawat';
			case 'midwife':
				return 'Bidan';
			case 'specialist':
				return 'Spesialis';
			case 'pharmacist':
				return 'Apoteker';
			case 'lab_technician':
				return 'Teknisi Laboratorium';
			case 'receptionist':
				return 'Penerima';
			default:
				return role;
		}
	}
</script>

<svelte:head>
	<title>Edit Tenaga Medis - Kasirung SIMKlinik</title>
</svelte:head>

<div class="flex-1 space-y-4 p-8">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-3xl font-bold tracking-tight">Edit Tenaga Medis</h2>
			<p class="text-muted-foreground">Perbarui informasi tenaga medis klinik</p>
		</div>
		<div class="flex items-center space-x-2">
			<Button variant="outline" on:click={handleCancel}>
				<ArrowLeft class="mr-2 h-4 w-4" />
				Kembali
			</Button>
		</div>
	</div>

	<div class="max-w-2xl px-4">
		<form method="POST" class="space-y-6" use:enhanceForm>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="nip" class="flex items-center gap-1 text-sm font-medium">
						<span class="text-red-500">*</span>
						NIP
					</Label>
					<Input
						id="nip"
						name="nip"
						bind:value={$form.nip}
						class={$errors.nip?.length ? 'border-red-500 focus:ring-red-200' : ''}
						required
					/>
					{#if $errors.nip?.length}
						<p class="text-sm text-red-500">{$errors.nip[0]}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="name" class="flex items-center gap-1 text-sm font-medium">
						<span class="text-red-500">*</span>
						Nama Lengkap
					</Label>
					<Input
						id="name"
						name="name"
						bind:value={$form.name}
						class={$errors.name?.length ? 'border-red-500 focus:ring-red-200' : ''}
						required
					/>
					{#if $errors.name?.length}
						<p class="text-sm text-red-500">{$errors.name[0]}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="email" class="flex items-center gap-1 text-sm font-medium">
						<Mail class="h-4 w-4 text-muted-foreground" />
						Email
					</Label>
					<Input
						id="email"
						name="email"
						type="email"
						bind:value={$form.email}
						class={$errors.email?.length ? 'border-red-500 focus:ring-red-200' : ''}
					/>
					{#if $errors.email?.length}
						<p class="text-sm text-red-500">{$errors.email[0]}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="phone" class="flex items-center gap-1 text-sm font-medium">
						<Phone class="h-4 w-4 text-muted-foreground" />
						Telepon
					</Label>
					<Input
						id="phone"
						name="phone"
						type="tel"
						bind:value={$form.phone}
						class={$errors.phone?.length ? 'border-red-500 focus:ring-red-200' : ''}
					/>
					{#if $errors.phone?.length}
						<p class="text-sm text-red-500">{$errors.phone[0]}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="specialization" class="flex items-center gap-1 text-sm font-medium">
						<Briefcase class="h-4 w-4 text-muted-foreground" />
						Spesialisasi
					</Label>
					<Textarea
						id="specialization"
						name="specialization"
						bind:value={$form.specialization}
						rows={2}
					/>
				</div>

				<div class="space-y-2">
					<Label for="role" class="flex items-center gap-1 text-sm font-medium">
						<Hospital class="h-4 w-4 text-muted-foreground" />
						Posisi
					</Label>
					<Select
						id="role"
						name="role"
						bind:value={$form.role}
						class={$errors.role?.length ? 'border-red-500 focus:ring-red-200' : ''}
					>
						{#each medicalStaffRoles as roleOption}
							<option value={roleOption}>{getRoleLabel(roleOption)}</option>
						{/each}
					</Select>
					{#if $errors.role?.length}
						<p class="text-sm text-red-500">{$errors.role[0]}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label class="flex items-center gap-1 text-sm font-medium" for="isActive">
						<ShieldCheck class="h-4 w-4 text-muted-foreground" />
						Status Aktif
					</Label>
					<div class="flex items-center gap-2">
						<input
							id="isActive"
							name="isActive"
							type="checkbox"
							value="true"
							bind:checked={$form.isActive}
							class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
						/>
						<input type="hidden" name="isActive" value="false" disabled={$form.isActive} />
						<label for="isActive" class="text-sm text-slate-600">
							{$form.isActive ? 'Aktif' : 'Non-aktif'}
						</label>
					</div>
				</div>
			</div>

			<div class="flex justify-end gap-3 pt-6">
				<Button type="button" variant="outline" on:click={handleCancel} disabled={$submitting}>
					Batal
				</Button>
				<Button type="submit" disabled={$submitting}>
					{#if $submitting}
						Menyimpan...
					{:else}
						<Save class="mr-2 h-4 w-4" />
						Simpan Perubahan
					{/if}
				</Button>
			</div>
		</form>
	</div>
</div>
