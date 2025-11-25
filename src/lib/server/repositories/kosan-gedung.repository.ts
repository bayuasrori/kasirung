import { and, asc, eq, sql } from 'drizzle-orm';

import { db } from '$lib/db/client';
import { gedungKosan, ruanganKosan, penghuniKosan } from '$lib/db/schema';

export async function listGedungKosanWithStats() {
	return db
		.select({
			id: gedungKosan.id,
			namaGedung: gedungKosan.namaGedung,
			alamat: gedungKosan.alamat,
			keterangan: gedungKosan.keterangan,
			createdAt: gedungKosan.createdAt,
			updatedAt: gedungKosan.updatedAt,
			totalRuangan: sql<number>`count(distinct ${ruanganKosan.id})`,
			ruanganKosong: sql<number>`count(distinct ${ruanganKosan.id}) filter (where ${ruanganKosan.status} = 'kosong')`,
			penghuniAktif: sql<number>`count(distinct ${penghuniKosan.id}) filter (where ${penghuniKosan.status} = 'aktif')`
		})
		.from(gedungKosan)
		.leftJoin(ruanganKosan, eq(ruanganKosan.gedungId, gedungKosan.id))
		.leftJoin(penghuniKosan, eq(penghuniKosan.gedungId, gedungKosan.id))
		.groupBy(gedungKosan.id)
		.orderBy(asc(gedungKosan.namaGedung));
}

export async function listGedungKosan() {
	return db
		.select({
			id: gedungKosan.id,
			namaGedung: gedungKosan.namaGedung,
			alamat: gedungKosan.alamat,
			keterangan: gedungKosan.keterangan,
			createdAt: gedungKosan.createdAt,
			updatedAt: gedungKosan.updatedAt
		})
		.from(gedungKosan)
		.orderBy(asc(gedungKosan.namaGedung));
}

export async function findGedungKosanById(id: string) {
	const [row] = await db.select().from(gedungKosan).where(eq(gedungKosan.id, id)).limit(1);
	return row;
}

export async function insertGedungKosan(values: typeof gedungKosan.$inferInsert) {
	const [row] = await db.insert(gedungKosan).values(values).returning();
	return row;
}

export async function updateGedungKosan(id: string, values: Partial<typeof gedungKosan.$inferInsert>) {
	const [row] = await db
		.update(gedungKosan)
		.set(values)
		.where(eq(gedungKosan.id, id))
		.returning();
	return row;
}

export async function deleteGedungKosan(id: string) {
	return db.delete(gedungKosan).where(eq(gedungKosan.id, id));
}

export async function countRuanganByGedung(id: string) {
	const [row] = await db
		.select({ count: sql<number>`count(*)` })
		.from(ruanganKosan)
		.where(eq(ruanganKosan.gedungId, id));
	return Number(row?.count ?? 0);
}

export async function countPenghuniAktifByGedung(id: string) {
	const [row] = await db
		.select({ count: sql<number>`count(*)` })
		.from(penghuniKosan)
		.where(and(eq(penghuniKosan.gedungId, id), eq(penghuniKosan.status, 'aktif')));
	return Number(row?.count ?? 0);
}
