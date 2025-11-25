import { randomUUID } from 'crypto';
import { z } from 'zod';

import {
	listAccounts,
	listGeneralLedger,
	listJournalEntries,
	findAccountByCode,
	findAccountById,
	insertAccount,
	updateAccount,
	deleteAccount as deleteAccountRecord,
	countChildAccounts,
	countJournalLinesForAccount,
	findAccountsByCodes,
	generateJournalNumber,
	insertJournalEntryWithLines
} from '$lib/server/repositories/accounting.repository';
import type { DB } from '$lib/db/client';

const toNumber = (value: unknown) => Number(value ?? 0);

const startOfDay = (value: Date) => {
	const date = new Date(value);
	date.setHours(0, 0, 0, 0);
	return date;
};

const endOfDay = (value: Date) => {
	const date = new Date(value);
	date.setHours(23, 59, 59, 999);
	return date;
};

const ACCOUNT_TYPES = ['asset', 'liability', 'equity', 'revenue', 'expense', 'other'] as const;

type DBTransaction = Parameters<Parameters<DB['transaction']>[0]>[0];

const LEDGER_ACCOUNTS = {
	cash: '1101',
	qris: '1102',
	debit: '1103',
	accountsReceivable: '1301',
	salesRevenue: '4101',
	salesDiscount: '5101',
	salesTaxPayable: '2201',
	savingsLiability: '2202',
	loanReceivable: '1302',
	interestIncome: '4102'
} as const;

const PAYMENT_METHOD_ACCOUNT: Record<string, string> = {
	cash: LEDGER_ACCOUNTS.cash,
	qris: LEDGER_ACCOUNTS.qris,
	debit: LEDGER_ACCOUNTS.debit,
	credit: LEDGER_ACCOUNTS.accountsReceivable
};

export class LedgerConfigurationError extends Error {
	constructor(public missingCodes: string[]) {
		super(`Konfigurasi akun belum lengkap untuk kode: ${missingCodes.join(', ')}`);
		this.name = 'LedgerConfigurationError';
	}
}

const toCurrency = (value: number) => Number(value.toFixed(2));

interface JournalLineInput {
	accountCode: string;
	debit?: number;
	credit?: number;
	description?: string | null;
}

const sanitizeLines = (lines: JournalLineInput[]) =>
	lines.filter((line) => Math.abs(line.debit ?? 0) > 0.00001 || Math.abs(line.credit ?? 0) > 0.00001);

async function resolveAccountIds(tx: DBTransaction, codes: string[]) {
	const uniqueCodes = [...new Set(codes.map((code) => code.trim()).filter(Boolean))];
	if (!uniqueCodes.length) return {} as Record<string, string>;
	const rows = await findAccountsByCodes(tx, uniqueCodes);
	const found = new Map(rows.map((row) => [row.code, row.id]));
	const missing = uniqueCodes.filter((code) => !found.has(code));
	if (missing.length) {
		throw new LedgerConfigurationError(missing);
	}
	return uniqueCodes.reduce<Record<string, string>>((acc, code) => {
		acc[code] = found.get(code)!;
		return acc;
	}, {});
}

async function createJournal(
	tx: DBTransaction,
	payload: {
		entryDate: Date;
		memo: string;
		reference?: string | null;
		createdBy?: string | null;
		lines: JournalLineInput[];
	}
) {
	const preparedLines = sanitizeLines(payload.lines);
	if (preparedLines.length < 2) return;

	const debitTotal = preparedLines.reduce((sum, line) => sum + toCurrency(line.debit ?? 0), 0);
	const creditTotal = preparedLines.reduce((sum, line) => sum + toCurrency(line.credit ?? 0), 0);
	if (Math.abs(debitTotal - creditTotal) > 0.01) {
		throw new Error('Jurnal tidak seimbang');
	}

	const accountMap = await resolveAccountIds(tx, preparedLines.map((line) => line.accountCode));
	const now = new Date();
	const entryId = randomUUID();
	const number = generateJournalNumber(payload.entryDate);

	const entry = {
		id: entryId,
		number,
		entryDate: payload.entryDate,
		memo: payload.memo,
		reference: payload.reference ?? null,
		status: 'posted' as const,
		postedAt: now,
		createdBy: payload.createdBy ?? null,
		updatedBy: payload.createdBy ?? null,
		createdAt: now,
		updatedAt: now
	};

	const lines = preparedLines.map((line, index) => ({
		id: randomUUID(),
		entryId,
		accountId: accountMap[line.accountCode],
		description: line.description ?? null,
		sequence: index,
		debit: toCurrency(line.debit ?? 0).toFixed(2),
		credit: toCurrency(line.credit ?? 0).toFixed(2),
		createdAt: now,
		updatedAt: now
	}));

	await insertJournalEntryWithLines(tx, entry, lines);
}

