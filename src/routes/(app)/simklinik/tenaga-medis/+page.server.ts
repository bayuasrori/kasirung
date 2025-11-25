import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { MedicalStaffService } from '$lib/server/services/simklinik/medical-staff.service';

export const load = (async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const medicalStaffService = new MedicalStaffService();
	const search = url.searchParams.get('search') || '';
	const role = url.searchParams.get('role') || '';
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = 20;

	try {
		const staff = await medicalStaffService.getAllStaff(search, role, page, limit);
		const total = await medicalStaffService.getStaffCount(search, role);
		const totalPages = Math.ceil(total / limit);

		return {
			staff,
			total,
			page,
			totalPages,
			search,
			role
		};
	} catch (error) {
		console.error('Error loading medical staff:', error);
		return {
			staff: [],
			total: 0,
			page: 1,
			totalPages: 1,
			search,
			role
		};
	}
}) satisfies PageServerLoad;

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const formData = await request.formData();
		const staffId = formData.get('staffId');

		if (!staffId || typeof staffId !== 'string') {
			throw redirect(
				303,
				`/simklinik/tenaga-medis?success=false&message=${encodeURIComponent('Tenaga medis tidak valid')}`
			);
		}

		const medicalStaffService = new MedicalStaffService();

		try {
			const staff = await medicalStaffService.getStaffById(staffId);

			if (!staff) {
				throw redirect(
					303,
					`/simklinik/tenaga-medis?success=false&message=${encodeURIComponent(
						'Tenaga medis tidak ditemukan'
					)}`
				);
			}

			await medicalStaffService.deleteStaff(staffId);

			throw redirect(
				303,
				`/simklinik/tenaga-medis?success=true&message=${encodeURIComponent(
					`Tenaga medis ${staff.name} berhasil dihapus`
				)}`
			);
		} catch (error) {
			console.error('Error deleting medical staff:', error);
			throw redirect(
				303,
				`/simklinik/tenaga-medis?success=false&message=${encodeURIComponent(
					error instanceof Error ? error.message : 'Gagal menghapus tenaga medis'
				)}`
			);
		}
	}
};
