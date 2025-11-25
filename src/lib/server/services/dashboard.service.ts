import { sql, eq } from 'drizzle-orm';

import { getDailySales, getTodaySummary, getTopProducts, listRecentTransactions } from '$lib/server/repositories/transactions.repository';
import { db } from '$lib/db/client';
import { gedungKosan, penghuniKosan, ruanganKosan } from '$lib/db/schema';
import { listGedungKosanWithStats } from '$lib/server/repositories/kosan-gedung.repository';
import type { KosanDashboardSummary } from '$lib/types/kosan';

function fillMissingDays(data: Array<{ date: string; count: number; total: number }>, days = 7) {
	const today = new Date();
	const map = new Map(data.map((item) => [item.date, item]));
	const result: Array<{ date: string; count: number; total: number }> = [];

	for (let i = days - 1; i >= 0; i -= 1) {
		const date = new Date(today);
		date.setDate(today.getDate() - i);
		const formatted = date.toISOString().slice(0, 10);
		const entry = map.get(formatted);
		result.push({
			date: formatted,
			count: entry?.count ?? 0,
			total: entry?.total ?? 0
		});
	}

	return result;
}

function buildKosanHighlight(
	totalRuangan: number,
	occupancyRate: number,
	ruanganKosong: number
): KosanDashboardSummary['highlight'] {
	const occupancyLabel =
		occupancyRate % 1 === 0 ? occupancyRate.toFixed(0) : occupancyRate.toFixed(1);

	if (totalRuangan === 0) {
		return {
			variant: 'muted',
			title: 'Data kosan belum tersedia',
			message: 'Tambahkan gedung dan ruangan untuk mulai memantau okupansi.'
		};
	}

	if (occupancyRate >= 85) {
		return {
			variant: 'warning',
			title: 'Okupansi hampir penuh',
			message: `Hunian telah mencapai ${occupancyLabel}% dengan hanya ${ruanganKosong} kamar kosong tersisa. Pertimbangkan untuk menambah stok atau menyiapkan daftar tunggu.`
		};
	}

	if (occupancyRate < 40) {
		return {
			variant: 'destructive',
			title: 'Banyak kamar kosong',
			message: `${ruanganKosong} kamar belum terisi. Dorong promosi agar okupansi meningkat.`
		};
	}

	return {
		variant: 'success',
		title: 'Hunian stabil',
		message: `Okupansi berada di ${occupancyLabel}% dengan ${ruanganKosong} kamar siap ditawarkan.`
	};
}

async function getKosanSummary(): Promise<KosanDashboardSummary> {
	const [[gedungRow], [roomRow], [tenantRow], gedungStats] = await Promise.all([
		db.select({ total: sql<number>`count(*)` }).from(gedungKosan),
		db
			.select({
				total: sql<number>`count(*)`,
				occupied: sql<number>`count(*) filter (where ${ruanganKosan.status} = 'terisi')`,
				available: sql<number>`count(*) filter (where ${ruanganKosan.status} = 'kosong')`
			})
			.from(ruanganKosan),
		db
			.select({ active: sql<number>`count(*)` })
			.from(penghuniKosan)
			.where(eq(penghuniKosan.status, 'aktif')),
		listGedungKosanWithStats()
	]);

	const totalGedung = Number(gedungRow?.total ?? 0);
	const totalRuangan = Number(roomRow?.total ?? 0);
	const ruanganTerisi = Number(roomRow?.occupied ?? 0);
	const ruanganKosong =
		roomRow?.available !== undefined
			? Number(roomRow.available ?? 0)
			: Math.max(totalRuangan - ruanganTerisi, 0);
	const penghuniAktif = Number(tenantRow?.active ?? 0);

	const occupancyRate =
		totalRuangan > 0 ? Number(((ruanganTerisi / totalRuangan) * 100).toFixed(1)) : 0;

	const gedungInsights = gedungStats
		.map((row) => {
			const totalRooms = Number(row.totalRuangan ?? 0);
			const emptyRooms = Number(row.ruanganKosong ?? 0);
			const occupiedRooms = Math.max(totalRooms - emptyRooms, 0);
			const occupancy =
				totalRooms > 0 ? Number(((occupiedRooms / totalRooms) * 100).toFixed(1)) : 0;
			return {
				id: row.id,
				name: row.namaGedung,
				totalRooms,
				occupiedRooms,
				availableRooms: emptyRooms,
				occupancyRate: occupancy
			};
		})
		.filter((row) => row.totalRooms > 0);

	const bestGedungData =
		gedungInsights.length > 0
			? gedungInsights.reduce((best, current) =>
					current.occupancyRate > best.occupancyRate ? current : best
			  )
			: null;

	const attentionGedungData =
		gedungInsights.length > 0
			? gedungInsights.reduce((worst, current) =>
					current.availableRooms > worst.availableRooms ? current : worst
			  )
			: null;

	return {
		totalGedung,
		totalRuangan,
		ruanganTerisi,
		ruanganKosong,
		penghuniAktif,
		occupancyRate,
		highlight: buildKosanHighlight(totalRuangan, occupancyRate, ruanganKosong),
		bestGedung: bestGedungData
			? {
					id: bestGedungData.id,
					name: bestGedungData.name,
					occupancyRate: bestGedungData.occupancyRate,
					occupiedRooms: bestGedungData.occupiedRooms,
					totalRooms: bestGedungData.totalRooms
				}
			: undefined,
		attentionGedung: attentionGedungData
			? {
					id: attentionGedungData.id,
					name: attentionGedungData.name,
					availableRooms: attentionGedungData.availableRooms,
					totalRooms: attentionGedungData.totalRooms
				}
			: undefined
	};
}

export async function getDashboardSnapshot() {
	const days = 7;
	const [today, sales, recent, topProducts, kosanSummary] = await Promise.all([
		getTodaySummary(),
		getDailySales(days),
		listRecentTransactions(5),
		getTopProducts(5),
		getKosanSummary()
	]);

	return {
		today,
		sales: fillMissingDays(sales, days),
		recent,
		topProducts,
		kosan: kosanSummary
	};
}
