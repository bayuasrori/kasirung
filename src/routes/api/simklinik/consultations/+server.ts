import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ConsultationsService } from '$lib/server/services/simklinik/consultations.service';

export const GET: RequestHandler = async ({ url }) => {
	const patientId = url.searchParams.get('patientId');
	const staffId = url.searchParams.get('staffId');
	const status = url.searchParams.get('status');
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '20');

	try {
		const consultationsService = new ConsultationsService();
		
		const filters: any = {};
		if (patientId) filters.patientId = patientId;
		if (staffId) filters.staffId = staffId;
		if (status) filters.status = status;

		const consultations = await consultationsService.getAllConsultations(filters, page, limit);
		const total = await consultationsService.getConsultationCount(filters);

		return json({
			success: true,
			data: consultations,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit)
			}
		});
	} catch (error) {
		console.error('Error fetching consultations:', error);
		return json({
			success: false,
			error: error instanceof Error ? error.message : 'Failed to fetch consultations'
		}, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const consultationsService = new ConsultationsService();
		
		// Handle starting a consultation
		if ((body.appointmentId || body.admissionId) && body.staffId && body.patientId) {
			const consultation = await consultationsService.startConsultation({
				appointmentId: body.appointmentId,
				admissionId: body.admissionId,
				staffId: body.staffId,
				patientId: body.patientId
			});

			return json({
				success: true,
				data: consultation,
				message: 'Consultation started successfully'
			});
		}
		
		// Handle recording vital signs
		if (body.consultationId && body.patientId && body.vitalSigns) {
			const vitalSigns = await consultationsService.recordVitalSigns(
				body.consultationId,
				body.patientId,
				body.vitalSigns
			);

			return json({
				success: true,
				data: vitalSigns,
				message: 'Vital signs recorded successfully'
			});
		}

		// Handle adding prescriptions
		if (body.consultationId && body.patientId && body.staffId && body.medication) {
			const prescription = await consultationsService.addPrescription(
				body.consultationId,
				body.patientId,
				body.staffId,
				body
			);

			return json({
				success: true,
				data: prescription,
				message: 'Prescription added successfully'
			});
		}

		return json({
			success: false,
			error: 'Invalid request'
		}, { status: 400 });

	} catch (error) {
		console.error('Error in consultation request:', error);
		return json({
			success: false,
			error: error instanceof Error ? error.message : 'Failed to process consultation request'
		}, { status: 400 });
	}
};
