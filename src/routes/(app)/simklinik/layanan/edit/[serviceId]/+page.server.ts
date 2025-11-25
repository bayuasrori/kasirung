import { fail, redirect, error } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms/server';
import type { Actions, PageServerLoad } from './$types';
import { MedicalServicesService } from '$lib/server/services/simklinik/medical-services.service';
import { medicalServiceFormSchema, type MedicalServiceFormInput } from '$lib/validations/simklinik/medical-service';
import { zod4 } from 'sveltekit-superforms/adapters';

const formValidation = zod4(medicalServiceFormSchema);

export const load = (async ({ locals, params }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const serviceId = params.serviceId;

	if (!serviceId) {
		throw error(404, 'Layanan tidak ditemukan');
	}

	const medicalServicesService = new MedicalServicesService();
	const service = await medicalServicesService.getServiceById(serviceId);

	if (!service) {
		throw error(404, 'Layanan tidak ditemukan');
	}

	const [categories, form] = await Promise.all([
		medicalServicesService.getAllCategories(),
		superValidate<MedicalServiceFormInput>(
			{
				code: service.code,
				name: service.name,
				categoryId: service.categoryId ?? '',
				price: service.price ?? '',
				duration: service.duration?.toString() ?? '',
				description: service.description ?? '',
				isActive: service.isActive
			},
			formValidation
		)
	]);

	return {
		service,
		categories,
		form
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const serviceId = params.serviceId;

		if (!serviceId) {
			throw error(400, 'ID layanan tidak valid');
		}

		const form = await superValidate<MedicalServiceFormInput>(request, formValidation);

		if (!form.valid) {
			return fail(400, { form });
		}

		const medicalServicesService = new MedicalServicesService();

		try {
			const priceValue = form.data.price?.trim();
			const durationValue = form.data.duration?.trim();

			await medicalServicesService.updateService(serviceId, {
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
					'Layanan berhasil diperbarui'
				)}`
			);
		} catch (err) {
			console.error('Error updating medical service:', err);
			const errorMessage =
				err instanceof Error ? err.message : 'Terjadi kesalahan saat memperbarui layanan';
			return message(form, errorMessage, { status: 500 });
		}
	}
};
