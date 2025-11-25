<script lang="ts">
	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import CardDescription from '$lib/components/ui/card-description.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
import { AlertTriangle, DollarSign, TrendingUp, Users } from 'lucide-svelte';

type StaffSummary = {
	staffId: string | null;
	staffName: string | null;
	staffRole: string | null;
	totalConsultations: unknown;
	revenue: unknown;
	avgConsulutationTime?: unknown;
	prescriptionsGiven?: unknown;
};

type ServiceSummary = {
	serviceId?: string | null;
	serviceName: string | null;
	usageCount: unknown;
	totalRevenue: unknown;
	completionRate?: unknown;
};

type InventorySummary = {
	totalAlerts: number;
	lowStockCount: number;
	expiringCount: number;
	expiredCount: number;
};

export let staff: StaffSummary[] = [];
export let services: ServiceSummary[] = [];
export let inventory: InventorySummary;

	function formatPrice(amount: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR'
		}).format(amount);
	}
</script>

<!-- Staff Performance Summary -->
<Card>
	<CardHeader>
		<CardTitle class="flex items-center space-x-2">
			<Users class="h-5 w-5" />
			<span>Performa Tenaga Medis</span>
		</CardTitle>
		<CardDescription>Top 5 tenaga medis berdasarkan jumlah konsultasi</CardDescription>
	</CardHeader>
	<CardContent>
		<div class="space-y-4">
			{#each staff as staffMember (staffMember.staffId ?? staffMember.staffName)}
				<div class="flex items-center justify-between">
					<div class="space-y-1">
						<p class="font-medium">{staffMember.staffName ?? 'Tenaga Medis'}</p>
						<p class="text-sm text-muted-foreground">{staffMember.staffRole ?? '-'}</p>
					</div>
					<div class="text-right">
						<div class="font-semibold">{Number(staffMember.totalConsultations ?? 0)} konsultasi</div>
						<div class="text-sm text-muted-foreground">
							{formatPrice(Number(staffMember.revenue ?? 0))}
						</div>
					</div>
				</div>
			{/each}
			{#if staff.length === 0}
				<p class="text-muted-foreground text-center py-4">Belum ada data konsultasi</p>
			{/if}
		</div>
	</CardContent>
</Card>

<div class="grid gap-4 md:grid-cols-2">
	<!-- Top Services -->
	<Card>
		<CardHeader>
			<CardTitle class="flex items-center space-x-2">
				<DollarSign class="h-5 w-5" />
				<span>Layanan Terpopuler</span>
			</CardTitle>
			<CardDescription>Layanan medis dengan pendapatan tertinggi</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="space-y-4">
				{#each services as service (service.serviceId ?? service.serviceName)}
					<div class="flex items-center justify-between">
						<div class="space-y-1">
							<p class="font-medium">{service.serviceName ?? 'Layanan'}</p>
							<p class="text-sm text-muted-foreground">{Number(service.usageCount ?? 0)} kunjungan</p>
						</div>
						<div class="text-right">
							<div class="font-semibold">{formatPrice(Number(service.totalRevenue ?? 0))}</div>
							{#if typeof service.completionRate === 'number'}
								<Badge variant={service.completionRate > 80 ? 'success' : 'warning'}>
									{service.completionRate.toFixed(0)}% selesai
								</Badge>
							{/if}
						</div>
					</div>
				{/each}
				{#if services.length === 0}
					<p class="text-muted-foreground text-center py-4">Belum ada data layanan</p>
				{/if}
			</div>
		</CardContent>
	</Card>

	<!-- Inventory Alerts -->
	<Card>
		<CardHeader>
			<CardTitle class="flex items-center space-x-2">
				<AlertTriangle class="h-5 w-5" />
				<span>Status Inventory</span>
			</CardTitle>
			<CardDescription>Peringatan dan status stok</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<span>Total Peringatan</span>
					<span class="font-semibold">{inventory.totalAlerts}</span>
				</div>
				<div class="flex items-center justify-between">
					<span>Stok Rendah</span>
					<Badge variant="destructive">
						{inventory.lowStockCount} item
					</Badge>
				</div>
				<div class="flex items-center justify-between">
					<span>Akan Kadaluarsa</span>
					<Badge variant="destructive">
						{inventory.expiringCount} item
					</Badge>
				</div>
				<div class="flex items-center justify-between">
					<span>Kadaluarsa</span>
					<Badge variant="destructive">
						{inventory.expiredCount} item
					</Badge>
				</div>
				
				{#if inventory.totalAlerts > 0}
					<div class="pt-4 border-t">
						<p class="text-sm font-medium text-center mb-2">Tindakan Diperlukan</p>
						<p class="text-sm text-muted-foreground text-center">
							{inventory.totalAlerts} item perlu perhatian khusus
						</p>
					</div>
				{:else}
					<div class="pt-4 border-t">
						<p class="text-sm text-green-600 text-center">
							✓ Semua stok dalam kondisi baik
						</p>
					</div>
				{/if}
			</div>
		</CardContent>
	</Card>
</div>
