export type TransactionHistoryFilters = {
	search: string;
	startDate: string;
	endDate: string;
};

export type TransactionHistoryItem = {
	id: string;
	number: string;
	subtotal: string;
	tax: string;
	discount: string;
	total: string;
	status: string;
	createdAt: Date;
	cashier: string | null;
	customer: string | null;
};

export type TransactionHistory = {
	items: TransactionHistoryItem[];
	total: number;
	page: number;
	pageSize: number;
	pageCount: number;
	filters: TransactionHistoryFilters;
};
