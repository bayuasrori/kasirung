<script lang="ts">
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { Edit, Eye, MinusCircle, PlusCircle } from 'lucide-svelte';

	type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'muted';

	export let data: any[];

	function getTypeLabel(type: string) {
		switch (type) {
			case 'medicine': return 'Obat';
			case 'consumable': return 'Alat Tulis';
			case 'equipment': return 'Peralatan';
			default: return type;
		}
	}

	function getTypeColor(type: string) {
		switch (type) {
			case 'medicine': return 'text-blue-600';
			case 'consumable': return 'text-green-600';
			case 'equipment': return 'text-purple-600';
			default: return 'text-gray-600';
		}
	}

	function getStockStatus(stock: number, minStock: number) {
		if (stock === 0) return { label: 'Habis', variant: 'destructive' as BadgeVariant };
		if (stock <= minStock) return { label: 'Rendah', variant: 'destructive' as BadgeVariant };
		return { label: 'Normal', variant: 'success' as BadgeVariant };
	}

	function getExpiryStatus(expiryDate: string) {
		if (!expiryDate) return null;
		
		const today = new Date();
		const expiry = new Date(expiryDate);
		const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
		
		if (daysUntilExpiry < 0) {
			return { label: 'Kadaluarsa', variant: 'destructive' as BadgeVariant, textClass: 'text-red-600' };
		}
		if (daysUntilExpiry <= 30) {
			return { label: 'Segera', variant: 'warning' as BadgeVariant, textClass: 'text-amber-600' };
		}
		return null;
	}

	function formatPrice(price: string) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR'
		}).format(parseFloat(price));
	}
</script>

<div class="w-full">
	<div class="rounded-md border">
		<div class="relative w-full overflow-auto">
			<table class="w-full caption-bottom text-sm">
				<thead class="[&_tr]:border-b">
					<tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Kode</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nama Item</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tipe</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Stok</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Harga</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Kadaluarsa</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Aksi</th>
					</tr>
				</thead>
				<tbody class="[&_tr:last-child]:border-0">
					{#each data as item (item.id)}
						{@const stockStatus = getStockStatus(item.stock, item.minStock)}
						<tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
							<td class="p-4 align-middle font-mono">{item.code}</td>
							<td class="p-4 align-middle">
								<div class="font-medium">
									<p>{item.name}</p>
									{#if item.description}
										<p class="text-sm text-muted-foreground">{item.description}</p>
									{/if}
								</div>
							</td>
							<td class="p-4 align-middle">
								<Badge variant="muted" class={getTypeColor(item.type)}>
									{getTypeLabel(item.type)}
								</Badge>
							</td>
							<td class="p-4 align-middle">
								<div class="flex items-center space-x-2">
									<span class="font-medium">{item.stock} {item.unit}</span>
									{#if item.stock <= item.minStock}
										<Badge variant="destructive">Rendah</Badge>
									{/if}
								</div>
							</td>
							<td class="p-4 align-middle">
								<div class="font-semibold text-green-600">
									{formatPrice(item.price)}
								</div>
							</td>
							<td class="p-4 align-middle">
								{#if item.expiryDate}
									{@const expiryStatus = getExpiryStatus(item.expiryDate)}
									<div>
										<span class={expiryStatus?.textClass}>
											{new Date(item.expiryDate).toLocaleDateString('id-ID')}
										</span>
										{#if expiryStatus}
											<Badge variant={expiryStatus.variant}>
												{expiryStatus.label}
											</Badge>
										{/if}
									</div>
								{:else}
									-
								{/if}
							</td>
								<td class="p-4 align-middle">
									<Badge variant={stockStatus.variant}>
										{stockStatus.label}
									</Badge>
							</td>
							<td class="p-4 align-middle">
								<div class="flex items-center space-x-2">
									<Button variant="ghost" size="sm" href={`/simklinik/inventory/${item.id}`}>
										<Eye class="h-4 w-4" />
									</Button>
									<Button variant="ghost" size="sm" href={`/simklinik/inventory/${item.id}/edit`}>
										<Edit class="h-4 w-4" />
									</Button>
									<Button variant="ghost" size="sm" href={`/simklinik/inventory/${item.id}/add`}>
										<PlusCircle class="h-4 w-4" />
									</Button>
									<Button variant="ghost" size="sm" href={`/simklinik/inventory/${item.id}/use`}>
										<MinusCircle class="h-4 w-4" />
									</Button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
