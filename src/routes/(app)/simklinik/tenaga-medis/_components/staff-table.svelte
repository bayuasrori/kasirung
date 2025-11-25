<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import { Edit, Trash2, Phone, Mail } from 'lucide-svelte';

interface StaffMember {
	id: string;
	nip: string;
	name: string;
		specialization?: string | null;
		phone?: string | null;
		email?: string | null;
		role: string;
	isActive: boolean;
	createdAt: string | Date;
	updatedAt: string | Date;
}

	export let data: StaffMember[] = [];

	function getStatusBadge(isActive: boolean) {
		return isActive
			? { variant: 'default' as const, text: 'Aktif' }
			: { variant: 'destructive' as const, text: 'Non-aktif' };
	}

	function formatDate(dateInput: string | Date) {
		if (!dateInput) {
			return '-';
		}

		const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

		return date.toLocaleDateString('id-ID', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function getInitial(name: string) {
		if (!name) return '-';
		return name.split(' ')[0]?.[0]?.toUpperCase() ?? name[0]?.toUpperCase() ?? '-';
	}

	function getRoleLabel(role: string) {
		switch (role) {
			case 'doctor':
				return 'Dokter';
			case 'nurse':
				return 'Perawat';
			case 'midwife':
				return 'Bidan';
			case 'specialist':
				return 'Spesialis';
			case 'pharmacist':
				return 'Apoteker';
			case 'lab_technician':
				return 'Teknisi Laboratorium';
			case 'receptionist':
				return 'Penerima';
			default:
				return role;
		}
	}

	function confirmDelete(event: Event, staffName: string) {
		const confirmed = confirm(
			`Apakah Anda yakin menghapus ${staffName}? Tindakan ini tidak dapat dibatalkan.`
		);

		if (!confirmed) {
			event.preventDefault();
			event.stopPropagation();
		}
	}
</script>

<div class="w-full overflow-x-auto">
	<table class="w-full min-w-[1024px]">
			<thead>
				<tr class="border-b border-slate-200">
					<th class="text-left p-4 font-medium text-sm text-slate-700">NIP</th>
					<th class="text-left p-4 font-medium text-sm text-slate-700">Nama</th>
					<th>Spesialisasi</th>
					<th class="text-left p-4 font-medium text-sm text-slate-700">Email</th>
					<th>Telepon</th>
					<th>Role</th>
					<th>Status</th>
					<th class="text-left p-4 font-medium text-sm text-slate-700">Dibuat</th>
					<th class="text-left p-4 font-medium text-sm text-slate-700">Update</th>
					<th class="text-left p-4 font-medium text-sm text-slate-700">Aksi</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-slate-200">
				{#each data as staff (staff.id)}
					{@const statusBadge = getStatusBadge(staff.isActive)}
					<tr class={staff.isActive ? 'hover:bg-slate-50' : 'hover:bg-red-50'}>
						<td class="p-4 text-sm font-medium">{staff.nip}</td>
						<td class="p-4 text-sm">
							<div class="flex items-center gap-2">
								<div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
									<span>{getInitial(staff.name)}</span>
								</div>
								<div>
									<p class="font-medium">{staff.name}</p>
									{#if staff.specialization}
										<p class="text-xs text-muted-foreground">{staff.specialization}</p>
									{/if}
								</div>
							</div>
						</td>
						<td class="p-4 text-sm">
							{staff.specialization || '-'}
						</td>
						<td class="p-4 text-sm">
							<div class="flex items-center">
								<Mail class="h-4 w-4 text-muted-foreground" />
								{staff.email || '-'}
							</div>
						</td>
						<td class="p-4 text-sm">
							<div class="flex items-center">
								<Phone class="h-4 w-4 text-muted-foreground" />
								{staff.phone || '-'}
							</div>
						</td>
						<td class="p-4 text-sm">
							{getRoleLabel(staff.role)}
						</td>
						<td class="p-4">
							<Badge variant={statusBadge.variant}>
								{statusBadge.text}
							</Badge>
						</td>
						<td class="p-4 text-sm text-muted-foreground">
							{formatDate(staff.createdAt)}
						</td>
						<td class="p-4 text-sm text-muted-foreground">
							{formatDate(staff.updatedAt)}
						</td>
						<td class="p-4 text-sm">
							<div class="flex items-center gap-2">
								<Button variant="outline" size="sm" href={`/simklinik/tenaga-medis/edit/${staff.id}`}>
									<Edit class="h-3 w-3" />
								</Button>
								<form method="POST" action="?/delete" class="inline-flex">
									<input type="hidden" name="staffId" value={staff.id} />
									<Button
										variant="outline"
										size="sm"
										class="text-red-600 hover:bg-red-50"
										type="submit"
										on:click={(event) => confirmDelete(event, staff.name)}
									>
										<Trash2 class="h-3 w-3" />
									</Button>
								</form>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
	</table>
</div>
