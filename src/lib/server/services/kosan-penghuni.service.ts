import { randomUUID } from 'crypto';
import { z } from 'zod';

import { eq } from 'drizzle-orm';

import { db } from '$lib/db/client';
import { penghuniKosan, ruanganKosan } from '$lib/db/schema';
import { findCustomerById } from '$lib/server/repositories/customers.repository';
import { findGedungKosanById } from '$lib/server/repositories/kosan-gedung.repository';
import { findRuanganKosanById } from '$lib/server/repositories/kosan-ruangan.repository';
import {
	hasPenghuniAktifUntukPelanggan,
	listPenghuniAktifForLookup,
	listPenghuniKosan,
	findPenghuniKosanById,
	findPenghuniAktifDetailById
} from '$lib/server/repositories/kosan-penghuni.repository';

const registerSchema = z.object({
	pelangganId: z.string().uuid('Pelanggan tidak valid'),
	gedungId: z.string().uuid('Gedung tidak valid'),
	ruanganId: z.string().uuid('Ruangan tidak valid'),
	tanggalMasuk: z.string().min(1, 'Tanggal masuk wajib diisi'),
	catatan: z.string().optional()
});

const updateSchema = registerSchema.partial();

export async function getPenghuniById(id: string) {
	return findPenghuniKosanById(id);
}

export async function listPenghuni(filter: { status?: 'aktif' | 'keluar'; search?: string } = {}) {
	const rows = await listPenghuniKosan(filter);
	return rows.map((row) => ({
		...row,
		hargaBulanan: Number(row.hargaBulanan ?? 0)
	}));
}

export async function registerPenghuni(payload: Record<string, unknown>) {
	const parsed = registerSchema.safeParse(payload);
	if (!parsed.success) {
		return { success: false, errors: parsed.error.flatten().fieldErrors } as const;
	}

	const [pelanggan, gedung, ruangan, pelangganAktif] = await Promise.all([
		findCustomerById(parsed.data.pelangganId),
		findGedungKosanById(parsed.data.gedungId),
		findRuanganKosanById(parsed.data.ruanganId),
		hasPenghuniAktifUntukPelanggan(parsed.data.pelangganId)
	]);

	if (!pelanggan) {
		return { success: false, errors: { pelangganId: ['Pelanggan tidak ditemukan'] } } as const;
	}
	if (!gedung) {
		return { success: false, errors: { gedungId: ['Gedung tidak ditemukan'] } } as const;
	}
	if (!ruangan) {
		return { success: false, errors: { ruanganId: ['Ruangan tidak ditemukan'] } } as const;
	}
	if (ruangan.gedungId !== parsed.data.gedungId) {
		return { success: false, errors: { ruanganId: ['Ruangan tidak berada pada gedung yang dipilih'] } } as const;
	}
	if (ruangan.status !== 'kosong') {
		return { success: false, errors: { ruanganId: ['Ruangan sudah terisi'] } } as const;
	}
	if (pelangganAktif) {
		return { success: false, errors: { pelangganId: ['Pelanggan masih memiliki status penghuni aktif'] } } as const;
	}

	const tanggalMasukDate = new Date(parsed.data.tanggalMasuk);
	if (Number.isNaN(tanggalMasukDate.getTime())) {
		return { success: false, errors: { tanggalMasuk: ['Tanggal masuk tidak valid'] } } as const;
	}
	const tanggalMasuk = tanggalMasukDate.toISOString().slice(0, 10);

	await db.transaction(async (tx) => {
		await tx.insert(penghuniKosan).values({
			id: randomUUID(),
			pelangganId: parsed.data.pelangganId,
			gedungId: parsed.data.gedungId,
			ruanganId: parsed.data.ruanganId,
			tanggalMasuk,
			catatan: parsed.data.catatan ?? null,
			status: 'aktif'
		});

		await tx
			.update(ruanganKosan)
			.set({ status: 'terisi', updatedAt: new Date() })
			.where(eq(ruanganKosan.id, parsed.data.ruanganId));
	});

	return { success: true } as const;
}

