import { and, asc, eq, sql } from 'drizzle-orm';

import { db } from '$lib/db/client';
import { gedungKosan, ruanganKosan, penghuniKosan } from '$lib/db/schema';

interface ListRuanganParams {
	gedungId?: string | null;
	status?: 'kosong' | 'terisi';
}

export async function listRuanganKosan(params: ListRuanganParams = {}) {
	const { gedungId, status } = params;
	let whereClause: any;
	if (gedungId && status) {
		whereClause = and(eq(ruanganKosan.gedungId, gedungId), eq(ruanganKosan.status, status));
	} else if (gedungId) {
		whereClause = eq(ruanganKosan.gedungId, gedungId);
	} else if (status) {
		whereClause = eq(ruanganKosan.status, status);
	}

	return db
		.select({
			id: ruanganKosan.id,
			gedungId: ruanganKosan.gedungId,
			namaRuangan: ruanganKosan.namaRuangan,
			lantai: ruanganKosan.lantai,
			kapasitas: ruanganKosan.kapasitas,
			status: ruanganKosan.status,
			hargaBulanan: ruanganKosan.hargaBulanan,
			createdAt: ruanganKosan.createdAt,
			updatedAt: ruanganKosan.updatedAt,
			gedungNama: gedungKosan.namaGedung,
			penghuniAktif: sql<number>`count(${penghuniKosan.id}) filter (where ${penghuniKosan.status} = 'aktif')`
		})
		.from(ruanganKosan)
		.innerJoin(gedungKosan, eq(ruanganKosan.gedungId, gedungKosan.id))
		.leftJoin(penghuniKosan, eq(penghuniKosan.ruanganId, ruanganKosan.id))
		.where(whereClause)
		.groupBy(ruanganKosan.id, gedungKosan.id)
		.orderBy(asc(gedungKosan.namaGedung), asc(ruanganKosan.namaRuangan));
}

export async function findRuanganKosanById(id: string) {
	const [row] = await db.select().from(ruanganKosan).where(eq(ruanganKosan.id, id)).limit(1);
	return row;
}

export async function insertRuanganKosan(values: typeof ruanganKosan.$inferInsert) {
	const [row] = await db.insert(ruanganKosan).values(values).returning();
	return row;
}

export async function updateRuanganKosan(id: string, values: Partial<typeof ruanganKosan.$inferInsert>) {
	const [row] = await db
		.update(ruanganKosan)
		.set(values)
		.where(eq(ruanganKosan.id, id))
		.returning();
	return row;
}

export async function deleteRuanganKosan(id: string) {
	return db.delete(ruanganKosan).where(eq(ruanganKosan.id, id));
}

export async function findRuanganKosong(gedungId?: string | null) {
	let whereClause: any = eq(ruanganKosan.status, 'kosong');
	if (gedungId) {
		whereClause = and(eq(ruanganKosan.status, 'kosong'), eq(ruanganKosan.gedungId, gedungId));
	}

	return db
		.select({
			id: ruanganKosan.id,
			namaRuangan: ruanganKosan.namaRuangan,
			gedungId: ruanganKosan.gedungId,
			gedungNama: gedungKosan.namaGedung,
			hargaBulanan: ruanganKosan.hargaBulanan,
			lantai: ruanganKosan.lantai
		})
		.from(ruanganKosan)
		.innerJoin(gedungKosan, eq(ruanganKosan.gedungId, gedungKosan.id))
		.where(whereClause)
		.orderBy(asc(gedungKosan.namaGedung), asc(ruanganKosan.namaRuangan));
}

export async function hasPenghuniAktif(id: string) {
	const [row] = await db
		.select({ count: sql<number>`count(*)` })
		.from(penghuniKosan)
		.where(and(eq(penghuniKosan.ruanganId, id), eq(penghuniKosan.status, 'aktif')));
	return Number(row?.count ?? 0) > 0;
}

export async function markRuanganStatus(id: string, status: 'kosong' | 'terisi') {
	await db.update(ruanganKosan).set({ status, updatedAt: new Date() }).where(eq(ruanganKosan.id, id));
}
