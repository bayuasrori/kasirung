import type {
	gedungKosan,
	ruanganKosan,
	penghuniKosan,
	kosanRoomStatusEnum,
	kosanTenantStatusEnum
} from '$lib/db/schema';

export type KosanRoomStatus = (typeof kosanRoomStatusEnum.enumValues)[number];
export type KosanTenantStatus = (typeof kosanTenantStatusEnum.enumValues)[number];

export type GedungKosanRow = typeof gedungKosan.$inferSelect;
export type GedungKosanInsert = typeof gedungKosan.$inferInsert;
export interface GedungKosan extends GedungKosanRow {}

export type RuanganKosanRow = typeof ruanganKosan.$inferSelect;
export type RuanganKosanInsert = typeof ruanganKosan.$inferInsert;
export interface RuanganKosan extends RuanganKosanRow {}

export type PenghuniKosanRow = typeof penghuniKosan.$inferSelect;
export type PenghuniKosanInsert = typeof penghuniKosan.$inferInsert;
export interface PenghuniKosan extends PenghuniKosanRow {}

export interface PenghuniAktifDetail {
	id: string;
	pelangganId: string;
	pelangganNama: string;
	pelangganKontak?: string | null;
	gedungId: string;
	gedungNama: string;
	ruanganId: string;
	ruanganNama: string;
	tanggalMasuk: string;
	catatan?: string | null;
}

export interface RuanganDenganGedung extends RuanganKosan {
	gedungNama: string;
}

export type KosanHighlightVariant = 'success' | 'warning' | 'destructive' | 'muted';

export interface KosanDashboardSummary {
	totalGedung: number;
	totalRuangan: number;
	ruanganTerisi: number;
	ruanganKosong: number;
	penghuniAktif: number;
	occupancyRate: number;
	highlight: {
		variant: KosanHighlightVariant;
		title: string;
		message: string;
	};
	bestGedung?: {
		id: string;
		name: string;
		occupancyRate: number;
		occupiedRooms: number;
		totalRooms: number;
	};
	attentionGedung?: {
		id: string;
		name: string;
		availableRooms: number;
		totalRooms: number;
	};
}
