import { randomUUID } from 'crypto';
import { z } from 'zod';

import {
	countPenghuniAktifByGedung,
	countRuanganByGedung,
	deleteGedungKosan,
	findGedungKosanById,
	insertGedungKosan,
	listGedungKosanWithStats,
	updateGedungKosan
} from '$lib/server/repositories/kosan-gedung.repository';

const gedungSchema = z.object({
	namaGedung: z.string().min(2, 'Nama gedung minimal 2 karakter'),
	alamat: z.string().min(5, 'Alamat wajib diisi'),
	keterangan: z.string().optional()
});

export async function listGedungKosan() {
	const rows = await listGedungKosanWithStats();
	return rows.map((row) => ({
		...row,
		totalRuangan: Number(row.totalRuangan ?? 0),
		ruanganKosong: Number(row.ruanganKosong ?? 0),
		penghuniAktif: Number(row.penghuniAktif ?? 0)
	}));
}

export async function getGedungKosanById(id: string) {
	return findGedungKosanById(id);
}

export async function createGedungKosan(payload: Record<string, unknown>) {
	const parsed = gedungSchema.safeParse(payload);
	if (!parsed.success) {
		return { success: false, errors: parsed.error.flatten().fieldErrors } as const;
	}

	await insertGedungKosan({
		id: randomUUID(),
		namaGedung: parsed.data.namaGedung,
		alamat: parsed.data.alamat,
		keterangan: parsed.data.keterangan ?? null
	});

	return { success: true } as const;
}

export async function updateGedungKosanById(id: string, payload: Record<string, unknown>) {
	const parsed = gedungSchema.partial().safeParse(payload);
	if (!parsed.success) {
		return { success: false, errors: parsed.error.flatten().fieldErrors } as const;
	}

	const existing = await findGedungKosanById(id);
	if (!existing) {
		return { success: false, notFound: true } as const;
	}

	await updateGedungKosan(id, {
		namaGedung: parsed.data.namaGedung ?? existing.namaGedung,
		alamat: parsed.data.alamat ?? existing.alamat,
		keterangan: parsed.data.keterangan ?? existing.keterangan,
		updatedAt: new Date()
	});

	return { success: true } as const;
}

export async function deleteGedungKosanById(id: string) {
	const existing = await findGedungKosanById(id);
	if (!existing) {
		return { success: false, notFound: true } as const;
	}

	const [ruanganCount, penghuniAktif] = await Promise.all([
		countRuanganByGedung(id),
		countPenghuniAktifByGedung(id)
	]);

	if (ruanganCount > 0 || penghuniAktif > 0) {
		return {
			success: false,
			notAllowed: true,
			message: 'Tidak dapat menghapus gedung dengan ruangan atau penghuni aktif'
		} as const;
	}

	await deleteGedungKosan(id);
	return { success: true } as const;
}
