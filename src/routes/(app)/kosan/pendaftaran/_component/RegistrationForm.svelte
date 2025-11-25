<script lang="ts">
	import { onMount } from 'svelte';
	import { BedDouble, Building2, CalendarDays, Loader2, Users2 } from 'lucide-svelte';

	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Select from '$lib/components/ui/select.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';
	import Label from '$lib/components/ui/label.svelte';

	import type { CustomerOption, GedungOption, RoomOption, FormState } from './types';
	import { initRegistrationFormStore } from './registrationFormStore';

	export let customers: CustomerOption[] = [];
	export let gedungList: GedungOption[] = [];
	export let initialRooms: RoomOption[] = [];
	export let registerErrors: Record<string, string[]> | undefined = undefined;
	export let today: string;
	export let onCreateCustomer: () => void;

	const selectedGedungInitial = gedungList[0]?.id ?? '';
	const initialRoomsFiltered = initialRooms.filter(
		(room) => !selectedGedungInitial || room.gedungId === selectedGedungInitial
	);
	const selectedRoomInitial = initialRoomsFiltered[0]?.id ?? '';

	const store = initRegistrationFormStore(initialRoomsFiltered, selectedGedungInitial, selectedRoomInitial);
	let formState = { selectedGedung: selectedGedungInitial, selectedRoom: selectedRoomInitial, rooms: initialRoomsFiltered, loadingRooms: false };

	const unsubscribe = store.subscribe((value) => {
		formState = value;
	});

	onMount(() => {
		store.refetch();
		return () => {
			unsubscribe();
		};
	});

	function currentRoom() {
		return formState.rooms.find((room) => room.id === formState.selectedRoom) ?? null;
	}

	const formatCurrency = (value: number) =>
		`Rp ${value.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
</script>

<form method="POST" class="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
	<div class="grid gap-4 md:grid-cols-2">
		<div class="space-y-2">
			<Label for="pelangganId">Pelanggan</Label>
			<Select id="pelangganId" name="pelangganId" required className="h-11">
				<option value="">Pilih pelanggan</option>
				{#each customers as customer (customer.id)}
					<option value={customer.id}>{customer.name}</option>
				{/each}
			</Select>
			{#if registerErrors?.pelangganId}
				<p class="text-sm text-red-500">{registerErrors.pelangganId[0]}</p>
			{/if}
			<Button type="button" variant="outline" className="mt-2 gap-2" on:click={onCreateCustomer}>
				<Users2 class="h-4 w-4" />
				Tambah pelanggan baru
			</Button>
		</div>
		<div class="space-y-2">
			<Label for="tanggalMasuk">Tanggal masuk</Label>
			<Input id="tanggalMasuk" name="tanggalMasuk" type="date" value={today} required />
			{#if registerErrors?.tanggalMasuk}
				<p class="text-sm text-red-500">{registerErrors.tanggalMasuk[0]}</p>
			{/if}
		</div>
	</div>

	<div class="grid gap-4 md:grid-cols-2">
		<div class="space-y-2">
			<Label for="gedungId">Gedung</Label>
			<Select
				id="gedungId"
				name="gedungId"
				value={formState.selectedGedung}
				on:change={(event) => store.setGedung((event.currentTarget as HTMLSelectElement).value)}
				required
				className="h-11"
			>
				<option value="">Pilih gedung</option>
				{#each gedungList as gedungItem (gedungItem.id)}
					<option value={gedungItem.id}>{gedungItem.namaGedung}</option>
				{/each}
			</Select>
			{#if registerErrors?.gedungId}
				<p class="text-sm text-red-500">{registerErrors.gedungId[0]}</p>
			{/if}
		</div>
		<div class="space-y-2">
			<Label for="ruanganId">Ruangan</Label>
			<div class="relative">
				<Select
					id="ruanganId"
					name="ruanganId"
					value={formState.selectedRoom}
					on:change={(event) => store.setRoom((event.currentTarget as HTMLSelectElement).value)}
					disabled={formState.loadingRooms || formState.rooms.length === 0}
					required
					className="h-11"
				>
					<option value="">
						{formState.loadingRooms
							? 'Memuat...'
							: formState.rooms.length
								? 'Pilih ruangan'
								: 'Tidak ada kamar kosong'}
					</option>
					{#each formState.rooms as room (room.id)}
						<option value={room.id}>{room.namaRuangan}</option>
					{/each}
				</Select>
				{#if formState.loadingRooms}
					<Loader2 class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
				{/if}
			</div>
			{#if registerErrors?.ruanganId}
				<p class="text-sm text-red-500">{registerErrors.ruanganId[0]}</p>
			{/if}
		</div>
	</div>

	<div class="space-y-2">
		<Label for="catatan">Catatan</Label>
		<Textarea id="catatan" name="catatan" rows={3} placeholder="Catatan tambahan" />
	</div>

	{#if registerErrors?.root}
		<p class="text-sm text-red-500">{registerErrors.root[0]}</p>
	{/if}

	<div class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
		<p class="font-semibold text-slate-900">Ringkasan penempatan</p>
		{#if currentRoom()}
			<p class="mt-2 flex items-center gap-2">
				<Building2 class="h-4 w-4 text-slate-400" />
				{currentRoom()?.gedungNama}
			</p>
			<p class="flex items-center gap-2">
				<BedDouble class="h-4 w-4 text-slate-400" />
				Kamar {currentRoom()?.namaRuangan}
			</p>
			<p class="flex items-center gap-2">
				<CalendarDays class="h-4 w-4 text-slate-400" />
				Tarif bulanan: {formatCurrency(currentRoom()?.hargaBulanan ?? 0)}
			</p>
		{:else}
			<p class="mt-2 text-sm text-slate-500">Silakan pilih gedung dan ruangan untuk melihat tarif.</p>
		{/if}
	</div>

	<div class="flex justify-end gap-2">
		<Button type="reset" variant="ghost">Bersihkan</Button>
		<Button type="submit" className="gap-2">
			<Users2 class="h-4 w-4" />
			Simpan Pendaftaran
		</Button>
	</div>
</form>
