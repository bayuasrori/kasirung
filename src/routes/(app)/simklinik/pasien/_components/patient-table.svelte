<script lang="ts">
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { Edit, Eye, Trash2 } from 'lucide-svelte';

	type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'muted';

	const getStatusVariant = (status: string): BadgeVariant => {
		if (status === 'aktif') {
			return 'success';
		}

		if (status === 'tidak_aktif') {
			return 'muted';
		}

		return 'warning';
	};

	const getStatusLabel = (status: string) => {
		if (status === 'aktif') {
			return 'Aktif';
		}

		if (status === 'tidak_aktif') {
			return 'Tidak Aktif';
		}

		return 'Alih';
	};

	export let data: any[];
</script>

<div class="w-full">
	<div class="rounded-md border">
		<div class="relative w-full overflow-auto">
			<table class="w-full caption-bottom text-sm">
				<thead class="[&_tr]:border-b">
					<tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">No. RM</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nama Lengkap</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tgl Lahir</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Alamat</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Gol. Darah</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Aksi</th>
					</tr>
				</thead>
				<tbody class="[&_tr:last-child]:border-0">
					{#each data as patient (patient.id)}
						<tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
							<td class="p-4 align-middle">{patient.mrNumber}</td>
							<td class="p-4 align-middle">
								<div class="font-medium">
									<p>{patient.name}</p>
									<p class="text-sm text-muted-foreground">{patient.gender === 'male' ? 'L' : patient.gender === 'female' ? 'P' : 'Lainnya'}, {patient.phone || '-'}</p>
								</div>
							</td>
							<td class="p-4 align-middle">
								<div>
									<p>{new Date(patient.dateOfBirth).toLocaleDateString('id-ID')}</p>
									<p class="text-sm text-muted-foreground">{new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} tahun</p>
								</div>
							</td>
							<td class="p-4 align-middle">{patient.address || '-'}</td>
							<td class="p-4 align-middle">{patient.bloodType || '-'}</td>
							<td class="p-4 align-middle">
								<Badge variant={getStatusVariant(patient.status)}>
									{getStatusLabel(patient.status)}
								</Badge>
							</td>
							<td class="p-4 align-middle">
								<div class="flex items-center space-x-2">
									<Button variant="ghost" size="sm" href={`/simklinik/pasien/${patient.id}`}>
										<Eye class="h-4 w-4" />
									</Button>
									<Button variant="ghost" size="sm" href={`/simklinik/pasien/${patient.id}/edit`}>
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
