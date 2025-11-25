import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { MedicalStaffService } from '$lib/server/services/simklinik/medical-staff.service';

export const GET: RequestHandler = async ({ url }) => {
	const search = url.searchParams.get('search') || '';
	const role = url.searchParams.get('role') || '';
	const page = parseInt(url.searchParams.get('page') || '1', 10) || 1;
	const limit = parseInt(url.searchParams.get('limit') || '20', 10) || 20;

	try {
		const medicalStaffService = new MedicalStaffService();
		const staff = await medicalStaffService.getAllStaff(search, role, page, limit);
		const total = await medicalStaffService.getStaffCount(search, role);

		return json({
			success: true,
			data: staff,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit)
			}
		});
	} catch (error) {
		console.error('Error fetching medical staff:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Failed to fetch medical staff'
			},
			{ status: 500 }
		);
	}
};
