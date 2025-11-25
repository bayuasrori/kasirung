<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';
	import Select from '$lib/components/ui/select.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import CardDescription from '$lib/components/ui/card-description.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import { ArrowLeft, Save, ShieldCheck } from 'lucide-svelte';
	import { superForm } from 'sveltekit-superforms/client';

	export let data: PageData;

	const superform = superForm(data.form);
	const { form, errors, submitting, enhance: enhanceForm, reset } = superform;

	function handleCancel() {
		reset();
		goto('/simklinik/layanan');
	}
</script>

<svelte:head>
	<title>Edit Layanan Medis - Kasirung SIMKlinik</title>
</svelte:head>

<div class="flex-1 space-y-4 p-8">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-3xl font-bold tracking-tight">Edit Layanan Medis</h2>
			<p class="text-muted-foreground">Perbarui informasi layanan klinik</p>
		</div>
		<div class="flex items-center space-x-2">
			<Button variant="outline" on:click={handleCancel}>
				<ArrowLeft class="mr-2 h-4 w-4" />
				Kembali
			</Button>
		</div>
	</div>

	<Card class="max-w-3xl">
		<CardHeader>
			<CardTitle>{data.service?.name}</CardTitle>
			<CardDescription>Perbarui detail layanan berikut</CardDescription>
		</CardHeader>
		<CardContent>
			<form method="POST" class="space-y-6" use:enhanceForm>
				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="code">Kode Layanan</Label>
						<Input
							id="code"
							name="code"
							bind:value={$form.code}
							class={$errors.code?.length ? 'border-red-500 focus:ring-red-200' : ''}
							required
						/>
						{#if $errors.code?.length}
							<p class="text-sm text-red-500">{$errors.code[0]}</p>
						{/if}
					</div>
					<div class="space-y-2">
						<Label for="name">Nama Layanan</Label>
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
				</div>

				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="categoryId">Kategori</Label>
						<Select id="categoryId" name="categoryId" bind:value={$form.categoryId}>
							<option value="">Pilih kategori</option>
							{#each data.categories as category}
								<option value={category.id}>{category.name}</option>
							{/each}
						</Select>
					</div>
					<div class="space-y-2">
						<Label for="price">Harga (Rp)</Label>
						<Input
							id="price"
							name="price"
							type="text"
							inputmode="decimal"
							bind:value={$form.price}
							class={$errors.price?.length ? 'border-red-500 focus:ring-red-200' : ''}
						/>
						{#if $errors.price?.length}
							<p class="text-sm text-red-500">{$errors.price[0]}</p>
						{/if}
					</div>
					<div class="space-y-2">
						<Label for="duration">Durasi (menit)</Label>
						<Input
							id="duration"
							name="duration"
							type="text"
							inputmode="numeric"
							bind:value={$form.duration}
							class={$errors.duration?.length ? 'border-red-500 focus:ring-red-200' : ''}
						/>
						{#if $errors.duration?.length}
							<p class="text-sm text-red-500">{$errors.duration[0]}</p>
						{/if}
					</div>
					<div class="space-y-2">
						<Label class="flex items-center gap-2 text-sm font-medium" for="isActive">
							<ShieldCheck class="h-4 w-4 text-muted-foreground" />
							Status
						</Label>
						<div class="flex items-center gap-2">
							<input type="hidden" name="isActive" value="false" disabled={$form.isActive} />
							<input
								id="isActive"
								name="isActive"
								type="checkbox"
								value="true"
								bind:checked={$form.isActive}
								class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
							/>
							<label for="isActive" class="text-sm text-slate-600">
								{$form.isActive ? 'Aktif' : 'Non-aktif'}
							</label>
						</div>
					</div>
				</div>

				<div class="space-y-2">
					<Label for="description">Deskripsi</Label>
					<Textarea
						id="description"
						name="description"
						rows={4}
						bind:value={$form.description}
					/>
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
		</CardContent>
	</Card>
</div>
