export interface Product {
	id: string;
	name: string;
	sku: string | null;
	price: string;
	categoryId: number | null;
	categoryName?: string | null;
}

export interface Category {
	id: number;
	name: string;
}

export interface Customer {
	id: string;
	name: string;
}

export interface Tenant {
	id: string;
	pelangganId: string;
	pelangganNama: string;
	pelangganKontak?: string | null;
	gedungId: string;
	gedungNama: string;
	ruanganId: string;
	ruanganNama: string;
	hargaBulanan: number;
	tanggalMasuk: string;
}

export type PaymentMethod = 'cash' | 'qris' | 'debit' | 'credit';

export interface CartItem {
	id: string;
	name: string;
	price: number;
	quantity: number;
}

export interface FormState {
	form?: 'checkout';
	errors?: Record<string, string[]>;
}
