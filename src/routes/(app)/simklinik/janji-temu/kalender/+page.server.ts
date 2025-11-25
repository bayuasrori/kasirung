import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { AppointmentsService } from '$lib/server/services/simklinik/appointments.service';
import { MedicalStaffService } from '$lib/server/services/simklinik/medical-staff.service';
import { MedicalServicesService } from '$lib/server/services/simklinik/medical-services.service';

const APPOINTMENT_TYPES = ['consultation', 'checkup', 'follow_up', 'emergency', 'vaccination', 'procedure'] as const;
const STATUS_COLORS: Record<string, string> = {
	scheduled: '#fbbf24',
	confirmed: '#2563eb',
	completed: '#10b981',
	cancelled: '#ef4444',
	no_show: '#64748b'
};

const TYPE_LABELS: Record<(typeof APPOINTMENT_TYPES)[number], string> = {
	consultation: 'Konsultasi',
	checkup: 'Pemeriksaan',
	follow_up: 'Kontrol',
	emergency: 'Darurat',
	vaccination: 'Vaksinasi',
	procedure: 'Tindakan'
};

type CalendarEvent = {
	id: string;
	title: string;
	start: string;
	end?: string | null;
	allDay: boolean;
	backgroundColor: string;
	borderColor: string;
	extendedProps: {
		patientName: string;
		staffName: string;
		serviceName?: string | null;
		status: string;
		type: string;
		appointmentDate?: string;
		appointmentTime?: string | null;
		notes?: string | null;
		duration?: number | null;
	};
};

const toDateOnlyString = (date: Date) => date.toISOString().split('T')[0];

const computeDefaultRange = () => {
	const today = new Date();
	const start = new Date(today.getFullYear(), today.getMonth(), 1);
	const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
	return { start: toDateOnlyString(start), end: toDateOnlyString(end) };
};

const addDuration = (date: string, time?: string | null, duration?: number | null) => {
	if (!date || !time || !duration) {
		return null;
	}

	const [hours, minutes] = time.split(':').map(Number);
	const startDate = new Date(date);
	startDate.setHours(hours ?? 0, minutes ?? 0, 0, 0);
	startDate.setMinutes(startDate.getMinutes() + duration);
	return startDate.toISOString();
};

export const load = (async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const appointmentsService = new AppointmentsService();
	const medicalStaffService = new MedicalStaffService();
	const medicalServicesService = new MedicalServicesService();

	const staffId = url.searchParams.get('staffId') || '';
	const status = url.searchParams.get('status') || '';
	const type = url.searchParams.get('type') || '';
	const startParam = url.searchParams.get('start');
	const endParam = url.searchParams.get('end');

	const defaultRange = computeDefaultRange();
	const rangeStart = startParam || defaultRange.start;
	const rangeEnd = endParam || defaultRange.end;

	const filters: {
		staffId?: string;
		status?: string | string[];
		dateFrom: string;
		dateTo: string;
	} = {
		dateFrom: rangeStart,
		dateTo: rangeEnd
	};

	if (staffId) {
		filters.staffId = staffId;
	}

	if (status) {
		filters.status = status;
	}

	try {
		const [appointments, staffOptions, serviceOptions] = await Promise.all([
			appointmentsService.getAllAppointments(filters, 1, 500),
			medicalStaffService.getAllStaff(undefined, undefined, 1, 100),
			medicalServicesService.getAllServices(undefined, undefined, 1, 100)
		]);

		const filteredAppointments = type
			? appointments.filter((appointment) => appointment.type === type)
			: appointments;

		const events: CalendarEvent[] = filteredAppointments.map((appointment) => {
			const start = `${appointment.appointmentDate}T${appointment.appointmentTime ?? '08:00'}`;
			const end = addDuration(
				appointment.appointmentDate ?? '',
				appointment.appointmentTime,
				appointment.duration ?? null
			);

			return {
				id: appointment.id,
				title: `${appointment.patient?.name ?? 'Pasien'} • ${
					appointment.service?.name ?? TYPE_LABELS[appointment.type as (typeof APPOINTMENT_TYPES)[number]] ?? 'Janji'
				}`,
				start,
				end,
				allDay: false,
				backgroundColor: STATUS_COLORS[appointment.status] ?? '#2563eb',
				borderColor: STATUS_COLORS[appointment.status] ?? '#2563eb',
				extendedProps: {
					patientName: appointment.patient?.name ?? 'Pasien',
					staffName: appointment.staff?.name ?? 'Tenaga Medis',
					serviceName: appointment.service?.name ?? null,
					status: appointment.status,
					type: appointment.type,
					appointmentDate: appointment.appointmentDate,
					appointmentTime: appointment.appointmentTime,
					notes: appointment.notes ?? null,
					duration: appointment.duration ?? null
				}
			};
		});

		const summary = filteredAppointments.reduce(
			(acc, appointment) => {
				acc.total += 1;
				acc.statusCounts[appointment.status] = (acc.statusCounts[appointment.status] ?? 0) + 1;
				return acc;
			},
			{ total: 0, statusCounts: {} as Record<string, number> }
		);

		return {
			events,
			staffOptions,
			serviceOptions,
			range: {
				start: rangeStart,
				end: rangeEnd
			},
			filters: {
				staffId,
				status,
				type
			},
			typeOptions: APPOINTMENT_TYPES.map((value) => ({
				value,
				label: TYPE_LABELS[value]
			})),
			statusOptions: [
				{ value: 'scheduled', label: 'Terjadwal' },
				{ value: 'confirmed', label: 'Terkonfirmasi' },
				{ value: 'completed', label: 'Selesai' },
				{ value: 'cancelled', label: 'Dibatalkan' },
				{ value: 'no_show', label: 'Tidak Hadir' }
			],
			summary
		};
	} catch (error) {
		console.error('Error loading calendar data:', error);
		return {
			events: [],
			staffOptions: [],
			serviceOptions: [],
			range: {
				start: rangeStart,
				end: rangeEnd
			},
			filters: {
				staffId,
				status,
				type
			},
			typeOptions: APPOINTMENT_TYPES.map((value) => ({
				value,
				label: TYPE_LABELS[value]
			})),
			statusOptions: [
				{ value: 'scheduled', label: 'Terjadwal' },
				{ value: 'confirmed', label: 'Terkonfirmasi' },
				{ value: 'completed', label: 'Selesai' },
				{ value: 'cancelled', label: 'Dibatalkan' },
				{ value: 'no_show', label: 'Tidak Hadir' }
			],
			summary: {
				total: 0,
				statusCounts: {}
			}
		};
	}
}) satisfies PageServerLoad;
