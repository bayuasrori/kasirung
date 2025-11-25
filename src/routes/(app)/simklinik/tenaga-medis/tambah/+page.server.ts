import { fail, redirect } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms/server';
import type { Actions, PageServerLoad } from './$types';
import { MedicalStaffService } from '$lib/server/services/simklinik/medical-staff.service';
import { medicalStaffCreateSchema } from '$lib/validations/simklinik/medical-staff';
import type { MedicalStaffCreateInput } from '$lib/validations/simklinik/medical-staff';
import { zod4 } from 'sveltekit-superforms/adapters';

const createValidation = zod4(medicalStaffCreateSchema);

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const form = await superValidate<MedicalStaffCreateInput>(createValidation);
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const form = await superValidate<MedicalStaffCreateInput>(request, createValidation);

		if (!form.valid) {
			return fail(400, { form });
		}

		const medicalStaffService = new MedicalStaffService();

		try {
			const staff = await medicalStaffService.createStaff({
				nip: form.data.nip.trim(),
				name: form.data.name.trim(),
				specialization: form.data.specialization?.trim() || null,
				phone: form.data.phone?.trim() || null,
				email: form.data.email?.trim() || null,
				role: form.data.role,
				isActive: form.data.isActive
			});

			throw redirect(
				303,
				`/simklinik/tenaga-medis?success=true&message=${encodeURIComponent(
					`Tenaga medis ${staff.name} berhasil ditambahkan`
				)}`
			);
		} catch (error) {
			console.error('Error creating medical staff:', error);
			const errorMessage =
				error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan data tenaga medis';
			return message(form, errorMessage, { status: 500 });
		}
	}
};
