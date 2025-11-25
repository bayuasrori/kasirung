import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { InpatientService } from '$lib/server/services/simklinik/inpatient.service';
import { ConsultationsService } from '$lib/server/services/simklinik/consultations.service';
import { MedicalStaffService } from '$lib/server/services/simklinik/medical-staff.service';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const [inpatientAdmissions, inpatientConsultations] = await Promise.all([
		InpatientService.getActiveAdmissions(),
		new ConsultationsService().getAllConsultations({ isInpatient: true }, 1, 50)
	]);

	return {
		inpatientAdmissions,
		inpatientConsultations,
		staffList: await new MedicalStaffService().getAllStaff(undefined, undefined, 1, 100)
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const formData = await request.formData();
		const admissionId = formData.get('admissionId') as string | null;
		const patientId = formData.get('patientId') as string | null;
		let staffId = (formData.get('staffId') as string | null) || null;

		if (!admissionId || !patientId) {
			return fail(400, { success: false, message: 'Admission atau pasien tidak valid' });
		}

		if (!staffId) {
			const staff = await new MedicalStaffService().getStaffByUserId(locals.user.id);
			staffId = staff?.id ?? null;
		}

		if (!staffId) {
			return fail(403, {
				success: false,
				message: 'Tenaga medis tidak ditemukan. Daftarkan user ini di Tenaga Medis terlebih dahulu.'
			});
		}

		const consultationsService = new ConsultationsService();

		try {
			const consultation = await consultationsService.startConsultation({
				admissionId,
				patientId,
				staffId
			});
			throw redirect(303, `/simklinik/rekam-medis/${consultation.id}/edit`);
		} catch (error) {
			if (error instanceof Response) throw error;
			console.error('Error creating inpatient consultation:', error);
			return fail(500, { success: false, message: 'Gagal membuat catatan rawat inap' });
		}
	},
	finish: async ({ request, locals }) => {
		if (!locals.user) throw redirect(302, '/login');
		const formData = await request.formData();
		const consultationId = formData.get('id') as string | null;
		if (!consultationId) return fail(400, { success: false, message: 'ID konsultasi tidak ditemukan' });

		try {
			await new ConsultationsService().endConsultation(consultationId, {});
			return { success: true };
		} catch (error) {
			console.error('Error finishing inpatient consultation:', error);
			return fail(500, { success: false, message: 'Gagal menyelesaikan konsultasi' });
		}
	},
	delete: async ({ request, locals }) => {
		if (!locals.user) throw redirect(302, '/login');
		const formData = await request.formData();
		const consultationId = formData.get('id') as string | null;
		if (!consultationId) return fail(400, { success: false, message: 'ID konsultasi tidak ditemukan' });

		try {
			await new ConsultationsService().deleteConsultation(consultationId);
			return { success: true };
		} catch (error) {
			console.error('Error deleting inpatient consultation:', error);
			return fail(500, { success: false, message: 'Gagal menghapus konsultasi' });
		}
	}
};
