<script lang="ts">
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { Calendar, Edit, Eye } from 'lucide-svelte';

	export let data: any[];

	function getRoleLabel(role: string) {
		switch (role) {
			case 'doctor': return 'Dokter';
			case 'nurse': return 'Perawat';
			case 'midwife': return 'Bidan';
			case 'specialist': return 'Spesialis';
			case 'pharmacist': return 'Apoteker';
			case 'lab_technician': return 'Lab Teknisi';
			case 'receptionist': return 'Resepsionis';
			default: return role;
		}
	}
</script>

<div class="w-full">
	<div class="rounded-md border">
		<div class="relative w-full overflow-auto">
			<table class="w-full caption-bottom text-sm">
				<thead class="[&_tr]:border-b">
					<tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">NIP</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nama</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Jabatan</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Spesialisasi</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Kontak</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Aksi</th>
					</tr>
				</thead>
				<tbody class="[&_tr:last-child]:border-0">
					{#each data as staff (staff.id)}
						<tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
							<td class="p-4 align-middle">{staff.nip}</td>
							<td class="p-4 align-middle">
								<div class="font-medium">
									<p>{staff.name}</p>
									{#if staff.experience}
										<p class="text-sm text-muted-foreground">{staff.experience} tahun pengalaman</p>
									{/if}
								</div>
							</td>
							<td class="p-4 align-middle">
								<Badge>
									{getRoleLabel(staff.role)}
								</Badge>
							</td>
							<td class="p-4 align-middle">{staff.specialization || '-'}</td>
							<td class="p-4 align-middle">
								<div>
									<p>{staff.phone || '-'}</p>
									<p class="text-sm text-muted-foreground">{staff.email || '-'}</p>
								</div>
							</td>
							<td class="p-4 align-middle">
								<Badge variant={staff.isActive ? 'default' : 'muted'}>
									{staff.isActive ? 'Aktif' : 'Tidak Aktif'}
								</Badge>
							</td>
							<td class="p-4 align-middle">
								<div class="flex items-center space-x-2">
									<Button variant="ghost" size="sm" href={`/simklinik/tenaga-medis/${staff.id}`}>
										<Eye class="h-4 w-4" />
									</Button>
									<Button variant="ghost" size="sm" href={`/simklinik/tenaga-medis/${staff.id}/jadwal`}>
										<Calendar class="h-4 w-4" />
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
