import { z } from 'zod';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { PasienService } from '$lib/server/services/simklinik/pasien.service';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = (async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const pasienService = new PasienService();
	const search = url.searchParams.get('search') || '';
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = 20;

	try {
		const patients = await pasienService.getAllPatients(search, page, limit);
		const total = await pasienService.getPatientCount(search);
		const totalPages = Math.ceil(total / limit);

		return {
			patients,
			total,
			page,
			totalPages,
			search
		};
	} catch (error) {
		console.error('Error loading patients:', error);
		return {
			patients: [],
			total: 0,
			page: 1,
			totalPages: 1,
			search
		};
	}
}) satisfies PageServerLoad;