export async function updatePenghuniById(id: string, payload: Record<string, unknown>) {
	const parsed = updateSchema.safeParse(payload);
	if (!parsed.success) {
		return { success: false, errors: parsed.error.flatten().fieldErrors } as const;
	}

	const existing = await findPenghuniKosanById(id);
	if (!existing) {
		return { success: false, notFound: true } as const;
	}

	let targetGedung = existing.gedungId;
	let targetRuangan = existing.ruanganId;

	if (parsed.data.gedungId) {
		const gedung = await findGedungKosanById(parsed.data.gedungId);
		if (!gedung) {
			return { success: false, errors: { gedungId: ['Gedung tidak ditemukan'] } } as const;
		}
		targetGedung = parsed.data.gedungId;
	}

	if (parsed.data.ruanganId) {
		const ruangan = await findRuanganKosanById(parsed.data.ruanganId);
		if (!ruangan) {
			return { success: false, errors: { ruanganId: ['Ruangan tidak ditemukan'] } } as const;
		}
		if (ruangan.status !== 'kosong' && ruangan.id !== existing.ruanganId) {
			return { success: false, errors: { ruanganId: ['Ruangan sudah terisi'] } } as const;
		}
		if (parsed.data.gedungId && ruangan.gedungId !== parsed.data.gedungId) {
			return { success: false, errors: { ruanganId: ['Ruangan tidak berada pada gedung yang dipilih'] } } as const;
		}
		if (!parsed.data.gedungId && ruangan.gedungId !== targetGedung) {
			return { success: false, errors: { ruanganId: ['Ruangan tidak berada pada gedung yang dipilih'] } } as const;
		}
		targetRuangan = parsed.data.ruanganId;
	}

	const tanggalMasukRaw = parsed.data.tanggalMasuk ?? existing.tanggalMasuk;
	const tanggalMasukDate = tanggalMasukRaw ? new Date(tanggalMasukRaw) : null;
	if (!tanggalMasukDate || Number.isNaN(tanggalMasukDate.getTime())) {
		return { success: false, errors: { tanggalMasuk: ['Tanggal masuk tidak valid'] } } as const;
	}
	const tanggalMasukValue = tanggalMasukDate.toISOString().slice(0, 10);

	await db.transaction(async (tx) => {
		const timestamp = new Date();
		if (targetRuangan !== existing.ruanganId) {
			await tx
				.update(ruanganKosan)
				.set({ status: 'kosong', updatedAt: timestamp })
				.where(eq(ruanganKosan.id, existing.ruanganId));

			await tx
				.update(ruanganKosan)
				.set({ status: 'terisi', updatedAt: timestamp })
				.where(eq(ruanganKosan.id, targetRuangan));
		}

		await tx
			.update(penghuniKosan)
			.set({
				gedungId: targetGedung,
				ruanganId: targetRuangan,
				tanggalMasuk: tanggalMasukValue,
				catatan: parsed.data.catatan ?? existing.catatan,
				updatedAt: timestamp
			})
			.where(eq(penghuniKosan.id, id));
	});

	return { success: true } as const;
}

export async function keluarkanPenghuni(id: string) {
	const existing = await findPenghuniKosanById(id);
	if (!existing) {
		return { success: false, notFound: true } as const;
	}

	if (existing.status !== 'aktif') {
		return { success: false, errors: { root: ['Penghuni sudah tidak aktif'] } } as const;
	}

	const today = new Date();

	await db.transaction(async (tx) => {
		await tx
			.update(penghuniKosan)
			.set({
				status: 'keluar',
				tanggalKeluar: today.toISOString().slice(0, 10),
				updatedAt: today
			})
			.where(eq(penghuniKosan.id, id));

		await tx
			.update(ruanganKosan)
			.set({ status: 'kosong', updatedAt: today })
			.where(eq(ruanganKosan.id, existing.ruanganId));
	});

	return { success: true } as const;
}

export async function listPenghuniAktifLookup(search?: string) {
	const rows = await listPenghuniAktifForLookup(search);
	return rows.map((row) => ({
		id: row.id,
		pelangganId: row.pelangganId,
		pelangganNama: row.pelangganNama,
		pelangganKontak: row.pelangganPhone ?? row.pelangganEmail ?? null,
		gedungId: row.gedungId,
		gedungNama: row.gedungNama,
		ruanganId: row.ruanganId,
		ruanganNama: row.ruanganNama,
		hargaBulanan: Number(row.hargaBulanan ?? 0),
		tanggalMasuk: String(row.tanggalMasuk)
	}));
}

export async function getPenghuniAktifDetail(id: string) {
	return findPenghuniAktifDetailById(id);
}
