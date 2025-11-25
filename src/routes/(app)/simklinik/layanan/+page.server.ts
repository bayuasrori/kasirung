import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { MedicalServicesService } from '$lib/server/services/simklinik/medical-services.service';

const DEFAULT_LIMIT = 20;

export const load = (async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const search = url.searchParams.get('search') ?? '';
	const categoryId = url.searchParams.get('category') ?? '';
	const page = parseInt(url.searchParams.get('page') ?? '1', 10) || 1;

	const medicalServicesService = new MedicalServicesService();

	try {
		const [services, total, categories] = await Promise.all([
			medicalServicesService.getAllServices(
				search || undefined,
				categoryId || undefined,
				page,
				DEFAULT_LIMIT
			),
			medicalServicesService.getServiceCount(search || undefined, categoryId || undefined),
			medicalServicesService.getAllCategories()
		]);

		const totalPages = Math.max(1, Math.ceil(total / DEFAULT_LIMIT));

		return {
			services,
			total,
			page,
			totalPages,
			search,
			categoryId,
			categories
		};
	} catch (error) {
		console.error('Error loading medical services:', error);
		return {
			services: [],
			total: 0,
			page: 1,
			totalPages: 1,
			search,
			categoryId,
			categories: []
		};
	}
}) satisfies PageServerLoad;

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const formData = await request.formData();
		const serviceId = formData.get('serviceId');

		if (!serviceId || typeof serviceId !== 'string') {
			throw redirect(
				303,
				`/simklinik/layanan?success=false&message=${encodeURIComponent('Layanan tidak valid')}`
			);
		}

		const medicalServicesService = new MedicalServicesService();

		try {
			const service = await medicalServicesService.getServiceById(serviceId);

			if (!service) {
				throw redirect(
					303,
					`/simklinik/layanan?success=false&message=${encodeURIComponent('Layanan tidak ditemukan')}`
				);
			}

			await medicalServicesService.deleteService(serviceId);

			throw redirect(
				303,
				`/simklinik/layanan?success=true&message=${encodeURIComponent(
					`Layanan ${service.name} berhasil dihapus`
				)}`
			);
		} catch (error) {
			console.error('Error deleting medical service:', error);
			throw redirect(
				303,
				`/simklinik/layanan?success=false&message=${encodeURIComponent(
					error instanceof Error ? error.message : 'Gagal menghapus layanan'
				)}`
			);
		}
	}
};
