import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ConsultationsService } from '$lib/server/services/simklinik/consultations.service';

import { AppointmentsService } from '$lib/server/services/simklinik/appointments.service';
import { MedicalStaffService } from '$lib/server/services/simklinik/medical-staff.service';

export const load = (async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const consultationsService = new ConsultationsService();
	const appointmentsService = new AppointmentsService();
	
	const page = Number(url.searchParams.get('page')) || 1;
	const limit = Number(url.searchParams.get('limit')) || 10;
	const search = url.searchParams.get('search') || '';
	const status = url.searchParams.get('status') || '';

	try {
		const today = new Date();
		const todayStr = today.toISOString().split('T')[0];
		const weekAgo = new Date(today);
		weekAgo.setDate(weekAgo.getDate() - 7);
		const monthAgo = new Date(today);
		monthAgo.setDate(monthAgo.getDate() - 30);

		// TODO: Implement search by patient name in service/repo if needed
		// For now passing status filter
		const filters: any = { isInpatient: false };
		if (status && status !== 'all') filters.status = status;

		const [
			outpatientConsultations, 
			totalOutpatient, 
			todayCount, 
			weekCount, 
			monthCount,
			confirmedAppointments
		] = await Promise.all([
			consultationsService.getAllConsultations(filters, page, limit),
			consultationsService.getConsultationCount(filters),
			consultationsService.getConsultationCount({
				dateFrom: todayStr,
				dateTo: todayStr
			}),
			consultationsService.getConsultationCount({
				dateFrom: weekAgo.toISOString().split('T')[0],
				dateTo: todayStr
			}),
			consultationsService.getConsultationCount({
				dateFrom: monthAgo.toISOString().split('T')[0],
				dateTo: todayStr
			}),
			appointmentsService.getAllAppointments({
				status: 'confirmed',
				dateFrom: todayStr,
				dateTo: todayStr
			}, 1, 50)
		]);

		// Mock specialty distribution - would be implemented with real data analysis
		const specialtyDistribution = [
			{ type: 'General Practice', count: 45 },
			{ type: 'Pediatrics', count: 23 },
			{ type: 'Obstetrics', count: 18 },
			{ type: 'Internal Medicine', count: 31 }
		];

		return {
			recentConsultations: outpatientConsultations,
			totalConsultations: totalOutpatient,
			confirmedAppointments,
			pagination: {
				page,
				limit,
				totalPages: Math.ceil(totalOutpatient / limit)
			},
			consultationStats: {
				today: todayCount,
				thisWeek: weekCount,
				thisMonth: monthCount
			},
			specialtyDistribution
		};
	} catch (error) {
		console.error('Error loading medical records:', error);
		return {
			recentConsultations: [],
			totalConsultations: 0,
			confirmedAppointments: [],
			pagination: { page: 1, limit: 10, totalPages: 0 },
			consultationStats: {
				today: 0,
				thisWeek: 0,
				thisMonth: 0
			},
			specialtyDistribution: []
		};
	}
}) satisfies PageServerLoad;

export const actions = {
	create: async ({ request, locals }) => {
		const formData = await request.formData();
		const appointmentId = formData.get('appointmentId') as string | null;
		const admissionId = formData.get('admissionId') as string | null;
		const patientId = formData.get('patientId') as string;
		let staffId = formData.get('staffId') as string | null;

		if (!patientId || (!appointmentId && !admissionId)) {
			return { success: false, message: 'Missing required fields' };
		}

		if (!staffId) {
			const userId = locals.user?.id;
			if (!userId) return { success: false, message: 'User is not authenticated' };
			const staff = await new MedicalStaffService().getStaffByUserId(userId);
			staffId = staff?.id ?? null;
		}

		if (!staffId) {
			return { success: false, message: 'Tenaga medis tidak ditemukan' };
		}

		const consultationsService = new ConsultationsService();
		try {
			const consultation = await consultationsService.startConsultation({
				appointmentId: appointmentId ?? undefined,
				admissionId: admissionId ?? undefined,
				staffId,
				patientId
			});
			throw redirect(303, `/simklinik/rekam-medis/${consultation.id}/edit`);
		} catch (error) {
			if (error instanceof Response) throw error;
			console.error('Error creating consultation:', error);
			return { success: false, message: 'Failed to create consultation' };
		}
	},
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		
		if (!id) {
			return { success: false, message: 'ID is required' };
		}

		const consultationsService = new ConsultationsService();
		try {
			await consultationsService.deleteConsultation(id);
			return { success: true, message: 'Consultation deleted successfully' };
		} catch (error) {
			console.error('Error deleting consultation:', error);
			return { success: false, message: 'Failed to delete consultation' };
		}
	},
	cancel: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		
		if (!id) {
			return { success: false, message: 'ID is required' };
		}

		const consultationsService = new ConsultationsService();
		try {
			await consultationsService.cancelConsultation(id);
			return { success: true, message: 'Consultation cancelled successfully' };
		} catch (error) {
			console.error('Error cancelling consultation:', error);
			return { success: false, message: 'Failed to cancel consultation' };
		}
	}
};
