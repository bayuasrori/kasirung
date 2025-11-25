export interface CustomerOption {
	id: string;
	name: string;
}

export interface GedungOption {
	id: string;
	namaGedung: string;
}

export interface RoomOption {
	id: string;
	gedungId: string;
	namaRuangan: string;
	gedungNama: string;
	hargaBulanan: number;
	lantai: string | null;
}

export interface FormState {
	form?: 'register' | 'createCustomer';
	errors?: Record<string, string[]>;
}
