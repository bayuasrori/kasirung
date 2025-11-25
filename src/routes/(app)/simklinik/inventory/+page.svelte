<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
import Card from '$lib/components/ui/card.svelte';
import CardHeader from '$lib/components/ui/card-header.svelte';
import CardTitle from '$lib/components/ui/card-title.svelte';
import CardDescription from '$lib/components/ui/card-description.svelte';
import CardContent from '$lib/components/ui/card-content.svelte';
import InventoryTable from './_components/inventory-table.svelte';
import { AlertTriangle, Package, Plus } from 'lucide-svelte';
import type { PageData } from './$types';

	export let data: PageData;

</script>

<div class="flex-1 space-y-4 p-8">
	<div class="flex items-center justify-between space-y-2">
		<div>
			<h2 class="text-3xl font-bold tracking-tight">Inventory Medis</h2>
			<p class="text-muted-foreground">Kelola persediaan obat dan alat medis</p>
		</div>
		<div class="flex items-center space-x-2">
			<Button href="/simklinik/inventory/tambah">
				<Plus class="mr-2 h-4 w-4" />
				Tambah Item
			</Button>
			<Button variant="outline" href="/simklinik/inventory/pergerakan">
				<Package class="mr-2 h-4 w-4" />
				Pergerakan Stok
			</Button>
		</div>
	</div>

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Total Items</CardTitle>
				<Package class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.summary.totalItems}</div>
				<p class="text-xs text-muted-foreground">Jenis item tersedia</p>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Stok Rendah</CardTitle>
				<AlertTriangle class="h-4 w-4 text-yellow-600" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-yellow-600">{data.summary.lowStockCount}</div>
				<p class="text-xs text-muted-foreground">Item perlu restock</p>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Akan Kadaluarsa</CardTitle>
				<AlertTriangle class="h-4 w-4 text-orange-600" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-orange-600">{data.summary.expiringCount}</div>
				<p class="text-xs text-muted-foreground">30 hari ke depan</p>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Kadaluarsa</CardTitle>
				<AlertTriangle class="h-4 w-4 text-red-600" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-red-600">{data.summary.expiredCount}</div>
				<p class="text-xs text-muted-foreground">Item kadaluarsa</p>
			</CardContent>
		</Card>
	</div>

	<!-- Stock Alerts -->
	{#if data.alerts.lowStock.length > 0 || data.alerts.expiring.length > 0 || data.alerts.expired.length > 0}
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center space-x-2">
					<AlertTriangle class="h-5 w-5" />
					<span>Peringatan Stok</span>
				</CardTitle>
				<CardDescription>Item yang memerlukan perhatian khusus</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="grid gap-4 md:grid-cols-3">
					<!-- Low Stock -->
					{#if data.alerts.lowStock.length > 0}
						<div class="space-y-2">
							<h4 class="text-sm font-medium text-yellow-700">Stok Rendah</h4>
							<div class="space-y-1">
								{#each data.alerts.lowStock.slice(0, 5) as item (item.id)}
									<div class="flex items-center justify-between text-sm">
										<span>{item.name}</span>
										<span class="text-yellow-600">{item.stock} / {item.minStock}</span>
									</div>
								{/each}
								{#if data.alerts.lowStock.length > 5}
									<p class="text-xs text-muted-foreground">+{data.alerts.lowStock.length - 5} item lagi</p>
								{/if}
							</div>
						</div>
					{/if}

					<!-- Expiring Soon -->
					{#if data.alerts.expiring.length > 0}
						<div class="space-y-2">
							<h4 class="text-sm font-medium text-orange-700">Akan Kadaluarsa</h4>
							<div class="space-y-1">
								{#each data.alerts.expiring.slice(0, 5) as item (item.id)}
									<div class="flex items-center justify-between text-sm">
										<span>{item.name}</span>
										<span class="text-orange-600">
											{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('id-ID') : '-'}
										</span>
									</div>
								{/each}
								{#if data.alerts.expiring.length > 5}
									<p class="text-xs text-muted-foreground">+{data.alerts.expiring.length - 5} item lagi</p>
								{/if}
							</div>
						</div>
					{/if}

					<!-- Expired -->
					{#if data.alerts.expired.length > 0}
						<div class="space-y-2">
							<h4 class="text-sm font-medium text-red-700">Kadaluarsa</h4>
							<div class="space-y-1">
								{#each data.alerts.expired.slice(0, 5) as item (item.id)}
									<div class="flex items-center justify-between text-sm">
										<span>{item.name}</span>
										<span class="text-red-600">
											{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('id-ID') : '-'}
										</span>
									</div>
								{/each}
								{#if data.alerts.expired.length > 5}
									<p class="text-xs text-muted-foreground">+{data.alerts.expired.length - 5} item lagi</p>
								{/if}
							</div>
						</div>
					{/if}
				</div>
			</CardContent>
		</Card>
	{/if}

	<!-- Inventory List -->
	<Card>
		<CardHeader>
			<CardTitle>Daftar Inventory</CardTitle>
			<CardDescription>
				{data.summary.totalItems} item, {data.summary.lowStockCount} stok rendah, 
				{data.summary.expiringCount} akan kadaluarsa
			</CardDescription>
		</CardHeader>
		<CardContent>
			<InventoryTable data={data.items} />
		</CardContent>
	</Card>
</div>
