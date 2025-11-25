import { InpatientService } from '$lib/server/services/simklinik/inpatient.service';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';

const roomSchema = z.object({
	id: z.string().uuid().optional(),
	name: z.string().min(1, 'Nama ruangan wajib diisi'),
	type: z.string().min(1, 'Tipe ruangan wajib diisi'),
	rate: z.coerce.number().min(0),
	description: z.string().optional()
});

const bedSchema = z.object({
	id: z.string().uuid().optional(),
	roomId: z.string().min(1, 'Ruangan wajib dipilih'),
	bedNumber: z.string().min(1, 'Nomor bed wajib diisi'),
	status: z.enum(['available', 'occupied', 'maintenance', 'cleaning']).default('available'),
	notes: z.string().optional()
});

export const load: PageServerLoad = async () => {
	const rooms = await InpatientService.getRooms();
	const activeAdmissions = await InpatientService.getActiveAdmissions();

	return {
		rooms,
		activeAdmissions
	};
};

export const actions: Actions = {
	discharge: async ({ request, locals }) => {
		const formData = Object.fromEntries(await request.formData());
		const admissionId = formData.id?.toString();
		const notes = formData.notes?.toString();
		if (!admissionId) {
			return fail(400, { message: 'ID admission wajib diisi' });
		}
		const userId = locals.user?.id;
		if (!userId) {
			return fail(403, { message: 'User belum login' });
		}
		try {
			await InpatientService.dischargePatient(admissionId, userId, notes || undefined);
			return { success: true };
		} catch (error) {
			console.error('Error discharging patient', error);
			return fail(500, { message: 'Gagal melakukan discharge pasien' });
		}
	},
	createRoom: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData());
		const parsed = roomSchema.safeParse(formData);

		if (!parsed.success) {
			return fail(400, { errors: parsed.error.flatten().fieldErrors });
		}

		await InpatientService.createRoom({
			name: parsed.data.name,
			type: parsed.data.type,
			rate: parsed.data.rate.toString(),
			description: parsed.data.description || null
		});

		return { success: true };
	},
	updateRoom: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData());
		const parsed = roomSchema.required({ id: true }).safeParse(formData);

		if (!parsed.success) {
			return fail(400, { errors: parsed.error.flatten().fieldErrors });
		}

		await InpatientService.updateRoom(parsed.data.id, {
			name: parsed.data.name,
			type: parsed.data.type,
			rate: parsed.data.rate.toString(),
			description: parsed.data.description || null
		});

		return { success: true };
	},
	deleteRoom: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData());
		const id = formData.id?.toString();

		if (!id) {
			return fail(400, { message: 'ID ruangan wajib diisi' });
		}

		await InpatientService.deleteRoom(id);
		return { success: true };
	},
	addBed: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData());
		const parsed = bedSchema.safeParse(formData);

		if (!parsed.success) {
			return fail(400, { errors: parsed.error.flatten().fieldErrors });
		}

		await InpatientService.addBed({
			roomId: parsed.data.roomId,
			bedNumber: parsed.data.bedNumber,
			status: parsed.data.status,
			notes: parsed.data.notes || null
		});

		return { success: true };
	},
	updateBed: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData());
		const parsed = bedSchema.required({ id: true }).safeParse(formData);

		if (!parsed.success) {
			return fail(400, { errors: parsed.error.flatten().fieldErrors });
		}

		await InpatientService.updateBed(parsed.data.id, {
			roomId: parsed.data.roomId,
			bedNumber: parsed.data.bedNumber,
			status: parsed.data.status,
			notes: parsed.data.notes || null
		});

		return { success: true };
	},
	deleteBed: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData());
		const id = formData.id?.toString();

		if (!id) {
			return fail(400, { message: 'ID bed wajib diisi' });
		}

		await InpatientService.deleteBed(id);
		return { success: true };
	}
};
