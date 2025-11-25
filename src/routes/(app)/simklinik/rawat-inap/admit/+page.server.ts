import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { InpatientService } from '$lib/server/services/simklinik/inpatient.service';
import { db } from '$lib/server/db';
import { patients } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

const admitSchema = z.object({
	patientId: z.string().min(1, 'Pasien harus dipilih'),
	bedId: z.string().min(1, 'Bed harus dipilih'),
	diagnosis: z.string().optional(),
	notes: z.string().optional()
});

export const load: PageServerLoad = async () => {
	const [availableBeds, patientList] = await Promise.all([
		InpatientService.getAvailableBeds(),
		db.query.patients.findMany({
			where: eq(patients.status, 'aktif'),
			orderBy: [desc(patients.createdAt)],
			limit: 50
		})
	]);

	return {
		availableBeds,
		patientList
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData);

		const result = admitSchema.safeParse(data);

		if (!result.success) {
			return fail(400, {
				data,
				errors: result.error.flatten().fieldErrors
			});
		}

		try {
			await InpatientService.admitPatient({
				patientId: result.data.patientId,
				bedId: result.data.bedId,
				diagnosis: result.data.diagnosis || null,
				notes: result.data.notes || null,
				admittedBy: locals.user?.id,
				status: 'admitted'
			});
		} catch (err) {
			console.error('Error admitting patient:', err);
			return fail(500, {
				message: 'Gagal mendaftarkan pasien rawat inap'
			});
		}

		throw redirect(303, '/simklinik/rawat-inap');
	}
};