export async function recordPosSaleJournal(
	tx: DBTransaction,
	params: {
		subtotal: number;
		discount: number;
		tax: number;
		total: number;
		paymentMethod: 'cash' | 'qris' | 'debit' | 'credit';
		entryDate: Date;
		reference: string;
		number: string;
		createdBy?: string | null;
	}
) {
	const debitAccount = PAYMENT_METHOD_ACCOUNT[params.paymentMethod] ?? LEDGER_ACCOUNTS.cash;
	const lines: JournalLineInput[] = [
		{ accountCode: debitAccount, debit: params.total, description: `Pembayaran ${params.paymentMethod.toUpperCase()}` },
		{ accountCode: LEDGER_ACCOUNTS.salesRevenue, credit: params.subtotal, description: 'Pendapatan penjualan' }
	];

	if (params.discount > 0) {
		lines.push({ accountCode: LEDGER_ACCOUNTS.salesDiscount, debit: params.discount, description: 'Diskon penjualan' });
	}

	if (params.tax > 0) {
		lines.push({ accountCode: LEDGER_ACCOUNTS.salesTaxPayable, credit: params.tax, description: 'Pajak penjualan' });
	}

	await createJournal(tx, {
		entryDate: params.entryDate,
		memo: `Penjualan POS ${params.number}`,
		reference: params.reference,
		createdBy: params.createdBy ?? null,
		lines
	});
}

export async function recordSavingsJournal(
	tx: DBTransaction,
	params: {
		amount: number;
		type: 'deposit' | 'withdraw';
		entryDate: Date;
		reference: string;
		note?: string | null;
		createdBy?: string | null;
	}
) {
	const lines: JournalLineInput[] =
		params.type === 'deposit'
			? [
				{ accountCode: LEDGER_ACCOUNTS.cash, debit: params.amount, description: 'Setoran tabungan' },
				{ accountCode: LEDGER_ACCOUNTS.savingsLiability, credit: params.amount, description: 'Liabilitas tabungan' }
			]
			: [
				{ accountCode: LEDGER_ACCOUNTS.savingsLiability, debit: params.amount, description: 'Penarikan tabungan' },
				{ accountCode: LEDGER_ACCOUNTS.cash, credit: params.amount, description: 'Penarikan tabungan' }
			];

	await createJournal(tx, {
		entryDate: params.entryDate,
		memo: `Transaksi tabungan ${params.type}`,
		reference: params.reference,
		createdBy: params.createdBy ?? null,
		lines
	});
}

export async function recordSavingsToReceivableJournal(
	tx: DBTransaction,
	params: { amount: number; entryDate: Date; reference: string; createdBy?: string | null }
) {
	await createJournal(tx, {
		entryDate: params.entryDate,
		memo: 'Pembayaran piutang dari tabungan',
		reference: params.reference,
		createdBy: params.createdBy ?? null,
		lines: [
			{ accountCode: LEDGER_ACCOUNTS.savingsLiability, debit: params.amount, description: 'Pengurangan tabungan' },
			{ accountCode: LEDGER_ACCOUNTS.accountsReceivable, credit: params.amount, description: 'Pelunasan piutang' }
		]
	});
}

export async function recordLoanDisbursementJournal(
	tx: DBTransaction,
	params: { amount: number; entryDate: Date; reference: string; createdBy?: string | null }
) {
	await createJournal(tx, {
		entryDate: params.entryDate,
		memo: 'Pencairan pinjaman anggota',
		reference: params.reference,
		createdBy: params.createdBy ?? null,
		lines: [
			{ accountCode: LEDGER_ACCOUNTS.loanReceivable, debit: params.amount, description: 'Piutang pinjaman' },
			{ accountCode: LEDGER_ACCOUNTS.cash, credit: params.amount, description: 'Kas keluar' }
		]
	});
}

export async function recordLoanRepaymentJournal(
	tx: DBTransaction,
	params: {
		total: number;
		principal: number;
		interest: number;
		entryDate: Date;
		reference: string;
		createdBy?: string | null;
	}
) {
	const lines: JournalLineInput[] = [
		{ accountCode: LEDGER_ACCOUNTS.cash, debit: params.total, description: 'Pembayaran pinjaman' }
	];

	if (params.principal > 0) {
		lines.push({ accountCode: LEDGER_ACCOUNTS.loanReceivable, credit: params.principal, description: 'Pelunasan pokok pinjaman' });
	}

	if (params.interest > 0) {
		lines.push({ accountCode: LEDGER_ACCOUNTS.interestIncome, credit: params.interest, description: 'Pendapatan bunga pinjaman' });
	}

	await createJournal(tx, {
		entryDate: params.entryDate,
		memo: 'Pembayaran pinjaman anggota',
		reference: params.reference,
		createdBy: params.createdBy ?? null,
		lines
	});
}

