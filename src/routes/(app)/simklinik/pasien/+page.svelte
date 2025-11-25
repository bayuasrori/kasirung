<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import CardDescription from '$lib/components/ui/card-description.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import Toast from '$lib/components/ui/toast.svelte';
	import type { PageData } from './$types';
	
	import PatientTable from './_components/patient-table.svelte';
	import { Plus } from 'lucide-svelte';

	export let data: PageData;

	let showToast = false;
	let toastMessage = '';
	let toastType: 'success' | 'error' = 'success';

	$: if ($page.url.searchParams.get('success') === 'true') {
		toastMessage = decodeURIComponent($page.url.searchParams.get('message') || 'Pasien berhasil ditambahkan');
		toastType = 'success';
		showToast = true;
		
		// Clean URL
		const url = new URL(window.location.href);
		url.searchParams.delete('success');
		url.searchParams.delete('message');
		window.history.replaceState({}, '', url);
	}

</script>

<div class="flex-1 space-y-4 p-8">
	<div class="flex items-center justify-between space-y-2">
		<div>
			<h2 class="text-3xl font-bold tracking-tight">Daftar Pasien</h2>
			<p class="text-muted-foreground">Kelola data pasien klinik</p>
		</div>
		<div class="flex items-center space-x-2">
			<Button href="/simklinik/pasien/pendaftaran">
				<Plus class="mr-2 h-4 w-4" />
				Tambah Pasien
			</Button>
		</div>
	</div>

	<Card>
		<CardHeader>
			<CardTitle>Data Pasien</CardTitle>
			<CardDescription>Total {data.total} pasien terdaftar</CardDescription>
		</CardHeader>
		<CardContent>
			<PatientTable data={data.patients} />
		</CardContent>
	</Card>
</div>

<!-- Toast Notification -->
<Toast 
	bind:show={showToast} 
	message={toastMessage} 
	type={toastType}
	on:dismiss={() => showToast = false}
/>
