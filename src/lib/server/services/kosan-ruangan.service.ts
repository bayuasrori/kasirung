import { randomUUID } from 'crypto';
import { z } from 'zod';

import { findGedungKosanById } from '$lib/server/repositories/kosan-gedung.repository';
import {
	deleteRuanganKosan,
	findRuanganKosanById,
	findRuanganKosong,
	hasPenghuniAktif,
	insertRuanganKosan,
	listRuanganKosan,
	markRuanganStatus,
	updateRuanganKosan
} from '$lib/server/repositories/kosan-ruangan.repository';
import { ruanganKosan } from '$lib/db/schema';

const ruanganSchema = z.object({
	gedungId: z.string().uuid('Gedung tidak valid'),
	namaRuangan: z.string().min(1, 'Nama ruangan wajib diisi'),
	kapasitas: z.coerce.number().min(1, 'Kapasitas minimal 1'),
	hargaBulanan: z.coerce.number().min(0, 'Harga bulanan tidak boleh negatif'),
	lantai: z.string().optional()
});

export async function listRuanganKosanWithGedung(filter: { gedungId?: string | null; status?: 'kosong' | 'terisi' } = {}) {
	const rows = await listRuanganKosan(filter);
	return rows.map((row) => ({
		...row,
		kapasitas: Number(row.kapasitas ?? 0),
		hargaBulanan: Number(row.hargaBulanan ?? 0),
		penghuniAktif: Number(row.penghuniAktif ?? 0)
	}));
}

export async function createRuanganKosan(payload: Record<string, unknown>) {
	const parsed = ruanganSchema.safeParse(payload);
	if (!parsed.success) {
		return { success: false, errors: parsed.error.flatten().fieldErrors } as const;
	}

	const gedung = await findGedungKosanById(parsed.data.gedungId);
	if (!gedung) {
		return { success: false, errors: { gedungId: ['Gedung tidak ditemukan'] } } as const;
	}

	const newRoom: typeof ruanganKosan.$inferInsert = {
		id: randomUUID(),
		gedungId: parsed.data.gedungId,
		namaRuangan: parsed.data.namaRuangan,
		kapasitas: parsed.data.kapasitas,
		hargaBulanan: parsed.data.hargaBulanan.toString(),
		status: 'kosong',
		lantai: parsed.data.lantai ?? null,
		createdAt: new Date(),
		updatedAt: new Date()
	};

	await insertRuanganKosan(newRoom);

	return { success: true } as const;
}

export async function updateRuanganKosanById(id: string, payload: Record<string, unknown>) {
	const parsed = ruanganSchema.partial().safeParse(payload);
	if (!parsed.success) {
		return { success: false, errors: parsed.error.flatten().fieldErrors } as const;
	}

	const existing = await findRuanganKosanById(id);
	if (!existing) {
		return { success: false, notFound: true } as const;
	}

	if (parsed.data.gedungId) {
		const gedung = await findGedungKosanById(parsed.data.gedungId);
		if (!gedung) {
			return { success: false, errors: { gedungId: ['Gedung tidak ditemukan'] } } as const;
		}
	}

	const updatePayload: Partial<typeof ruanganKosan.$inferInsert> = {
		gedungId: parsed.data.gedungId ?? existing.gedungId,
		namaRuangan: parsed.data.namaRuangan ?? existing.namaRuangan,
		kapasitas: parsed.data.kapasitas ?? existing.kapasitas,
		hargaBulanan:
			parsed.data.hargaBulanan !== undefined
				? parsed.data.hargaBulanan.toString()
				: existing.hargaBulanan ?? '0',
		lantai: parsed.data.lantai ?? existing.lantai ?? null,
		updatedAt: new Date()
	};

	await updateRuanganKosan(id, updatePayload);

	return { success: true } as const;
}

export async function deleteRuanganKosanById(id: string) {
	const existing = await findRuanganKosanById(id);
	if (!existing) {
		return { success: false, notFound: true } as const;
	}

	const hasActive = await hasPenghuniAktif(id);
	if (hasActive) {
		return { success: false, notAllowed: true, message: 'Tidak dapat menghapus ruangan dengan penghuni aktif' } as const;
	}

	await deleteRuanganKosan(id);
	return { success: true } as const;
}

export async function listRuanganKosong(gedungId?: string | null) {
	const rows = await findRuanganKosong(gedungId ?? null);
	return rows.map((row) => ({
		...row,
		lantai: row.lantai ?? null,
		hargaBulanan: Number(row.hargaBulanan ?? 0)
	}));
}

export async function setRuanganStatus(id: string, status: 'kosong' | 'terisi') {
	await markRuanganStatus(id, status);
}

export async function getRuanganKosanById(id: string) {
	return findRuanganKosanById(id);
}