export async function recordLoanRepaymentFromSavingsJournal(
	tx: DBTransaction,
	params: {
		total: number;
		principal: number;
		interest: number;
		entryDate: Date;
		reference: string;
		createdBy?: string | null;
	}
) {
	const lines: JournalLineInput[] = [
		{ accountCode: LEDGER_ACCOUNTS.savingsLiability, debit: params.total, description: 'Pengurangan tabungan anggota' }
	];

	if (params.principal > 0) {
		lines.push({ accountCode: LEDGER_ACCOUNTS.loanReceivable, credit: params.principal, description: 'Pelunasan pokok pinjaman' });
	}

	if (params.interest > 0) {
		lines.push({ accountCode: LEDGER_ACCOUNTS.interestIncome, credit: params.interest, description: 'Pendapatan bunga pinjaman' });
	}

	await createJournal(tx, {
		entryDate: params.entryDate,
		memo: 'Pembayaran pinjaman via tabungan',
		reference: params.reference,
		createdBy: params.createdBy ?? null,
		lines
	});
}

const accountSchema = z.object({
	code: z
		.string()
		.trim()
		.min(2, 'Kode minimal 2 karakter')
		.max(30, 'Kode maksimal 30 karakter'),
	name: z
		.string()
		.trim()
		.min(3, 'Nama minimal 3 karakter')
		.max(120, 'Nama maksimal 120 karakter'),
	type: z.enum(ACCOUNT_TYPES),
	parentId: z
		.string()
		.uuid('Akun induk tidak valid')
		.optional()
		.or(z.literal('')),
	description: z
		.string()
		.trim()
		.max(255, 'Deskripsi maksimal 255 karakter')
		.optional()
		.or(z.literal('')),
	isActive: z.enum(['true', 'false']).optional()
});

export async function getAccountingOverview() {
	const [accounts, journals] = await Promise.all([
		listAccounts(),
		listJournalEntries({ limit: 5 })
	]);

	const totalAccounts = accounts.length;
	const activeAccounts = accounts.filter((item) => item.isActive).length;
	const recentJournalTotals = journals.reduce(
		(acc, item) => {
			acc.debit += toNumber(item.totalDebit);
			acc.credit += toNumber(item.totalCredit);
			return acc;
		},
		{ debit: 0, credit: 0 }
	);

	return {
		accounts: {
			total: totalAccounts,
			active: activeAccounts
		},
		journals: {
			recent: journals.map((entry) => ({
				id: entry.id,
				number: entry.number,
				entryDate: entry.entryDate,
				memo: entry.memo,
				status: entry.status,
				totalDebit: toNumber(entry.totalDebit),
				totalCredit: toNumber(entry.totalCredit)
			})),
			totalDebit: recentJournalTotals.debit,
			totalCredit: recentJournalTotals.credit
		}
	};
}

export async function getChartOfAccounts() {
	const accounts = await listAccounts();
	const grouped = new Map<string, number>();

	for (const account of accounts) {
		grouped.set(account.type, (grouped.get(account.type) ?? 0) + 1);
	}

	return {
		items: accounts,
		totalsByType: Array.from(grouped.entries()).map(([type, count]) => ({ type, count }))
	};
}

interface JournalQuery {
	status?: 'draft' | 'posted' | 'void';
	from?: string;
	to?: string;
}

export async function getJournalListing(params: JournalQuery = {}) {
	const filters: { status?: 'draft' | 'posted' | 'void'; from?: Date; to?: Date } = {};

	if (params.status) {
		filters.status = params.status;
	}

	if (params.from) {
		filters.from = startOfDay(new Date(params.from));
	}

	if (params.to) {
		filters.to = endOfDay(new Date(params.to));
	}

	const rows = await listJournalEntries({ ...filters, limit: 50 });

	return rows.map((row) => ({
		id: row.id,
		number: row.number,
		entryDate: row.entryDate,
		memo: row.memo,
		reference: row.reference,
		status: row.status,
		postedAt: row.postedAt,
		totalDebit: toNumber(row.totalDebit),
		totalCredit: toNumber(row.totalCredit)
	}));
}

interface LedgerQuery {
	accountId?: string;
	from?: string;
	to?: string;
}

