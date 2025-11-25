import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PasienService } from '$lib/server/services/simklinik/pasien.service';

export const GET: RequestHandler = async ({ url }) => {
	const search = url.searchParams.get('search') || '';
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '20');

	try {
		const pasienService = new PasienService();
		const patients = await pasienService.getAllPatients(search, page, limit);
		const total = await pasienService.getPatientCount(search);

		return json({
			success: true,
			data: patients,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit)
			}
		});
	} catch (error) {
		console.error('Error fetching patients:', error);
		return json({
			success: false,
			error: error instanceof Error ? error.message : 'Failed to fetch patients'
		}, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const pasienService = new PasienService();
		
		const patient = await pasienService.createPatient(body);

		return json({
			success: true,
			data: patient,
			message: 'Patient created successfully'
		});
	} catch (error) {
		console.error('Error creating patient:', error);
		return json({
			success: false,
			error: error instanceof Error ? error.message : 'Failed to create patient'
		}, { status: 400 });
	}
};
