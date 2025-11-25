import { and, asc, eq, ilike, or, sql } from 'drizzle-orm';

import { db } from '$lib/db/client';
import { customers, gedungKosan, penghuniKosan, ruanganKosan } from '$lib/db/schema';

interface ListPenghuniParams {
	status?: 'aktif' | 'keluar';
	search?: string;
}

export async function listPenghuniKosan(params: ListPenghuniParams = {}) {
	const { status, search } = params;
	const filters: any[] = [];
	if (status) {
		filters.push(eq(penghuniKosan.status, status));
	}
	if (search) {
		const q = `%${search}%`;
		filters.push(
			or(
				ilike(customers.name, q),
				ilike(gedungKosan.namaGedung, q),
				ilike(ruanganKosan.namaRuangan, q)
			)
		);
	}

	const whereClause = filters.length
		? filters.length === 1
			? filters[0]
			: and(...filters)
		: undefined;

	return db
		.select({
			id: penghuniKosan.id,
			status: penghuniKosan.status,
			tanggalMasuk: penghuniKosan.tanggalMasuk,
			tanggalKeluar: penghuniKosan.tanggalKeluar,
			catatan: penghuniKosan.catatan,
			createdAt: penghuniKosan.createdAt,
			updatedAt: penghuniKosan.updatedAt,
			pelangganId: customers.id,
			pelangganNama: customers.name,
			pelangganEmail: customers.email,
			pelangganPhone: customers.phone,
			gedungId: gedungKosan.id,
			gedungNama: gedungKosan.namaGedung,
			ruanganId: ruanganKosan.id,
			ruanganNama: ruanganKosan.namaRuangan,
			hargaBulanan: ruanganKosan.hargaBulanan
		})
		.from(penghuniKosan)
		.innerJoin(customers, eq(penghuniKosan.pelangganId, customers.id))
		.innerJoin(gedungKosan, eq(penghuniKosan.gedungId, gedungKosan.id))
		.innerJoin(ruanganKosan, eq(penghuniKosan.ruanganId, ruanganKosan.id))
		.where(whereClause)
		.orderBy(asc(customers.name));
}

export async function findPenghuniKosanById(id: string) {
	const [row] = await db
		.select({
			id: penghuniKosan.id,
			pelangganId: penghuniKosan.pelangganId,
			gedungId: penghuniKosan.gedungId,
			ruanganId: penghuniKosan.ruanganId,
			status: penghuniKosan.status,
			tanggalMasuk: penghuniKosan.tanggalMasuk,
			tanggalKeluar: penghuniKosan.tanggalKeluar,
			catatan: penghuniKosan.catatan
		})
		.from(penghuniKosan)
		.where(eq(penghuniKosan.id, id))
		.limit(1);
	return row;
}

export async function insertPenghuniKosan(values: typeof penghuniKosan.$inferInsert) {
	const [row] = await db.insert(penghuniKosan).values(values).returning();
	return row;
}

export async function updatePenghuniKosan(id: string, values: Partial<typeof penghuniKosan.$inferInsert>) {
	const [row] = await db
		.update(penghuniKosan)
		.set(values)
		.where(eq(penghuniKosan.id, id))
		.returning();
	return row;
}

export async function listPenghuniAktifForLookup(search?: string) {
	const filters: any[] = [eq(penghuniKosan.status, 'aktif')];
	if (search) {
		const q = `%${search}%`;
		filters.push(
			or(
				ilike(customers.name, q),
				ilike(gedungKosan.namaGedung, q),
				ilike(ruanganKosan.namaRuangan, q)
			)
		);
	}

	const whereClause = filters.length === 1 ? filters[0] : and(...filters);

	return db
		.select({
			id: penghuniKosan.id,
			pelangganId: customers.id,
			pelangganNama: customers.name,
			pelangganPhone: customers.phone,
			pelangganEmail: customers.email,
			gedungId: gedungKosan.id,
			gedungNama: gedungKosan.namaGedung,
			ruanganId: ruanganKosan.id,
			ruanganNama: ruanganKosan.namaRuangan,
			hargaBulanan: ruanganKosan.hargaBulanan,
			tanggalMasuk: penghuniKosan.tanggalMasuk
		})
		.from(penghuniKosan)
		.innerJoin(customers, eq(customers.id, penghuniKosan.pelangganId))
		.innerJoin(gedungKosan, eq(gedungKosan.id, penghuniKosan.gedungId))
		.innerJoin(ruanganKosan, eq(ruanganKosan.id, penghuniKosan.ruanganId))
		.where(whereClause)
		.orderBy(asc(customers.name));
}

export async function findPenghuniAktifDetailById(id: string) {
	const [row] = await db
		.select({
			id: penghuniKosan.id,
			pelangganId: customers.id,
			pelangganNama: customers.name,
			gedungId: gedungKosan.id,
			gedungNama: gedungKosan.namaGedung,
			ruanganId: ruanganKosan.id,
			ruanganNama: ruanganKosan.namaRuangan
		})
		.from(penghuniKosan)
		.innerJoin(customers, eq(customers.id, penghuniKosan.pelangganId))
		.innerJoin(gedungKosan, eq(gedungKosan.id, penghuniKosan.gedungId))
		.innerJoin(ruanganKosan, eq(ruanganKosan.id, penghuniKosan.ruanganId))
		.where(and(eq(penghuniKosan.id, id), eq(penghuniKosan.status, 'aktif')))
		.limit(1);
	return row ?? null;
}

export async function hasPenghuniAktifUntukPelanggan(pelangganId: string) {
	const [row] = await db
		.select({ count: sql<number>`count(*)` })
		.from(penghuniKosan)
		.where(and(eq(penghuniKosan.pelangganId, pelangganId), eq(penghuniKosan.status, 'aktif')));
	return Number(row?.count ?? 0) > 0;
}

export async function findPenghuniAktifByRuangan(ruanganId: string) {
	const [row] = await db
		.select({ id: penghuniKosan.id, status: penghuniKosan.status })
		.from(penghuniKosan)
		.where(and(eq(penghuniKosan.ruanganId, ruanganId), eq(penghuniKosan.status, 'aktif')))
		.limit(1);
	return row;
}
