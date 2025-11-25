<script lang="ts">
	import { Bed, Users, Activity, Plus } from 'lucide-svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	$: ({ rooms, activeAdmissions } = data);

	const bedStatuses = [
		{ value: 'available', label: 'Tersedia' },
		{ value: 'occupied', label: 'Terpakai' },
		{ value: 'maintenance', label: 'Perawatan' },
		{ value: 'cleaning', label: 'Pembersihan' }
	];

	$: allBeds = rooms.flatMap((room) =>
		room.beds.map((bed) => ({
			...bed,
			roomName: room.name
		}))
	);

	const formatCurrency = (value: number | string) =>
		new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(Number(value));

	function getBedStatusColor(status: string) {
		switch (status) {
			case 'available': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
			case 'occupied': return 'bg-red-100 text-red-700 border-red-200';
			case 'maintenance': return 'bg-amber-100 text-amber-700 border-amber-200';
			case 'cleaning': return 'bg-blue-100 text-blue-700 border-blue-200';
			default: return 'bg-slate-100 text-slate-700 border-slate-200';
		}
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-slate-900">Pasien Rawat Inap</h1>
			<p class="text-slate-500">Monitoring ketersediaan kamar dan pasien rawat inap</p>
		</div>
		<Button href="/simklinik/rawat-inap/admit">
			<Plus class="mr-2 h-4 w-4" />
			Registrasi Masuk
		</Button>
	</div>

	<!-- Quick Create Forms -->
	<div class="grid gap-4 lg:grid-cols-2">
		<div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
			<div class="mb-4">
				<h3 class="text-lg font-semibold text-slate-900">Tambah Ruangan</h3>
				<p class="text-sm text-slate-500">Masukkan data ruangan baru</p>
			</div>
			<form method="post" action="?/createRoom" class="space-y-4">
				<div class="grid gap-3 sm:grid-cols-2">
					<div class="space-y-2">
						<Label for="name">Nama Ruangan</Label>
						<Input name="name" id="name" placeholder="Contoh: Mawar" required />
					</div>
					<div class="space-y-2">
						<Label for="type">Tipe</Label>
						<Input name="type" id="type" placeholder="VIP / Kelas 1" required />
					</div>
				</div>
				<div class="space-y-2">
					<Label for="rate">Tarif per Malam</Label>
					<Input name="rate" id="rate" type="number" min="0" step="10000" placeholder="500000" required />
				</div>
				<div class="space-y-2">
					<Label for="description">Deskripsi</Label>
					<Textarea name="description" id="description" placeholder="Catatan fasilitas atau lokasi" />
				</div>
				<div class="flex justify-end">
					<Button type="submit">Simpan Ruangan</Button>
				</div>
			</form>
		</div>

		<div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
			<div class="mb-4">
				<h3 class="text-lg font-semibold text-slate-900">Tambah Bed</h3>
				<p class="text-sm text-slate-500">Assign bed ke ruangan</p>
			</div>
			<form method="post" action="?/addBed" class="space-y-4">
				<div class="space-y-2">
					<Label for="roomId">Ruangan</Label>
					<select
						name="roomId"
						id="roomId"
						class="w-full rounded-md border border-slate-200 p-2 text-sm focus:border-blue-500 focus:outline-none"
						required
					>
						<option value="">Pilih Ruangan</option>
						{#each rooms as room}
							<option value={room.id}>{room.name} ({room.type})</option>
						{/each}
					</select>
				</div>

				<div class="grid gap-3 sm:grid-cols-2">
					<div class="space-y-2">
						<Label for="bedNumber">Nomor Bed</Label>
						<Input name="bedNumber" id="bedNumber" placeholder="1 / A / 01A" required />
					</div>
					<div class="space-y-2">
						<Label for="status">Status</Label>
						<select
							name="status"
							id="status"
							class="w-full rounded-md border border-slate-200 p-2 text-sm focus:border-blue-500 focus:outline-none"
						>
							{#each bedStatuses as status}
								<option value={status.value}>{status.label}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="space-y-2">
					<Label for="notes">Catatan</Label>
					<Textarea name="notes" id="notes" placeholder="Catatan kondisi atau lokasi bed" />
				</div>

				<div class="flex justify-end">
					<Button type="submit">Simpan Bed</Button>
				</div>
			</form>
		</div>
	</div>

	<!-- Stats Overview -->
	<div class="grid gap-4 md:grid-cols-3">
		<div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
			<div class="flex items-center gap-4">
				<div class="rounded-lg bg-blue-50 p-3 text-blue-600">
					<Bed class="h-6 w-6" />
				</div>
				<div>
					<p class="text-sm font-medium text-slate-500">Total Bed</p>
					<h3 class="text-2xl font-bold text-slate-900">
						{rooms.reduce((acc, room) => acc + room.beds.length, 0)}
					</h3>
				</div>
			</div>
		</div>
		<div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
			<div class="flex items-center gap-4">
				<div class="rounded-lg bg-emerald-50 p-3 text-emerald-600">
					<Activity class="h-6 w-6" />
				</div>
				<div>
					<p class="text-sm font-medium text-slate-500">Tersedia</p>
					<h3 class="text-2xl font-bold text-slate-900">
						{rooms.reduce((acc, room) => acc + room.beds.filter(b => b.status === 'available').length, 0)}
					</h3>
				</div>
			</div>
		</div>
		<div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
			<div class="flex items-center gap-4">
				<div class="rounded-lg bg-red-50 p-3 text-red-600">
					<Users class="h-6 w-6" />
				</div>
				<div>
					<p class="text-sm font-medium text-slate-500">Pasien Dirawat</p>
					<h3 class="text-2xl font-bold text-slate-900">{activeAdmissions.length}</h3>
				</div>
			</div>
		</div>
	</div>

	<!-- Rooms & Beds Grid -->
	<div class="grid gap-6 lg:grid-cols-2">
		{#each rooms as room}
			<div class="rounded-xl border border-slate-200 bg-white shadow-sm">
				<div class="border-b border-slate-200 px-4 py-3">
					<div class="flex items-center justify-between">
						<div>
							<h3 class="font-semibold text-slate-900">{room.name}</h3>
							<p class="text-xs text-slate-500">{room.type} • {formatCurrency(room.rate)}/malam</p>
						</div>
						<Badge variant="muted">{room.beds.length} Bed</Badge>
					</div>
				</div>
				<div class="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
					{#each room.beds as bed}
						<div class={`flex flex-col items-center justify-center rounded-lg border p-3 text-center transition ${getBedStatusColor(bed.status)}`}>
							<span class="text-lg font-bold">{bed.bedNumber}</span>
							<span class="text-xs capitalize">{bed.status}</span>
						</div>
					{/each}
					{#if room.beds.length === 0}
						<div class="col-span-full py-4 text-center text-sm text-slate-500">
							Belum ada bed di ruangan ini
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<!-- Manage Rooms -->
	<div class="rounded-xl border border-slate-200 bg-white shadow-sm">
		<div class="border-b border-slate-200 px-6 py-4">
			<h3 class="font-semibold text-slate-900">Kelola Ruangan</h3>
			<p class="text-sm text-slate-500">Ubah detail atau hapus ruangan</p>
		</div>
		<div class="space-y-4 p-6">
			{#if rooms.length === 0}
				<p class="text-sm text-slate-500">Belum ada ruangan.</p>
			{:else}
				{#each rooms as room}
					<form method="post" action="?/updateRoom" class="grid gap-3 rounded-lg border border-slate-200 p-4 sm:grid-cols-6">
						<input type="hidden" name="id" value={room.id} />
						<div class="space-y-1 sm:col-span-2">
							<Label for={`room-name-${room.id}`}>Nama</Label>
							<Input name="name" id={`room-name-${room.id}`} value={room.name} required />
						</div>
						<div class="space-y-1">
							<Label for={`room-type-${room.id}`}>Tipe</Label>
							<Input name="type" id={`room-type-${room.id}`} value={room.type} required />
						</div>
						<div class="space-y-1">
							<Label for={`room-rate-${room.id}`}>Tarif</Label>
							<Input
								name="rate"
								id={`room-rate-${room.id}`}
								type="number"
								min="0"
								step="10000"
								value={room.rate}
								required
							/>
						</div>
						<div class="space-y-1 sm:col-span-1">
							<Label for={`room-desc-${room.id}`}>Deskripsi</Label>
							<Input name="description" id={`room-desc-${room.id}`} value={room.description ?? ''} />
						</div>
						<div class="flex items-end justify-end gap-2 sm:col-span-1">
							<Button type="submit" size="sm">Update</Button>
							<Button type="submit" formaction="?/deleteRoom" variant="destructive" size="sm">Hapus</Button>
						</div>
					</form>
				{/each}
			{/if}
		</div>
	</div>

	<!-- Manage Beds -->
	<div class="rounded-xl border border-slate-200 bg-white shadow-sm">
		<div class="border-b border-slate-200 px-6 py-4">
			<h3 class="font-semibold text-slate-900">Kelola Bed</h3>
			<p class="text-sm text-slate-500">Update status, pindah ruangan, atau hapus bed</p>
		</div>
		<div class="space-y-4 p-6">
			{#if allBeds.length === 0}
				<p class="text-sm text-slate-500">Belum ada bed terdaftar.</p>
			{:else}
				{#each allBeds as bed}
					<form method="post" action="?/updateBed" class="grid gap-3 rounded-lg border border-slate-200 p-4 sm:grid-cols-6">
						<input type="hidden" name="id" value={bed.id} />
						<div class="space-y-1">
							<Label for={`bed-number-${bed.id}`}>Bed</Label>
							<Input name="bedNumber" id={`bed-number-${bed.id}`} value={bed.bedNumber} required />
						</div>
						<div class="space-y-1 sm:col-span-2">
							<Label for={`bed-room-${bed.id}`}>Ruangan</Label>
							<select
								name="roomId"
								id={`bed-room-${bed.id}`}
								class="w-full rounded-md border border-slate-200 p-2 text-sm focus:border-blue-500 focus:outline-none"
								required
							>
								{#each rooms as room}
									<option value={room.id} selected={bed.roomId === room.id}>{room.name} ({room.type})</option>
								{/each}
							</select>
						</div>
						<div class="space-y-1">
							<Label for={`bed-status-${bed.id}`}>Status</Label>
							<select
								name="status"
								id={`bed-status-${bed.id}`}
								class="w-full rounded-md border border-slate-200 p-2 text-sm capitalize focus:border-blue-500 focus:outline-none"
							>
								{#each bedStatuses as status}
									<option value={status.value} selected={status.value === bed.status}>{status.label}</option>
								{/each}
							</select>
						</div>
						<div class="space-y-1 sm:col-span-1">
							<Label for={`bed-notes-${bed.id}`}>Catatan</Label>
							<Input name="notes" id={`bed-notes-${bed.id}`} value={bed.notes ?? ''} />
						</div>
						<div class="flex items-end justify-end gap-2 sm:col-span-1">
							<Button type="submit" size="sm">Update</Button>
							<Button type="submit" formaction="?/deleteBed" variant="destructive" size="sm">Hapus</Button>
						</div>
					</form>
				{/each}
			{/if}
		</div>
	</div>

	<!-- Active Admissions List -->
	<div class="rounded-xl border border-slate-200 bg-white shadow-sm">
		<div class="border-b border-slate-200 px-6 py-4">
			<h3 class="font-semibold text-slate-900">Pasien Sedang Dirawat</h3>
		</div>
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm">
				<thead class="bg-slate-50 text-slate-500">
					<tr>
						<th class="px-6 py-3 font-medium">Pasien</th>
						<th class="px-6 py-3 font-medium">Ruangan / Bed</th>
						<th class="px-6 py-3 font-medium">Tanggal Masuk</th>
						<th class="px-6 py-3 font-medium">Diagnosa</th>
						<th class="px-6 py-3 font-medium">Status</th>
						<th class="px-6 py-3 font-medium text-right">Aksi</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-200">
					{#each activeAdmissions as admission}
						<tr class="hover:bg-slate-50">
							<td class="px-6 py-4">
								<div class="font-medium text-slate-900">{admission.patient.name}</div>
								<div class="text-xs text-slate-500">{admission.patient.mrNumber}</div>
							</td>
							<td class="px-6 py-4">
								<div class="font-medium text-slate-900">{admission.bed.room.name}</div>
								<div class="text-xs text-slate-500">Bed {admission.bed.bedNumber}</div>
							</td>
							<td class="px-6 py-4">
								{new Date(admission.admissionDate).toLocaleDateString('id-ID', {
									day: 'numeric',
									month: 'long',
									year: 'numeric',
									hour: '2-digit',
									minute: '2-digit'
								})}
							</td>
							<td class="px-6 py-4 text-slate-600">{admission.diagnosis || '-'}</td>
							<td class="px-6 py-4">
								<Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">
									Dirawat
								</Badge>
							</td>
							<td class="px-6 py-4 text-right">
								<form method="post" action="?/discharge" class="flex items-center justify-end gap-2">
									<input type="hidden" name="id" value={admission.id} />
									<input type="hidden" name="notes" value="Discharge via dashboard" />
									<Button size="sm" variant="outline" type="submit">Discharge</Button>
								</form>
							</td>
						</tr>
					{/each}
					{#if activeAdmissions.length === 0}
						<tr>
							<td colspan="6" class="px-6 py-8 text-center text-slate-500">
								Tidak ada pasien yang sedang dirawat
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>