export async function getGeneralLedger(params: LedgerQuery = {}) {
	const result = {
		accountId: params.accountId ?? null,
		lines: [] as Array<{
			lineId: string;
			entryId: string;
			number: string;
			entryDate: Date;
			memo: string | null;
			description: string | null;
			debit: number;
			credit: number;
			balance: number;
		}>,
		totalDebit: 0,
		totalCredit: 0
	};

	if (!params.accountId) {
		return result;
	}

	const filters: { from?: Date; to?: Date } = {};

	if (params.from) {
		filters.from = startOfDay(new Date(params.from));
	}

	if (params.to) {
		filters.to = endOfDay(new Date(params.to));
	}

	const rows = await listGeneralLedger(params.accountId, filters);

	for (const row of rows) {
		const debit = toNumber(row.debit);
		const credit = toNumber(row.credit);
		const balance = toNumber(row.balance);

		result.lines.push({
			lineId: row.lineId,
			entryId: row.entryId,
			number: row.number,
			entryDate: row.entryDate,
			memo: row.memo ?? null,
			description: row.description ?? null,
			debit,
			credit,
			balance
		});

		result.totalDebit += debit;
		result.totalCredit += credit;
	}

	return result;
}

const normalizeAccountPayload = (data: z.infer<typeof accountSchema>) => {
	const parentId = data.parentId && data.parentId !== '' ? data.parentId : null;
	const description = data.description && data.description !== '' ? data.description : null;
	const isActive = data.isActive ? data.isActive === 'true' : true;

	return {
		code: data.code.trim(),
		name: data.name.trim(),
		type: data.type,
		parentId,
		description,
		isActive
	};
};

export async function createLedgerAccount(payload: Record<string, unknown>) {
	const parsed = accountSchema.safeParse(payload);
	if (!parsed.success) {
		return { success: false, errors: parsed.error.flatten().fieldErrors } as const;
	}

	const normalized = normalizeAccountPayload(parsed.data);

	if (normalized.parentId) {
		const parent = await findAccountById(normalized.parentId);
		if (!parent) {
			return { success: false, errors: { parentId: ['Akun induk tidak ditemukan'] } } as const;
		}
	}

	const existingCode = await findAccountByCode(normalized.code);
	if (existingCode) {
		return { success: false, errors: { code: ['Kode akun sudah digunakan'] } } as const;
	}

	await insertAccount({
		code: normalized.code,
		name: normalized.name,
		type: normalized.type,
		parentId: normalized.parentId,
		description: normalized.description,
		isActive: normalized.isActive,
		createdAt: new Date(),
		updatedAt: new Date()
	});

	return { success: true } as const;
}

export async function updateLedgerAccount(id: string, payload: Record<string, unknown>) {
	const parsed = accountSchema.safeParse(payload);
	if (!parsed.success) {
		return { success: false, errors: parsed.error.flatten().fieldErrors } as const;
	}

	const existing = await findAccountById(id);
	if (!existing) {
		return { success: false, notFound: true } as const;
	}

	const normalized = normalizeAccountPayload(parsed.data);

	if (normalized.parentId) {
		if (normalized.parentId === id) {
			return { success: false, errors: { parentId: ['Akun induk tidak boleh sama dengan akun'] } } as const;
		}
		const parent = await findAccountById(normalized.parentId);
		if (!parent) {
			return { success: false, errors: { parentId: ['Akun induk tidak ditemukan'] } } as const;
		}
	}

	if (normalized.code !== existing.code) {
		const codeConflict = await findAccountByCode(normalized.code);
		if (codeConflict) {
			return { success: false, errors: { code: ['Kode akun sudah digunakan'] } } as const;
		}
	}

	await updateAccount(id, {
		code: normalized.code,
		name: normalized.name,
		type: normalized.type,
		parentId: normalized.parentId,
		description: normalized.description,
		isActive: normalized.isActive,
		updatedAt: new Date()
	});

	return { success: true } as const;
}

export async function deleteLedgerAccount(id: string) {
	const existing = await findAccountById(id);
	if (!existing) {
		return { success: false, notFound: true } as const;
	}

	const childCount = await countChildAccounts(id);
	if (childCount > 0) {
		return {
			success: false,
			errors: { id: ['Akun memiliki akun turunan, pindahkan terlebih dahulu'] }
		} as const;
	}

	const journalUsage = await countJournalLinesForAccount(id);
	if (journalUsage > 0) {
		return {
			success: false,
			errors: { id: ['Akun sudah digunakan pada jurnal dan tidak dapat dihapus'] }
		} as const;
	}

	await deleteAccountRecord(id);

	return { success: true } as const;
}
