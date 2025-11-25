import { fail, redirect } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms/server';
import type { Actions, PageServerLoad } from './$types';
import { zod4 } from 'sveltekit-superforms/adapters';
import { medicalServiceFormSchema, type MedicalServiceFormInput } from '$lib/validations/simklinik/medical-service';
import { MedicalServicesService } from '$lib/server/services/simklinik/medical-services.service';

const formValidation = zod4(medicalServiceFormSchema);

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const medicalServicesService = new MedicalServicesService();
	const [categories, form] = await Promise.all([
		medicalServicesService.getAllCategories(),
		superValidate<MedicalServiceFormInput>(formValidation)
	]);

	return { form, categories };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const form = await superValidate<MedicalServiceFormInput>(request, formValidation);

		if (!form.valid) {
			return fail(400, { form });
		}

		const medicalServicesService = new MedicalServicesService();

		try {
			const priceValue = form.data.price?.trim();
			const durationValue = form.data.duration?.trim();

			await medicalServicesService.createService({
				code: form.data.code.trim(),
				name: form.data.name.trim(),
				categoryId: form.data.categoryId?.trim() || null,
				description: form.data.description?.trim() || undefined,
				price: priceValue ? priceValue : undefined,
				duration: durationValue ? Number(durationValue) : undefined,
				isActive: form.data.isActive
			});

			throw redirect(
				303,
				`/simklinik/layanan?success=true&message=${encodeURIComponent(
					'Layanan berhasil ditambahkan'
				)}`
			);
		} catch (error) {
			console.error('Error creating medical service:', error);
			const errorMessage =
				error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan data layanan';
			return message(form, errorMessage, { status: 500 });
		}
	}
};
