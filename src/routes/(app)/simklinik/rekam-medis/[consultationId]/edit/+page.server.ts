import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ConsultationsService } from '$lib/server/services/simklinik/consultations.service';
import { MedicalStaffService } from '$lib/server/services/simklinik/medical-staff.service';
import { InpatientService } from '$lib/server/services/simklinik/inpatient.service';

export const load = (async ({ locals, params }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const consultationsService = new ConsultationsService();
	const medicalStaffService = new MedicalStaffService();
	const consultationId = params.consultationId;

	try {
		// Check if user is medical staff
		const staff = await medicalStaffService.getStaffByUserId(locals.user.id);
		const allowedRoles = ['doctor', 'nurse', 'midwife', 'specialist', 'pharmacist', 'lab_technician', 'receptionist'];
		const canEdit = !!staff && allowedRoles.includes(staff.role);

		const consultationData = await consultationsService.getConsultationById(consultationId);
		
		if (!consultationData) {
			throw redirect(302, '/simklinik/rekam-medis');
		}

		// Only allow editing ongoing consultations
		if (consultationData.consultation.status !== 'ongoing') {
			throw redirect(302, `/simklinik/rekam-medis/${consultationId}`);
		}

		const [vitalSigns, prescriptions] = await Promise.all([
			consultationsService.getVitalSigns(consultationId),
			consultationsService.getPrescriptions(consultationId)
		]);

		const inpatientAdmission = await InpatientService.getActiveAdmissionForPatient(
			consultationData.consultation.patientId
		);

		return {
			consultation: consultationData,
			patient: consultationData.patient,
			staff: consultationData.staff,
			vitalSigns,
			prescriptions,
			appointment: consultationData.appointment,
			inpatientAdmission,
			canEdit
		};
	} catch (error) {
		console.error('Error loading consultation edit:', error);
		throw redirect(302, '/simklinik/rekam-medis');
	}
}) satisfies PageServerLoad;


// Helper function to check if user has permission to edit medical records
async function checkMedicalStaffAccess(locals: App.Locals) {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const medicalStaffService = new MedicalStaffService();
	const staff = await medicalStaffService.getStaffByUserId(locals.user.id);
	
	if (!staff) {
		return { hasAccess: false, staff: null, error: 'Anda tidak terdaftar sebagai tenaga medis' };
	}

	const allowedRoles = ['doctor', 'nurse', 'midwife', 'specialist', 'pharmacist', 'lab_technician', 'receptionist'];
	if (!allowedRoles.includes(staff.role)) {
		return { hasAccess: false, staff: null, error: 'Anda tidak memiliki izin untuk mengedit rekam medis' };
	}

	return { hasAccess: true, staff, error: null };
}

export const actions = {
	updateConsultation: async ({ request, params, locals }) => {
		const accessCheck = await checkMedicalStaffAccess(locals);
		if (!accessCheck.hasAccess) {
			return fail(403, { success: false, message: accessCheck.error });
		}

		const formData = await request.formData();
		const chiefComplaint = formData.get('chiefComplaint') as string;
		const physicalExamination = formData.get('physicalExamination') as string;
		const diagnosis = formData.get('diagnosis') as string;
		const treatment = formData.get('treatment') as string;
		const notes = formData.get('notes') as string;
		
		const consultationsService = new ConsultationsService();
		try {
			await consultationsService.updateConsultation(params.consultationId, {
				chiefComplaint,
				physicalExamination,
				diagnosis,
				treatment,
				notes
			});
			return { success: true, message: 'Catatan SOAP berhasil disimpan' };
		} catch (error) {
			console.error('Error updating consultation:', error);
			return fail(500, { success: false, message: 'Gagal menyimpan catatan SOAP' });
		}
	},
	updateVitals: async ({ request, params, locals }) => {
		const accessCheck = await checkMedicalStaffAccess(locals);
		if (!accessCheck.hasAccess) {
			return fail(403, { success: false, message: accessCheck.error });
		}

		const formData = await request.formData();
		const patientId = formData.get('patientId') as string;
		
		const vitals = {
			systolic: Number(formData.get('systolic')) || undefined,
			diastolic: Number(formData.get('diastolic')) || undefined,
			heartRate: Number(formData.get('heartRate')) || undefined,
			respiratoryRate: Number(formData.get('respiratoryRate')) || undefined,
			temperature: Number(formData.get('temperature')) || undefined,
			oxygenSaturation: Number(formData.get('oxygenSaturation')) || undefined,
			weight: Number(formData.get('weight')) || undefined,
			height: Number(formData.get('height')) || undefined,
		};

		const consultationsService = new ConsultationsService();
		try {
			await consultationsService.recordVitalSigns(params.consultationId, patientId, vitals);
			return { success: true, message: 'Vital signs updated successfully' };
		} catch (error) {
			console.error('Error updating vital signs:', error);
			return fail(500, { success: false, message: 'Failed to update vital signs' });
		}
	},
	addPrescription: async ({ request, params, locals }) => {
		const accessCheck = await checkMedicalStaffAccess(locals);
		if (!accessCheck.hasAccess) {
			return fail(403, { success: false, message: accessCheck.error });
		}

		const formData = await request.formData();
		const patientId = formData.get('patientId') as string;
		
		const prescriptionData = {
			medication: formData.get('medication') as string,
			dosage: formData.get('dosage') as string,
			frequency: formData.get('frequency') as string,
			duration: formData.get('duration') as string,
			instructions: formData.get('instructions') as string,
		};

		const consultationsService = new ConsultationsService();

		try {
			await consultationsService.addPrescription(
				params.consultationId, 
				patientId, 
				accessCheck.staff!.id,
				prescriptionData
			);
			return { success: true, message: 'Prescription added successfully' };
		} catch (error) {
			console.error('Error adding prescription:', error);
			return fail(500, { success: false, message: 'Failed to add prescription' });
		}
	},
	deletePrescription: async ({ request, locals }) => {
		const accessCheck = await checkMedicalStaffAccess(locals);
		if (!accessCheck.hasAccess) {
			return fail(403, { success: false, message: accessCheck.error });
		}

		const formData = await request.formData();
		const id = formData.get('id') as string;

		const consultationsService = new ConsultationsService();
		try {
			await consultationsService.deletePrescription(id);
			return { success: true, message: 'Prescription deleted successfully' };
		} catch (error) {
			console.error('Error deleting prescription:', error);
			return fail(500, { success: false, message: 'Failed to delete prescription' });
		}
	},
	finishConsultation: async ({ request, params, locals }) => {
		const accessCheck = await checkMedicalStaffAccess(locals);
		if (!accessCheck.hasAccess) {
			return fail(403, { success: false, message: accessCheck.error });
		}

		const consultationsService = new ConsultationsService();
		try {
			await consultationsService.endConsultation(params.consultationId, {});
			throw redirect(303, `/simklinik/rekam-medis/${params.consultationId}`);
		} catch (error: any) {
			if (error.status) throw error;
			console.error('Error finishing consultation:', error);
			return fail(500, { success: false, message: 'Failed to finish consultation' });
		}
	}
};
