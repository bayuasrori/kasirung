import {
	deleteTransactionCascade,
	findTransactionById,
	findTransactions
} from '$lib/server/repositories/transactions.repository';

interface ListParams {
	search?: string;
	startDate?: string;
	endDate?: string;
	page?: number;
	pageSize?: number;
}

const formatDateInput = (date: Date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

export async function listTransactionHistory(params: ListParams) {
	const pageSize = Math.min(Math.max(params.pageSize ?? 15, 1), 100);
	const page = Math.max(params.page ?? 1, 1);
	const offset = (page - 1) * pageSize;

	const normalizeDate = (value: string | undefined, boundary: 'start' | 'end') => {
		if (!value) return undefined;
		const parsed = new Date(value);
		if (Number.isNaN(parsed.getTime())) return undefined;
		if (boundary === 'start') {
			parsed.setHours(0, 0, 0, 0);
		} else {
			parsed.setHours(23, 59, 59, 999);
		}
		return parsed;
	};

	let startDateInput = params.startDate?.trim() ?? '';
	let endDateInput = params.endDate?.trim() ?? '';

	let startDate = normalizeDate(startDateInput, 'start');
	if (startDateInput && !startDate) {
		startDateInput = '';
	}
	let endDate = normalizeDate(endDateInput, 'end');
	if (endDateInput && !endDate) {
		endDateInput = '';
	}

	if (!startDate && !endDate) {
		const today = new Date();
		const startOfToday = new Date(today);
		startOfToday.setHours(0, 0, 0, 0);
		const endOfToday = new Date(today);
		endOfToday.setHours(23, 59, 59, 999);
		startDate = startOfToday;
		endDate = endOfToday;
		const todayString = formatDateInput(today);
		startDateInput = todayString;
		endDateInput = todayString;
	}

	if (startDate && endDate && startDate > endDate) {
		[startDate, endDate] = [endDate, startDate];
		[startDateInput, endDateInput] = [endDateInput, startDateInput];
	}

	const { data, total } = await findTransactions({
		search: params.search,
		startDate,
		endDate,
		limit: pageSize,
		offset
	});

	const pageCount = Math.max(Math.ceil(total / pageSize), 1);

	return {
		items: data,
		total,
		page,
		pageSize,
		pageCount,
		filters: {
			search: params.search ?? '',
			startDate: startDateInput,
			endDate: endDateInput
		}
	};
}

export async function deleteTransaction(id: string) {
	if (!id) {
		return {
			success: false,
			reason: 'invalid-id' as const,
			message: 'Transaksi tidak valid.'
		};
	}

	const transaction = await findTransactionById(id);
	if (!transaction) {
		return {
			success: false,
			reason: 'not-found' as const,
			message: 'Transaksi tidak ditemukan.'
		};
	}

	const now = new Date();
	const startOfToday = new Date(now);
	startOfToday.setHours(0, 0, 0, 0);
	const endOfToday = new Date(now);
	endOfToday.setHours(23, 59, 59, 999);
	const createdAt = new Date(transaction.createdAt);

	if (createdAt < startOfToday || createdAt > endOfToday) {
		return {
			success: false,
			reason: 'out-of-range' as const,
			message: 'Transaksi hanya dapat dihapus pada hari yang sama.'
		};
	}

	const deleted = await deleteTransactionCascade(id);
	if (!deleted) {
		return {
			success: false,
			reason: 'failed' as const,
			message: 'Gagal menghapus transaksi. Silakan coba lagi.'
		};
	}

	return { success: true as const };
}
