import { fail, redirect, error } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms/server';
import type { Actions, PageServerLoad } from './$types';
import { MedicalStaffService } from '$lib/server/services/simklinik/medical-staff.service';
import { medicalStaffUpdateSchema } from '$lib/validations/simklinik/medical-staff';
import type { MedicalStaffUpdateInput } from '$lib/validations/simklinik/medical-staff';
import { zod4 } from 'sveltekit-superforms/adapters';

const updateValidation = zod4(medicalStaffUpdateSchema);

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const staffId = params.staffId;

	if (!staffId) {
		throw error(404, 'Tenaga medis tidak ditemukan');
	}

	const medicalStaffService = new MedicalStaffService();
	const staff = await medicalStaffService.getStaffById(staffId);

	if (!staff) {
		throw error(404, 'Tenaga medis tidak ditemukan');
	}

	const form = await superValidate<MedicalStaffUpdateInput>(
		{
			nip: staff.nip,
			name: staff.name,
			email: staff.email ?? '',
			phone: staff.phone ?? '',
			role: staff.role,
			specialization: staff.specialization ?? '',
			isActive: staff.isActive
		},
		updateValidation
	);

	return {
		staff,
		form
	};
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const staffId = params.staffId;

		if (!staffId) {
			throw error(400, 'ID tenaga medis tidak valid');
		}

		const form = await superValidate<MedicalStaffUpdateInput>(request, updateValidation);

		if (!form.valid) {
			return fail(400, { form });
		}

		const medicalStaffService = new MedicalStaffService();

		try {
			const staff = await medicalStaffService.updateStaff(staffId, {
				nip: form.data.nip.trim(),
				name: form.data.name.trim(),
				email: form.data.email?.trim() || null,
				phone: form.data.phone?.trim() || null,
				role: form.data.role,
				specialization: form.data.specialization?.trim() || null,
				isActive: form.data.isActive
			});

			throw redirect(
				303,
				`/simklinik/tenaga-medis?success=true&message=${encodeURIComponent(
					`Tenaga medis ${staff.name} berhasil diperbarui`
				)}`
			);
		} catch (err) {
			console.error('Error updating medical staff:', err);
			const errMessage =
				err instanceof Error ? err.message : 'Terjadi kesalahan saat memperbarui data tenaga medis';
			return message(form, errMessage, { status: 500 });
		}
	}
};
