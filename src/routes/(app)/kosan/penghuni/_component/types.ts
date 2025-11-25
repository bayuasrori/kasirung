export interface PenghuniItem {
	id: string;
	status: 'aktif' | 'keluar';
	tanggalMasuk: Date | string;
	tanggalKeluar: Date | string | null;
	catatan: string | null;
	pelangganId: string;
	pelangganNama: string;
	pelangganEmail: string | null;
	pelangganPhone: string | null;
	gedungId: string;
	gedungNama: string;
	ruanganId: string;
	ruanganNama: string;
	hargaBulanan: number;
}

export interface Filters {
	status: string;
	search: string;
}

export interface FormState {
	form?: 'keluar';
	errors?: Record<string, string[]>;
}
