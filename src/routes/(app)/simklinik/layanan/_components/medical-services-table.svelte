<script lang="ts">
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { Clock, Edit, Eye } from 'lucide-svelte';
	import type { MedicalServiceCategory } from '$lib/db/schema';

	export let data: any[];
	export let categories: MedicalServiceCategory[];

	function getCategoryName(categoryId: string) {
		const category = categories.find(c => c.id === categoryId);
		return category?.name || 'Tanpa Kategori';
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
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nama Layanan</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Kategori</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Durasi</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Harga</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Aksi</th>
					</tr>
				</thead>
				<tbody class="[&_tr:last-child]:border-0">
					{#each data as service (service.id)}
						<tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
							<td class="p-4 align-middle font-mono">{service.code}</td>
							<td class="p-4 align-middle">
								<div class="font-medium">
									<p>{service.name}</p>
									{#if service.description}
										<p class="text-sm text-muted-foreground">{service.description}</p>
									{/if}
								</div>
							</td>
							<td class="p-4 align-middle">
								<Badge variant="muted">
									{getCategoryName(service.categoryId)}
								</Badge>
							</td>
							<td class="p-4 align-middle">
								<div class="flex items-center">
									<Clock class="mr-2 h-4 w-4" />
									{service.duration ? `${service.duration} menit` : '-'}
								</div>
							</td>
							<td class="p-4 align-middle">
								<div class="font-semibold text-green-600">
									{formatPrice(service.price)}
								</div>
							</td>
							<td class="p-4 align-middle">
								<Badge variant={service.isActive ? 'success' : 'muted'}>
									{service.isActive ? 'Aktif' : 'Tidak Aktif'}
								</Badge>
							</td>
							<td class="p-4 align-middle">
								<div class="flex items-center space-x-2">
									<Button variant="ghost" size="sm" href={`/simklinik/layanan/${service.id}`}>
										<Eye class="h-4 w-4" />
									</Button>
									<Button variant="ghost" size="sm" href={`/simklinik/layanan/${service.id}/edit`}>
										<Edit class="h-4 w-4" />
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
