<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import CardDescription from '$lib/components/ui/card-description.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import Toast from '$lib/components/ui/toast.svelte';
	
	import { Plus } from 'lucide-svelte';

	import StaffTable from './_components/staff-table.svelte';

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
</script>

<svelte:head>
	<title>Manajemen Tenaga Medis - Kasirung SIMKlinik</title>
</svelte:head>

<div class="flex-1 space-y-4 p-8">
	<div class="flex items-center justify-between space-y-2">
		<div>
			<h2 class="text-3xl font-bold tracking-tight">Manajemen Tenaga Medis</h2>
			<p class="text-muted-foreground">Kelola data tenaga medis klinik</p>
		</div>
		<div class="flex items-center space-x-2">
			<Button href="/simklinik/tenaga-medis/tambah">
				<Plus class="mr-2 h-4 w-4" />
				Tambah Tenaga Medis
			</Button>
		</div>
	</div>

	<Card>
		<CardHeader>
			<CardTitle>Data Tenaga Medis</CardTitle>
			<CardDescription>Total {data.total} tenaga medis terdaftar</CardDescription>
		</CardHeader>
		<CardContent>
			<StaffTable data={data.staff} />
		</CardContent>
	</Card>

	<!-- Toast Notification -->
<Toast 
	bind:show={showToast} 
	message={toastMessage} 
	type={toastType}
	on:dismiss={() => showToast = false}
/>
</div>
