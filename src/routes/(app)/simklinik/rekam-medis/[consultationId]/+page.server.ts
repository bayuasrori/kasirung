import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ConsultationsService } from '$lib/server/services/simklinik/consultations.service';
import { InpatientService } from '$lib/server/services/simklinik/inpatient.service';

export const load = (async ({ locals, params }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const consultationsService = new ConsultationsService();
	const consultationId = params.consultationId;

	try {
		const consultationData = await consultationsService.getConsultationById(consultationId);
		
		if (!consultationData) {
			throw redirect(302, '/simklinik/rekam-medis');
		}

		const [vitalSigns, prescriptions] = await Promise.all([
			consultationsService.getVitalSigns(consultationId),
			consultationsService.getPrescriptions(consultationId)
		]);

		const inpatientAdmission = await InpatientService.getActiveAdmissionForPatient(consultationData.consultation.patientId);

		return {
			consultation: consultationData,
			patient: consultationData.patient,
			staff: consultationData.staff,
			vitalSigns,
			prescriptions,
			appointment: consultationData.appointment,
			inpatientAdmission
		};
	} catch (error) {
		console.error('Error loading consultation detail:', error);
		throw redirect(302, '/simklinik/rekam-medis');
	}
}) satisfies PageServerLoad;
