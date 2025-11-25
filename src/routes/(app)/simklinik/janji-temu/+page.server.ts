import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { AppointmentsService } from '$lib/server/services/simklinik/appointments.service';
import { MedicalStaffService } from '$lib/server/services/simklinik/medical-staff.service';
import { MedicalServicesService } from '$lib/server/services/simklinik/medical-services.service';

const APPOINTMENTS_PER_PAGE = 20;
const APPOINTMENT_TYPES = ['consultation', 'checkup', 'follow_up', 'emergency', 'vaccination', 'procedure'] as const;
type AppointmentType = (typeof APPOINTMENT_TYPES)[number];

const isValidAppointmentType = (value: string): value is AppointmentType =>
	APPOINTMENT_TYPES.includes(value as AppointmentType);

const buildRedirectUrl = (success: boolean, message: string) =>
	`/simklinik/janji-temu?success=${success}&message=${encodeURIComponent(message)}`;

export const load = (async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const appointmentsService = new AppointmentsService();
	const medicalStaffService = new MedicalStaffService();
	const medicalServicesService = new MedicalServicesService();

	try {
		const today = new Date().toISOString().split('T')[0];
		const nextWeek = new Date();
		nextWeek.setDate(nextWeek.getDate() + 7);
		const nextWeekStr = nextWeek.toISOString().split('T')[0];

		const page = parseInt(url.searchParams.get('page') || '1', 10) || 1;
		const status = url.searchParams.get('status') || '';
		const staffId = url.searchParams.get('staffId') || '';
		const dateFrom = url.searchParams.get('dateFrom') || '';
		const dateTo = url.searchParams.get('dateTo') || '';

		const filters: {
			patientId?: string;
			staffId?: string;
			status?: string | string[];
			dateFrom?: string;
			dateTo?: string;
		} = {};

		if (status) {
			filters.status = status;
		}

		if (staffId) {
			filters.staffId = staffId;
		}

		if (dateFrom && dateTo) {
			filters.dateFrom = dateFrom;
			filters.dateTo = dateTo;
		} else if (dateFrom && !dateTo) {
			filters.dateFrom = dateFrom;
			filters.dateTo = dateFrom;
		} else if (!dateFrom && dateTo) {
			filters.dateFrom = dateTo;
			filters.dateTo = dateTo;
		}

		const [todayAppointments, upcomingAppointments, availableStaff] = await Promise.all([
			appointmentsService.getTodayAppointments(20),
			appointmentsService.getAllAppointments({
				dateFrom: today,
				dateTo: nextWeekStr,
				status: 'scheduled,confirmed'
			}, 1, 20),
			medicalStaffService.getAllStaff(undefined, 'doctor', 1, 10)
		]);

		const [
			totalToday,
			totalUpcoming,
			appointments,
			totalAppointments,
			staff,
			services
		] = await Promise.all([
			appointmentsService.getAppointmentCount({
				dateFrom: today,
				dateTo: today
			}),
			appointmentsService.getAppointmentCount({
				dateFrom: today,
				dateTo: nextWeekStr,
				status: 'scheduled,confirmed'
			}),
			appointmentsService.getAllAppointments(filters, page, APPOINTMENTS_PER_PAGE),
			appointmentsService.getAppointmentCount(filters),
			medicalStaffService.getAllStaff(undefined, undefined, 1, 100),
			medicalServicesService.getAllServices(undefined, undefined, 1, 100)
		]);

		const totalPages = Math.max(1, Math.ceil(totalAppointments / APPOINTMENTS_PER_PAGE));

		return {
			todayAppointments,
			upcomingAppointments: upcomingAppointments.filter((a) => a.appointmentDate !== today),
			totalToday,
			totalUpcoming,
			availableStaff,
			appointments,
			pagination: {
				page,
				total: totalAppointments,
				totalPages,
				limit: APPOINTMENTS_PER_PAGE
			},
			filters: {
				status,
				staffId,
				dateFrom,
				dateTo
			},
			staffOptions: staff,
			serviceOptions: services
		};
	} catch (error) {
		console.error('Error loading appointments:', error);
		return {
			todayAppointments: [],
			upcomingAppointments: [],
			totalToday: 0,
			totalUpcoming: 0,
			availableStaff: [],
			appointments: [],
			pagination: {
				page: 1,
				total: 0,
				totalPages: 1,
				limit: APPOINTMENTS_PER_PAGE
			},
			filters: {
				status: '',
				staffId: '',
				dateFrom: '',
				dateTo: ''
			},
			staffOptions: [],
			serviceOptions: []
		};
	}
}) satisfies PageServerLoad;

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const formData = await request.formData();
		const patientId = formData.get('patientId');
		const staffId = formData.get('staffId');
		const serviceId = formData.get('serviceId');
		const appointmentDate = formData.get('appointmentDate');
		const appointmentTime = formData.get('appointmentTime');
		const type = formData.get('type');
		const notes = formData.get('notes');
		const duration = formData.get('duration');

		if (
			typeof patientId !== 'string' ||
			!patientId ||
			typeof staffId !== 'string' ||
			!staffId ||
			typeof appointmentDate !== 'string' ||
			!appointmentDate ||
			typeof appointmentTime !== 'string' ||
			!appointmentTime ||
			typeof type !== 'string' ||
			!type
		) {
			throw redirect(303, buildRedirectUrl(false, 'Data janji temu tidak lengkap'));
		}

		if (!isValidAppointmentType(type)) {
			throw redirect(303, buildRedirectUrl(false, 'Tipe janji temu tidak valid'));
		}

		const appointmentsService = new AppointmentsService();

		const rawDuration =
			typeof duration === 'string' && duration !== '' ? Number(duration) : null;
		const normalizedDuration =
			rawDuration !== null && !Number.isNaN(rawDuration) ? rawDuration : null;
		const appointmentType = type as AppointmentType;

		try {
			await appointmentsService.createAppointment({
				patientId,
				staffId,
				serviceId: typeof serviceId === 'string' && serviceId !== '' ? serviceId : null,
				appointmentDate,
				appointmentTime,
				type: appointmentType,
				duration: normalizedDuration,
				notes: typeof notes === 'string' && notes !== '' ? notes : null
			});

			throw redirect(303, buildRedirectUrl(true, 'Janji temu berhasil dibuat'));
		} catch (error: any) {
			if (error.status) throw error;
			console.error('Error creating appointment:', error);
			throw redirect(
				303,
				buildRedirectUrl(false, error instanceof Error ? error.message : 'Gagal membuat janji temu')
			);
		}
	},
	reschedule: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const formData = await request.formData();
		const appointmentId = formData.get('appointmentId');
		const newDate = formData.get('appointmentDate');
		const newTime = formData.get('appointmentTime');

		if (
			typeof appointmentId !== 'string' ||
			!appointmentId ||
			typeof newDate !== 'string' ||
			!newDate ||
			typeof newTime !== 'string' ||
			!newTime
		) {
			throw redirect(303, buildRedirectUrl(false, 'Data penjadwalan ulang tidak lengkap'));
		}

		const appointmentsService = new AppointmentsService();

		try {
			await appointmentsService.rescheduleAppointment(appointmentId, newDate, newTime);
			throw redirect(303, buildRedirectUrl(true, 'Janji temu berhasil dijadwalkan ulang'));
		} catch (error: any) {
			if (error.status) throw error;
			console.error('Error rescheduling appointment:', error);
			throw redirect(
				303,
				buildRedirectUrl(false, error instanceof Error ? error.message : 'Gagal menjadwalkan ulang')
			);
		}
	},
	confirm: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const formData = await request.formData();
		const appointmentId = formData.get('appointmentId');

		if (typeof appointmentId !== 'string' || !appointmentId) {
			throw redirect(303, buildRedirectUrl(false, 'Janji temu tidak valid'));
		}

		const appointmentsService = new AppointmentsService();

		try {
			await appointmentsService.confirmAppointment(appointmentId);
			throw redirect(303, buildRedirectUrl(true, 'Janji temu dikonfirmasi'));
		} catch (error: any) {
			if (error.status) throw error;
			console.error('Error confirming appointment:', error);
			throw redirect(
				303,
				buildRedirectUrl(false, error instanceof Error ? error.message : 'Gagal mengonfirmasi janji temu')
			);
		}
	},
	complete: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const formData = await request.formData();
		const appointmentId = formData.get('appointmentId');

		if (typeof appointmentId !== 'string' || !appointmentId) {
			throw redirect(303, buildRedirectUrl(false, 'Janji temu tidak valid'));
		}

		const appointmentsService = new AppointmentsService();

		try {
			await appointmentsService.completeAppointment(appointmentId);
			throw redirect(303, buildRedirectUrl(true, 'Janji temu ditandai selesai'));
		} catch (error: any) {
			if (error.status) throw error;
			console.error('Error completing appointment:', error);
			throw redirect(
				303,
				buildRedirectUrl(false, error instanceof Error ? error.message : 'Gagal menandai selesai')
			);
		}
	},
	cancel: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const formData = await request.formData();
		const appointmentId = formData.get('appointmentId');
		const reason = formData.get('reason');

		if (typeof appointmentId !== 'string' || !appointmentId) {
			throw redirect(303, buildRedirectUrl(false, 'Janji temu tidak valid'));
		}

		const appointmentsService = new AppointmentsService();

		try {
			await appointmentsService.cancelAppointment(
				appointmentId,
				typeof reason === 'string' && reason !== '' ? reason : undefined
			);
			throw redirect(303, buildRedirectUrl(true, 'Janji temu dibatalkan'));
		} catch (error: any) {
			if (error.status) throw error;
			console.error('Error cancelling appointment:', error);
			throw redirect(
				303,
				buildRedirectUrl(false, error instanceof Error ? error.message : 'Gagal membatalkan janji temu')
			);
		}
	},
	delete: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const formData = await request.formData();
		const appointmentId = formData.get('appointmentId');

		if (typeof appointmentId !== 'string' || !appointmentId) {
			throw redirect(303, buildRedirectUrl(false, 'Janji temu tidak valid'));
		}

		const appointmentsService = new AppointmentsService();

		try {
			await appointmentsService.deleteAppointment(appointmentId);
			throw redirect(303, buildRedirectUrl(true, 'Janji temu dihapus'));
		} catch (error: any) {
			if (error.status) throw error;
			console.error('Error deleting appointment:', error);
			throw redirect(
				303,
				buildRedirectUrl(false, error instanceof Error ? error.message : 'Gagal menghapus janji temu')
			);
		}
	}
};
