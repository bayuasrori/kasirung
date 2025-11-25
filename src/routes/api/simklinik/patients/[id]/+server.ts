import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PasienService } from '$lib/server/services/simklinik/pasien.service';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const pasienService = new PasienService();
		const patient = await pasienService.getPatientById(params.id);

		if (!patient) {
			return json({
				success: false,
				error: 'Patient not found'
			}, { status: 404 });
		}

		return json({
			success: true,
			data: patient
		});
	} catch (error) {
		console.error('Error fetching patient:', error);
		return json({
			success: false,
			error: error instanceof Error ? error.message : 'Failed to fetch patient'
		}, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const body = await request.json();
		const pasienService = new PasienService();
		
		const patient = await pasienService.updatePatient(params.id, body);

		return json({
			success: true,
			data: patient,
			message: 'Patient updated successfully'
		});
	} catch (error) {
		console.error('Error updating patient:', error);
		return json({
			success: false,
			error: error instanceof Error ? error.message : 'Failed to update patient'
		}, { status: 400 });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const pasienService = new PasienService();
		await pasienService.deletePatient(params.id);

		return json({
			success: true,
			message: 'Patient deleted successfully'
		});
	} catch (error) {
		console.error('Error deleting patient:', error);
		return json({
			success: false,
			error: error instanceof Error ? error.message : 'Failed to delete patient'
		}, { status: 400 });
	}
};
