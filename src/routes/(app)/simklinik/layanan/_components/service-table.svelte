<script lang="ts">
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { Edit, Trash2 } from 'lucide-svelte';

	type ServiceItem = {
		id: string;
		categoryId: string | null;
		code: string;
		name: string;
		description: string | null;
		price: string | null;
		duration: number | null;
		isActive: boolean;
		createdAt: Date;
		updatedAt: Date;
		category: {
			id: string;
			name: string;
			description: string | null;
			parentId: string | null;
			isActive: boolean;
			createdAt: Date;
			updatedAt: Date;
		} | null;
	};

	export let data: ServiceItem[] = [];

	const formatPrice = (value: string | null) => {
		if (!value || value === '0') {
			return '-';
		}

		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR'
		}).format(Number(value));
	};

	const formatDuration = (value: number | null) => {
		if (!value) {
			return '-';
		}

		return `${value} menit`;
	};

	function confirmDelete(event: Event, serviceName: string) {
		const confirmed = confirm(
			`Hapus layanan ${serviceName}? Tindakan ini tidak dapat dibatalkan.`
		);

		if (!confirmed) {
			event.preventDefault();
			event.stopPropagation();
		}
	}
</script>

<div class="w-full overflow-x-auto">
	<table class="w-full min-w-[960px]">
		<thead>
			<tr class="border-b border-slate-200 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
				<th class="px-4 py-3">Kode</th>
				<th class="px-4 py-3">Nama Layanan</th>
				<th class="px-4 py-3">Kategori</th>
				<th class="px-4 py-3">Harga</th>
				<th class="px-4 py-3">Durasi</th>
				<th class="px-4 py-3">Status</th>
				<th class="px-4 py-3 text-right">Aksi</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-slate-100">
			{#each data as service (service.id)}
				{@const statusBadge = service.isActive
					? { variant: 'success' as const, label: 'Aktif' }
					: { variant: 'muted' as const, label: 'Non-aktif' }}
				<tr class="hover:bg-slate-50">
					<td class="px-4 py-4 align-middle font-mono text-sm">{service.code}</td>
					<td class="px-4 py-4 align-middle">
						<div class="font-medium">{service.name}</div>
						{#if service.description}
							<p class="text-sm text-muted-foreground truncate max-w-xs">{service.description}</p>
						{/if}
					</td>
					<td class="px-4 py-4 align-middle text-sm">
						{service.category?.name ?? '-'}
					</td>
					<td class="px-4 py-4 align-middle text-sm">
						{formatPrice(service.price)}
					</td>
					<td class="px-4 py-4 align-middle text-sm">
						{formatDuration(service.duration)}
					</td>
					<td class="px-4 py-4 align-middle">
						<Badge variant={statusBadge.variant}>
							{statusBadge.label}
						</Badge>
					</td>
					<td class="px-4 py-4 align-middle text-right">
						<div class="flex items-center justify-end gap-2">
							<Button
								variant="outline"
								size="sm"
								href={`/simklinik/layanan/edit/${service.id}`}
							>
								<Edit class="h-3 w-3" />
							</Button>
							<form method="POST" action="?/delete" class="inline-flex">
								<input type="hidden" name="serviceId" value={service.id} />
								<Button
									variant="outline"
									size="sm"
									class="text-red-600 hover:bg-red-50"
									type="submit"
									on:click={(event) => confirmDelete(event, service.name)}
								>
									<Trash2 class="h-3 w-3" />
								</Button>
							</form>
						</div>
					</td>
				</tr>
			{/each}
			{#if data.length === 0}
				<tr>
					<td colspan="7" class="px-4 py-8 text-center text-muted-foreground">
						Belum ada layanan terdaftar
					</td>
				</tr>
			{/if}
		</tbody>
	</table>
</div>
