<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import CardDescription from '$lib/components/ui/card-description.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import Select from '$lib/components/ui/select.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import { Calendar } from '@fullcalendar/core';
	import dayGridPlugin from '@fullcalendar/daygrid';
	import timeGridPlugin from '@fullcalendar/timegrid';
	import interactionPlugin from '@fullcalendar/interaction';
	import { CalendarDays, List, ArrowLeft } from 'lucide-svelte';

	export let data: PageData;

	type CalendarEvent = PageData['events'][number];

	const statusLabels: Record<string, string> = {
		scheduled: 'Terjadwal',
		confirmed: 'Terkonfirmasi',
		completed: 'Selesai',
		cancelled: 'Dibatalkan',
		no_show: 'Tidak Hadir'
	};

	type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'muted';

	const statusVariant = (status: string): BadgeVariant => {
		switch (status) {
			case 'completed':
				return 'success';
			case 'confirmed':
				return 'default';
			case 'cancelled':
			case 'no_show':
				return 'destructive';
			default:
				return 'warning';
		}
	};

	let calendarEl: HTMLDivElement;
	let calendar: Calendar | null = null;
	let suppressDatesSet = false;
	let selectedEvent: CalendarEvent | null = null;
	let viewMode: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' = 'dayGridMonth';

	const normalizeEvents = (events: CalendarEvent[]) =>
		events.map((event) => ({
			...event,
			end: event.end ?? undefined
		}));

	const formatDate = (value?: string | null) => {
		if (!value) return '-';
		return new Date(value).toLocaleDateString('id-ID', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	};

	const formatTime = (value?: string | null) => value ?? '-';

	const formatDateTime = (date?: string, time?: string | null) => {
		if (!date) return '-';
		const dateStr = formatDate(date);
		return `${dateStr} • ${formatTime(time)}`;
	};

	const inclusiveEnd = (date: Date) => {
		const endDate = new Date(date);
		endDate.setDate(endDate.getDate() - 1);
		return endDate.toISOString().split('T')[0];
	};

	const handleDatesSet = (arg: { start: Date; end: Date }) => {
		if (suppressDatesSet) {
			suppressDatesSet = false;
			return;
		}

		const startStr = arg.start.toISOString().split('T')[0];
		const endStr = inclusiveEnd(arg.end);

		if (startStr === data.range.start && endStr === data.range.end) {
			return;
		}

		const params = new URLSearchParams($page.url.searchParams);
		params.set('start', startStr);
		params.set('end', endStr);

		goto(`/simklinik/janji-temu/kalender?${params.toString()}`, {
			replaceState: true,
			noScroll: true
		});
	};

	const handleEventClick = (eventId: string) => {
		selectedEvent = data.events.find((event) => event.id === eventId) ?? null;
	};

	const changeView = (mode: typeof viewMode) => {
		viewMode = mode;
		if (calendar) {
			suppressDatesSet = true;
			calendar.changeView(mode);
			suppressDatesSet = false;
		}
	};

	onMount(() => {
		calendar = new Calendar(calendarEl, {
			plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
			initialView: viewMode,
			initialDate: data.range.start,
			events: normalizeEvents(data.events),
			headerToolbar: false,
			height: 'auto',
			weekends: true,
			displayEventEnd: true,
			eventClick: (info) => {
				handleEventClick(info.event.id);
			},
			datesSet: (info) => handleDatesSet(info)
		});

		calendar.render();

		return () => {
			calendar?.destroy();
			calendar = null;
		};
	});

	$: if (calendar) {
		// Keep the calendar aligned with the current range
		const currentDate = calendar.getDate();
		const targetDate = new Date(`${data.range.start}T00:00:00`);
		if (
			currentDate.getFullYear() !== targetDate.getFullYear() ||
			currentDate.getMonth() !== targetDate.getMonth()
		) {
			suppressDatesSet = true;
			calendar.gotoDate(targetDate);
		}

		calendar.removeAllEvents();
		calendar.addEventSource(normalizeEvents(data.events));

		if (suppressDatesSet) {
			suppressDatesSet = false;
		}
	}

	$: if (selectedEvent) {
		const updatedEvent = data.events.find((event) => event.id === selectedEvent?.id);
		if (!updatedEvent) {
			selectedEvent = null;
		} else if (updatedEvent !== selectedEvent) {
			selectedEvent = updatedEvent;
		}
	}
</script>

<div class="flex-1 space-y-6 p-8">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div>
			<h2 class="text-3xl font-bold tracking-tight">Kalender Janji Temu</h2>
			<p class="text-muted-foreground">Pantau jadwal klinik menggunakan tampilan kalender</p>
		</div>
		<div class="flex flex-wrap gap-2">
			<Button variant="outline" href="/simklinik/janji-temu">
				<ArrowLeft class="mr-2 h-4 w-4" />
				Kembali ke Daftar
			</Button>
			<Button href="/simklinik/janji-temu">
				<List class="mr-2 h-4 w-4" />
				Mode Tabel
			</Button>
		</div>
	</div>

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card>
			<CardHeader class="space-y-1">
				<CardTitle class="text-sm font-medium">Total Janji</CardTitle>
				<CardDescription>Dalam rentang aktif</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.summary.total}</div>
			</CardContent>
		</Card>
		{#each data.statusOptions as option}
			<Card>
				<CardHeader class="space-y-1">
					<CardTitle class="text-sm font-medium">{option.label}</CardTitle>
					<CardDescription>Status saat ini</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold">{data.summary.statusCounts[option.value] ?? 0}</div>
				</CardContent>
			</Card>
		{/each}
	</div>

	<Card>
		<CardHeader>
			<CardTitle>Filter Kalender</CardTitle>
			<CardDescription>Sesuaikan tampilan kalender dengan kebutuhan</CardDescription>
		</CardHeader>
		<CardContent>
			<form method="GET" class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div class="space-y-2">
					<label for="status" class="text-sm font-medium text-slate-600">Status</label>
					<Select id="status" name="status" value={data.filters.status}>
						<option value="">Semua Status</option>
						{#each data.statusOptions as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</Select>
				</div>
				<div class="space-y-2">
					<label for="staffId" class="text-sm font-medium text-slate-600">Tenaga Medis</label>
					<Select id="staffId" name="staffId" value={data.filters.staffId}>
						<option value="">Semua Tenaga Medis</option>
						{#each data.staffOptions as staff (staff.id)}
							<option value={staff.id}>{staff.name}</option>
						{/each}
					</Select>
				</div>
				<div class="space-y-2">
					<label for="type" class="text-sm font-medium text-slate-600">Tipe Janji</label>
					<Select id="type" name="type" value={data.filters.type}>
						<option value="">Semua Tipe</option>
						{#each data.typeOptions as typeOption}
							<option value={typeOption.value}>{typeOption.label}</option>
						{/each}
					</Select>
				</div>
				<div class="space-y-2">
					<label for="start" class="text-sm font-medium text-slate-600">Tanggal Mulai</label>
					<Input id="start" type="date" name="start" value={data.range.start} />
				</div>
				<div class="space-y-2">
					<label for="end" class="text-sm font-medium text-slate-600">Tanggal Selesai</label>
					<Input id="end" type="date" name="end" value={data.range.end} />
				</div>
				<div class="md:col-span-2 lg:col-span-4 flex flex-wrap gap-2">
					<Button type="submit">Terapkan Filter</Button>
					<Button
						type="button"
						variant="ghost"
						on:click={() => {
							const params = new URLSearchParams();
							goto('/simklinik/janji-temu/kalender', { replaceState: true });
						}}
					>
						Atur Ulang
					</Button>
				</div>
			</form>
		</CardContent>
	</Card>

	<div class="grid gap-4 lg:grid-cols-3">
		<Card class="lg:col-span-2">
			<CardHeader class="flex flex-wrap items-center justify-between gap-4">
				<div>
					<CardTitle>Kalender</CardTitle>
					<CardDescription>
						Periode {formatDate(data.range.start)} - {formatDate(data.range.end)}
					</CardDescription>
				</div>
				<div class="flex flex-wrap gap-2">
					<Button
						variant={viewMode === 'dayGridMonth' ? 'default' : 'outline'}
						on:click={() => changeView('dayGridMonth')}
					>
						Bulan
					</Button>
					<Button
						variant={viewMode === 'timeGridWeek' ? 'default' : 'outline'}
						on:click={() => changeView('timeGridWeek')}
					>
						Minggu
					</Button>
					<Button
						variant={viewMode === 'timeGridDay' ? 'default' : 'outline'}
						on:click={() => changeView('timeGridDay')}
					>
						Hari
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<div class="rounded-xl border bg-white p-2 shadow-sm">
					<div bind:this={calendarEl} class="[&_.fc]:text-sm"></div>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Detail Janji Temu</CardTitle>
				<CardDescription>
					Pilih event di kalender untuk melihat detail
				</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				{#if selectedEvent}
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<p class="text-lg font-semibold">{selectedEvent.extendedProps.patientName}</p>
							<Badge variant={statusVariant(selectedEvent.extendedProps.status)}>
								{statusLabels[selectedEvent.extendedProps.status] ?? selectedEvent.extendedProps.status}
							</Badge>
						</div>
						<p class="text-sm text-muted-foreground">
							{formatDateTime(
								selectedEvent.extendedProps.appointmentDate,
								selectedEvent.extendedProps.appointmentTime
							)}
						</p>
					</div>
					<div class="space-y-3 text-sm">
						<div>
							<p class="font-medium text-slate-700">Tenaga Medis</p>
							<p class="text-muted-foreground">{selectedEvent.extendedProps.staffName}</p>
						</div>
						<div>
							<p class="font-medium text-slate-700">Layanan</p>
							<p class="text-muted-foreground">
								{selectedEvent.extendedProps.serviceName ?? '-'}
							</p>
						</div>
						<div>
							<p class="font-medium text-slate-700">Durasi</p>
							<p class="text-muted-foreground">
								{#if selectedEvent.extendedProps.duration}
									{selectedEvent.extendedProps.duration} menit
								{:else}
									-
								{/if}
							</p>
						</div>
						<div>
							<p class="font-medium text-slate-700">Catatan</p>
							{#if selectedEvent.extendedProps.notes}
								<p class="rounded-md border border-slate-200 bg-slate-50 p-3 text-muted-foreground">
									{selectedEvent.extendedProps.notes}
								</p>
							{:else}
								<p class="text-muted-foreground">-</p>
							{/if}
						</div>
					</div>
				{:else}
					<div class="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
						<CalendarDays class="mb-4 h-10 w-10" />
						Pilih salah satu janji temu di kalender untuk melihat detail
					</div>
				{/if}
			</CardContent>
		</Card>
	</div>
</div>
