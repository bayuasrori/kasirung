<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import CardDescription from '$lib/components/ui/card-description.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import { Activity, BarChart3, DollarSign, FileText, Pill, Users } from 'lucide-svelte';
	import DashboardSummary from './_components/dashboard-summary.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="flex-1 space-y-4 p-8">
	<div class="flex items-center justify-between space-y-2">
		<div>
			<h2 class="text-3xl font-bold tracking-tight">Laporan Simklinik</h2>
			<p class="text-muted-foreground">Analisis dan laporan klinik komprehensif</p>
		</div>
		<div class="flex items-center space-x-2">
			<Button variant="outline" href="/simklinik/laporan/kunjungan">
				<Users class="mr-2 h-4 w-4" />
				Laporan Kunjungan
			</Button>
			<Button variant="outline" href="/simklinik/laporan/keuangan">
				<DollarSign class="mr-2 h-4 w-4" />
				Laporan Keuangan
			</Button>
			<Button variant="outline" href="/simklinik/laporan/inventory">
				<Pill class="mr-2 h-4 w-4" />
				Laporan Inventory
			</Button>
		</div>
	</div>

	<!-- Date Range Filter -->
	<Card>
		<CardHeader>
			<CardTitle>Filter Laporan</CardTitle>
			<CardDescription>Pilih rentang waktu untuk laporan</CardDescription>
		</CardHeader>
		<CardContent>
			<form class="flex items-center space-x-4">
				<div class="flex items-center space-x-2">
					<label for="date-from" class="text-sm font-medium">Dari:</label>
					<input
						id="date-from"
						type="date"
						value={data.defaultDateRange.from}
						class="px-3 py-2 border rounded-md"
					/>
				</div>
				<div class="flex items-center space-x-2">
					<label for="date-to" class="text-sm font-medium">Sampai:</label>
					<input
						id="date-to"
						type="date"
						value={data.defaultDateRange.to}
						class="px-3 py-2 border rounded-md"
					/>
				</div>
				<Button type="submit">Terapkan Filter</Button>
				<Button variant="outline" type="button">
					Export Data
				</Button>
			</form>
		</CardContent>
	</Card>

	<!-- Key Metrics -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Total Kunjungan</CardTitle>
				<Users class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.summary.clinical.totalVisits}</div>
				<p class="text-xs text-muted-foreground">
					{#if data.summary.clinical.visitsGrowth > 0}
						<span class="text-green-600">↑ {data.summary.clinical.visitsGrowth.toFixed(1)}%</span>
					{:else}
						<span class="text-red-600">↓ {Math.abs(data.summary.clinical.visitsGrowth).toFixed(1)}%</span>
					{/if}
					dari periode sebelumnya
				</p>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Total Pasien</CardTitle>
				<FileText class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.summary.clinical.totalPatients}</div>
				<p class="text-xs text-muted-foreground">Pasien unik</p>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Total Pendapatan</CardTitle>
				<DollarSign class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">
					{new Intl.NumberFormat('id-ID', {
						style: 'currency',
						currency: 'IDR'
					}).format(data.summary.financial.totalRevenue)}
				</div>
				<p class="text-xs text-muted-foreground">
					{#if data.summary.financial.revenueGrowth > 0}
						<span class="text-green-600">↑ {data.summary.financial.revenueGrowth.toFixed(1)}%</span>
					{:else}
						<span class="text-red-600">↓ {Math.abs(data.summary.financial.revenueGrowth).toFixed(1)}%</span>
					{/if}
					pertumbuhan pendapatan
				</p>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Tingkat Bayar</CardTitle>
				<Activity class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.summary.financial.paymentRate.toFixed(1)}%</div>
				<p class="text-xs text-muted-foreground">Rata-rata tingkat pembayaran</p>
			</CardContent>
		</Card>
	</div>

	<!-- Dashboard Summary Component -->
	<DashboardSummary 
		staff={data.summary.staff}
		services={data.summary.services}
		inventory={data.summary.inventory}
	/>

	<!-- Quick Reports Links -->
	<Card>
		<CardHeader>
			<CardTitle>Laporan Detail</CardTitle>
			<CardDescription>Lengkapkan laporan dan analisis mendalam</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<Button variant="outline" href="/simklinik/laporan/kunjungan" class="h-auto p-4 flex-col">
					<Users class="h-8 w-8 mb-2" />
					<span class="font-medium">Laporan Kunjungan</span>
					<span class="text-xs text-muted-foreground text-center">
						Analisis kunjungan pasien dan tendensi
					</span>
				</Button>
				<Button variant="outline" href="/simklinik/laporan/keuangan" class="h-auto p-4 flex-col">
					<DollarSign class="h-8 w-8 mb-2" />
					<span class="font-medium">Laporan Keuangan</span>
					<span class="text-xs text-muted-foreground text-center">
						Analisis pendapatan dan pembayaran
					</span>
				</Button>
				<Button variant="outline" href="/simklinik/laporan/inventory" class="h-auto p-4 flex-col">
					<Pill class="h-8 w-8 mb-2" />
					<span class="font-medium">Laporan Inventory</span>
					<span class="text-xs text-muted-foreground text-center">
						Konsumsi dan stok obat/alat
					</span>
				</Button>
				<Button variant="outline" href="/simklinik/laporan/tenaga-medis" class="h-auto p-4 flex-col">
					<Activity class="h-8 w-8 mb-2" />
					<span class="font-medium">Performa Tenaga Medis</span>
					<span class="text-xs text-muted-foreground text-center">
						Productivitas dan metrik kinerja
					</span>
				</Button>
				<Button variant="outline" href="/simklinik/laporan/diagnosis" class="h-auto p-4 flex-col">
					<FileText class="h-8 w-8 mb-2" />
					<span class="font-medium">Statistik Diagnosis</span>
					<span class="text-xs text-muted-foreground text-center">
						Pattern penyakit dan kondisi umum
					</span>
				</Button>
				<Button variant="outline" href="/simklinik/laporan/resep" class="h-auto p-4 flex-col">
					<Pill class="h-8 w-8 mb-2" />
					<span class="font-medium">Analisis Resep</span>
					<span class="text-xs text-muted-foreground text-center">
						Obat yang sering diresepkan
					</span>
				</Button>
			</div>
		</CardContent>
	</Card>
</div>
