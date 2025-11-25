<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import CardDescription from '$lib/components/ui/card-description.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Select from '$lib/components/ui/select.svelte';
	import Toast from '$lib/components/ui/toast.svelte';

	import { Plus, RefreshCw } from 'lucide-svelte';
	import ServiceTable from './_components/service-table.svelte';

	export let data: PageData;

	let showToast = false;
	let toastMessage = '';
	let toastType: 'success' | 'error' | 'warning' = 'success';

	$: {
		const success = $page.url.searchParams.get('success');
		if (success === 'true') {
			toastMessage = $page.url.searchParams.get('message') || 'Operasi berhasil diselesaikan';
			toastType = 'success';
			showToast = true;
		} else if (success === 'false') {
			toastMessage = $page.url.searchParams.get('message') || 'Terjadi kesalahan saat memproses data';
			toastType = 'error';
			showToast = true;
		}
	}

	function resetFilters() {
		const url = new URL(window.location.toString());
		url.searchParams.delete('search');
		url.searchParams.delete('category');
		url.searchParams.delete('page');
		window.location.href = url.toString();
	}
</script>

<svelte:head>
	<title>Manajemen Layanan Medis - Kasirung SIMKlinik</title>
</svelte:head>

<div class="flex-1 space-y-4 p-8">
	<div class="flex items-center justify-between space-y-2">
		<div>
			<h2 class="text-3xl font-bold tracking-tight">Layanan Medis</h2>
			<p class="text-muted-foreground">Kelola daftar layanan medis dan tarif klinik</p>
		</div>
		<div class="flex items-center space-x-2">
			<Button href="/simklinik/layanan/tambah">
				<Plus class="mr-2 h-4 w-4" />
				Tambah Layanan
			</Button>
		</div>
	</div>

	<Card>
		<CardHeader>
			<CardTitle>Filter Layanan</CardTitle>
			<CardDescription>Cari layanan berdasarkan nama atau kategori</CardDescription>
		</CardHeader>
		<CardContent>
			<form method="GET" class="grid gap-4 md:grid-cols-3">
				<div class="space-y-2">
					<Label for="search">Nama layanan</Label>
					<Input
						id="search"
						name="search"
						placeholder="Cari berdasarkan nama layanan..."
						value={data.search}
					/>
				</div>
				<div class="space-y-2">
					<Label for="category">Kategori</Label>
					<Select id="category" name="category" value={data.categoryId}>
						<option value="">Semua kategori</option>
						{#each data.categories as category}
							<option value={category.id}>{category.name}</option>
						{/each}
					</Select>
				</div>
				<div class="flex items-end gap-3">
					<Button type="submit" class="w-full">
						Terapkan Filter
					</Button>
					<Button type="button" variant="outline" on:click={resetFilters} class="w-full">
						<RefreshCw class="mr-2 h-4 w-4" />
						Reset
					</Button>
				</div>
			</form>
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<CardTitle>Daftar Layanan</CardTitle>
			<CardDescription>Total {data.total} layanan terdaftar</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			<ServiceTable data={data.services} />
			<div class="flex items-center justify-between text-sm text-muted-foreground">
				<span>Halaman {data.page} dari {data.totalPages}</span>
				<div class="space-x-2">
					{#if data.page > 1}
						<a
							class="underline hover:text-foreground"
							href={`?page=${data.page - 1}&search=${data.search}&category=${data.categoryId}`}
						>
							Sebelumnya
						</a>
					{/if}
					{#if data.page < data.totalPages}
						<a
							class="underline hover:text-foreground"
							href={`?page=${data.page + 1}&search=${data.search}&category=${data.categoryId}`}
						>
							Selanjutnya
						</a>
					{/if}
				</div>
			</div>
		</CardContent>
	</Card>

	<Toast
		bind:show={showToast}
		message={toastMessage}
		type={toastType}
		on:dismiss={() => (showToast = false)}
	/>
</div>
