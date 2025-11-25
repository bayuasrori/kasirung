export interface GedungItem {
	id: string;
	namaGedung: string;
	alamat: string;
	keterangan: string | null;
	totalRuangan: number;
	ruanganKosong: number;
	penghuniAktif: number;
}

export interface FormState {
	form?: 'create' | 'update' | 'delete';
	errors?: Record<string, string[]>;
}
