export interface GedungOption {
	id: string;
	namaGedung: string;
	alamat: string;
	keterangan: string | null;
}

export interface RoomItem {
	id: string;
	gedungId: string;
	namaRuangan: string;
	lantai: string | null;
	kapasitas: number;
	status: 'kosong' | 'terisi';
	hargaBulanan: number;
	gedungNama: string;
	penghuniAktif: number;
}

export interface Filters {
	gedungId: string;
	status: string;
}

export interface FormState {
	form?: 'create' | 'update' | 'delete';
	errors?: Record<string, string[]>;
}
