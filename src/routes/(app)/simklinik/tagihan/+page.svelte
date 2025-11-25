<script lang="ts">
	import type { PageData } from './$types';

	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import CardDescription from '$lib/components/ui/card-description.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import InvoiceTable from './_components/invoice-table.svelte';
	import { AlertTriangle, DollarSign, Plus } from 'lucide-svelte';

	export let data: PageData;

</script>

<div class="flex-1 space-y-4 p-8">
	<div class="flex items-center justify-between space-y-2">
		<div>
			<h2 class="text-3xl font-bold tracking-tight">Tagihan Medis</h2>
			<p class="text-muted-foreground">Kelola tagihan dan pembayaran pasien</p>
		</div>
		<div class="flex items-center space-x-2">
			<Button href="/simklinik/tagihan/buat">
				<Plus class="mr-2 h-4 w-4" />
				Buat Tagihan
			</Button>
		</div>
	</div>

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Total Tagihan</CardTitle>
				<DollarSign class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.summary.totalInvoices}</div>
				<p class="text-xs text-muted-foreground">Semua tagihan</p>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Sudah Dibayar</CardTitle>
				<DollarSign class="h-4 w-4 text-green-600" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-green-600">{data.summary.paidInvoices}</div>
				<p class="text-xs text-muted-foreground">{data.summary.paymentRate.toFixed(1)}% tingkat pembayaran</p>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Belum Dibayar</CardTitle>
				<AlertTriangle class="h-4 w-4 text-yellow-600" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-yellow-600">{data.summary.unpaidInvoices}</div>
				<p class="text-xs text-muted-foreground">Menunggu pembayaran</p>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Terlambat Bayar</CardTitle>
				<AlertTriangle class="h-4 w-4 text-red-600" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-red-600">{data.summary.overdueInvoices}</div>
				<p class="text-xs text-muted-foreground">Lewat tanggal jatuh tempo</p>
			</CardContent>
		</Card>
	</div>

	<!-- Revenue Summary -->
	<Card>
		<CardHeader>
			<CardTitle>Ringkasan Pendapatan</CardTitle>
			<CardDescription>Total pendapatan dari tagihan medis</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="grid gap-4 md:grid-cols-3">
				<div class="space-y-2">
					<span class="text-sm font-medium text-muted-foreground">Total Tagihan</span>
					<div class="text-2xl font-bold">
						{new Intl.NumberFormat('id-ID', {
							style: 'currency',
							currency: 'IDR'
						}).format(data.revenue.total)}
					</div>
				</div>
				<div class="space-y-2">
					<span class="text-sm font-medium text-muted-foreground">Sudah Diterima</span>
					<div class="text-2xl font-bold text-green-600">
						{new Intl.NumberFormat('id-ID', {
							style: 'currency',
							currency: 'IDR'
						}).format(data.revenue.paid)}
					</div>
				</div>
				<div class="space-y-2">
					<span class="text-sm font-medium text-muted-foreground">Menunggu Pembayaran</span>
					<div class="text-2xl font-bold text-yellow-600">
						{new Intl.NumberFormat('id-ID', {
							style: 'currency',
							currency: 'IDR'
						}).format(data.revenue.pending)}
					</div>
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- Invoices List -->
	<Card>
		<CardHeader>
			<CardTitle>Daftar Tagihan</CardTitle>
			<CardDescription>
				{data.summary.totalInvoices} tagihan, {data.summary.paidInvoices} sudah dibayar, 
				{data.summary.unpaidInvoices} menunggu pembayaran
			</CardDescription>
		</CardHeader>
		<CardContent>
			<InvoiceTable data={data.invoices} />
		</CardContent>
	</Card>
</div>
