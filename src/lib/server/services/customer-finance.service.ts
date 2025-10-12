import { z } from 'zod';

import { db } from '$lib/db/client';
import { loanAccounts, loanTransactions, savingsTransactions, transactions, payments } from '$lib/db/schema';
import {
	findLoanAccountById,
	getSavingsStats,
	listLoanAccountsByCustomer,
	listRecentLoanTransactions,
	listSavingsTransactionsByCustomer
} from '$lib/server/repositories/customer-finance.repository';
import { and, eq } from 'drizzle-orm';

const toNumber = (value: unknown) => Number(value ?? 0);

const savingsTransactionSchema = z.object({
	type: z.enum(['deposit', 'withdraw']),
	amount: z.coerce
		.number()
		.positive('Nominal harus lebih dari 0'),
	note: z
		.string()
		.trim()
		.max(255, 'Catatan maksimal 255 karakter')
		.optional()
		.or(z.literal('')),
	reference: z
		.string()
		.trim()
		.max(50, 'Referensi maksimal 50 karakter')
		.optional()
		.or(z.literal(''))
});

const loanCreateSchema = z.object({
	principal: z.coerce
		.number()
		.min(1000, 'Nominal pinjaman minimal Rp1.000'),
	interestRate: z.coerce
		.number()
		.min(0, 'Bunga tidak boleh negatif')
		.max(100, 'Bunga maksimal 100%'),
	termMonths: z
		.coerce.number()
		.int('Tenor harus angka bulat')
		.min(1, 'Tenor minimal 1 bulan')
		.max(120, 'Tenor maksimal 120 bulan')
		.optional(),
	issuedAt: z
		.string()
		.optional()
		.refine((value) => !value || !Number.isNaN(Date.parse(value)), 'Tanggal pencairan tidak valid'),
	dueDate: z
		.string()
		.optional()
		.refine((value) => !value || !Number.isNaN(Date.parse(value)), 'Tanggal jatuh tempo tidak valid'),
	notes: z
		.string()
		.trim()
		.max(500, 'Catatan maksimal 500 karakter')
		.optional()
		.or(z.literal('')),
	reference: z
		.string()
		.trim()
		.max(50, 'Referensi maksimal 50 karakter')
		.optional()
		.or(z.literal(''))
});

const loanRepaymentSchema = z.object({
	loanId: z.string().min(1, 'Pilih pinjaman'),
	amount: z.coerce
		.number()
		.positive('Nominal angsuran harus lebih dari 0'),
	note: z
		.string()
		.trim()
		.max(255, 'Catatan maksimal 255 karakter')
		.optional()
		.or(z.literal('')),
	reference: z
		.string()
		.trim()
		.max(50, 'Referensi maksimal 50 karakter')
		.optional()
		.or(z.literal(''))
});

const payFromSavingsSchema = z.object({
	transactionId: z.string().min(1, 'Transaksi tidak valid'),
	amount: z.coerce
		.number()
		.positive('Nominal pembayaran harus lebih dari 0')
});

const payLoanFromSavingsSchema = z.object({
	loanId: z.string().min(1, 'Pinjaman tidak valid'),
	amount: z.coerce
		.number()
		.positive('Nominal pembayaran harus lebih dari 0')
});

export async function getCustomerFinance(customerId: string) {
	const [savingsTransactions, savingsStats, loanAccountsRows, loanTransactions] = await Promise.all([
		listSavingsTransactionsByCustomer(customerId, 20),
		getSavingsStats(customerId),
		listLoanAccountsByCustomer(customerId),
		listRecentLoanTransactions(customerId, 20)
	]);

	const savings = {
		totalDeposits: savingsStats.totalDeposits,
		totalWithdrawals: savingsStats.totalWithdrawals,
		balance: savingsStats.totalDeposits - savingsStats.totalWithdrawals,
		transactions: savingsTransactions.map((item) => ({
			id: item.id,
			type: item.type,
			amount: toNumber(item.amount),
			note: item.note,
			reference: item.reference,
			createdAt: item.createdAt
		}))
	};

	const loans = loanAccountsRows.map((loan) => ({
		id: loan.id,
		principal: toNumber(loan.principal),
		balance: toNumber(loan.balance),
		interestRate: toNumber(loan.interestRate),
		termMonths: loan.termMonths ?? null,
		status: loan.status,
		issuedAt: loan.issuedAt,
		dueDate: loan.dueDate,
		notes: loan.notes,
		createdAt: loan.createdAt,
		totalPaid: toNumber(loan.totalPaid)
	}));

	const loansSummary = {
		items: loans,
		totalOutstanding: loans.reduce((sum, loan) => sum + loan.balance, 0),
		activeCount: loans.filter((loan) => loan.status === 'active').length,
		recentTransactions: loanTransactions.map((item) => ({
			id: item.id,
			loanId: item.loanId,
			type: item.type,
			amount: toNumber(item.amount),
			note: item.note,
			reference: item.reference,
			createdAt: item.createdAt
		}))
	};

	return {
		savings,
		loans: loansSummary
	} as const;
}

export async function recordSavingsTransaction(
	customerId: string,
	payload: Record<string, unknown>,
	options: { userId?: string | null } = {}
) {
	const parsed = savingsTransactionSchema.safeParse(payload);
	if (!parsed.success) {
		return { success: false, errors: parsed.error.flatten().fieldErrors } as const;
	}

	const data = parsed.data;
	const stats = await getSavingsStats(customerId);
	const balance = stats.totalDeposits - stats.totalWithdrawals;
	if (data.type === 'withdraw' && data.amount > balance) {
		return { success: false, errors: { amount: ['Saldo tabungan tidak mencukupi'] } } as const;
	}

	await db.transaction(async (tx) => {
		await tx.insert(savingsTransactions).values({
			customerId,
			type: data.type,
			amount: data.amount.toString(),
			note: data.note ? data.note : null,
			reference: data.reference ? data.reference : null,
			createdBy: options.userId ?? null,
			createdAt: new Date()
		});
	});

	return { success: true } as const;
}

export async function payLoanFromSavings(
	customerId: string,
	payload: Record<string, unknown>,
	options: { userId?: string | null } = {}
) {
	const parsed = payLoanFromSavingsSchema.safeParse(payload);
	if (!parsed.success) {
		return { success: false, errors: parsed.error.flatten().fieldErrors } as const;
	}

	const { loanId, amount } = parsed.data;
	const loan = await findLoanAccountById(loanId);
	if (!loan || loan.customerId !== customerId) {
		return { success: false, errors: { loanId: ['Pinjaman tidak ditemukan untuk pelanggan ini'] } } as const;
	}

	if (loan.status !== 'active') {
		return { success: false, errors: { loanId: ['Pinjaman tidak dalam status aktif'] } } as const;
	}

	const currentBalance = toNumber(loan.balance);
	if (currentBalance <= 0) {
		return { success: false, errors: { loanId: ['Pinjaman sudah lunas'] } } as const;
	}

	if (amount > currentBalance) {
		return { success: false, errors: { amount: ['Nominal melebihi sisa pinjaman'] } } as const;
	}

	const stats = await getSavingsStats(customerId);
	const savingsBalance = stats.totalDeposits - stats.totalWithdrawals;
	if (amount > savingsBalance) {
		return { success: false, errors: { balance: ['Saldo tabungan tidak mencukupi'] } } as const;
	}

	const remaining = Math.max(0, Number((currentBalance - amount).toFixed(2)));
	const nextStatus = remaining === 0 ? 'closed' : loan.status;

	await db.transaction(async (tx) => {
		const now = new Date();
		await tx.insert(savingsTransactions).values({
			customerId,
			type: 'withdraw',
			amount: amount.toString(),
			note: `Pembayaran pinjaman ${loan.id.slice(0, 8).toUpperCase()} dari tabungan`,
			reference: `LOAN-${loan.id.slice(0, 8).toUpperCase()}`,
			createdBy: options.userId ?? null,
			createdAt: now
		});

		await tx.insert(loanTransactions).values({
			loanId: loan.id,
			type: 'repayment',
			amount: amount.toString(),
			note: 'Pembayaran menggunakan tabungan anggota',
			reference: `TABUNGAN-${loan.id.slice(0, 8).toUpperCase()}`,
			createdBy: options.userId ?? null,
			createdAt: now
		});

		await tx
			.update(loanAccounts)
			.set({
				balance: remaining.toString(),
				status: nextStatus,
				updatedAt: now
			})
			.where(eq(loanAccounts.id, loan.id));
	});

	return { success: true } as const;
}

export async function createLoanAccount(
	customerId: string,
	payload: Record<string, unknown>,
	options: { userId?: string | null } = {}
) {
	const parsed = loanCreateSchema.safeParse(payload);
	if (!parsed.success) {
		return { success: false, errors: parsed.error.flatten().fieldErrors } as const;
	}

	const data = parsed.data;
	const issuedAt = data.issuedAt ? new Date(data.issuedAt) : new Date();
	const dueDate = data.dueDate ? new Date(data.dueDate) : null;

	await db.transaction(async (tx) => {
		const now = new Date();
		const [loan] = await tx
			.insert(loanAccounts)
			.values({
				customerId,
				principal: data.principal.toString(),
				balance: data.principal.toString(),
				interestRate: data.interestRate.toString(),
				termMonths: data.termMonths ?? null,
				status: 'active',
				issuedAt,
				dueDate,
				notes: data.notes ? data.notes : null,
				createdBy: options.userId ?? null,
				createdAt: now,
				updatedAt: now
			})
			.returning({ id: loanAccounts.id });

		await tx.insert(loanTransactions).values({
			loanId: loan.id,
			type: 'disbursement',
			amount: data.principal.toString(),
			note: data.notes ? `Pencairan: ${data.notes}` : 'Pencairan awal',
			reference: data.reference ? data.reference : null,
			createdBy: options.userId ?? null,
			createdAt: now
		});
	});

	return { success: true } as const;
}

export async function recordLoanRepayment(
	customerId: string,
	payload: Record<string, unknown>,
	options: { userId?: string | null } = {}
) {
	const parsed = loanRepaymentSchema.safeParse(payload);
	if (!parsed.success) {
		return { success: false, errors: parsed.error.flatten().fieldErrors } as const;
	}

	const data = parsed.data;
	const loan = await findLoanAccountById(data.loanId);
	if (!loan || loan.customerId !== customerId) {
		return { success: false, errors: { loanId: ['Pinjaman tidak ditemukan'] } } as const;
	}

	if (loan.status === 'closed') {
		return { success: false, errors: { loanId: ['Pinjaman sudah lunas'] } } as const;
	}

	const currentBalance = toNumber(loan.balance);
	if (data.amount > currentBalance) {
		return { success: false, errors: { amount: ['Nominal melebihi sisa pinjaman'] } } as const;
	}

	const newBalance = Math.max(0, Number((currentBalance - data.amount).toFixed(2)));
	const nextStatus = newBalance === 0 ? 'closed' : loan.status;

	await db.transaction(async (tx) => {
		const now = new Date();
		await tx.insert(loanTransactions).values({
			loanId: loan.id,
			type: 'repayment',
			amount: data.amount.toString(),
			note: data.note ? data.note : null,
			reference: data.reference ? data.reference : null,
			createdBy: options.userId ?? null,
			createdAt: now
		});

		await tx
			.update(loanAccounts)
			.set({
				balance: newBalance.toString(),
				status: nextStatus,
				updatedAt: now
			})
			.where(eq(loanAccounts.id, loan.id));
	});

	return { success: true } as const;
}

export async function payOutstandingWithSavings(
	customerId: string,
	payload: Record<string, unknown>,
	options: { userId?: string | null } = {}
) {
	const parsed = payFromSavingsSchema.safeParse(payload);
	if (!parsed.success) {
		return { success: false, errors: parsed.error.flatten().fieldErrors } as const;
	}

	const { transactionId, amount } = parsed.data;

	const [payment] = await db
		.select({
			paymentId: payments.id,
			amount: payments.amount,
			status: payments.status,
			transactionNumber: transactions.number,
			transactionCustomerId: transactions.customerId
		})
		.from(payments)
		.innerJoin(transactions, eq(transactions.id, payments.transactionId))
		.where(and(eq(transactions.id, transactionId), eq(transactions.customerId, customerId)))
		.limit(1);

	if (!payment) {
		return {
			success: false,
			errors: { transactionId: ['Transaksi tidak ditemukan untuk pelanggan ini'] }
		} as const;
	}

	if ((payment.status ?? 'pending') === 'paid') {
		return {
			success: false,
			errors: { transactionId: ['Transaksi sudah dibayarkan'] }
		} as const;
	}

	const outstanding = Number(payment.amount ?? 0);
	if (outstanding <= 0) {
		return {
			success: false,
			errors: { amount: ['Nominal piutang tidak valid'] }
		} as const;
	}

	if (amount > outstanding) {
		return {
			success: false,
			errors: { amount: ['Nominal melebihi sisa piutang'] }
		} as const;
	}

	const stats = await getSavingsStats(customerId);
	const balance = stats.totalDeposits - stats.totalWithdrawals;
	if (amount > balance) {
		return {
			success: false,
			errors: { balance: ['Saldo tabungan tidak mencukupi'] }
		} as const;
	}

	const remaining = Math.max(0, Number((outstanding - amount).toFixed(2)));
	const nextStatus = remaining === 0 ? 'paid' : 'pending';

	await db.transaction(async (tx) => {
		const now = new Date();
		await tx.insert(savingsTransactions).values({
			customerId,
			type: 'withdraw',
			amount: amount.toString(),
			note: `Pembayaran piutang ${payment.transactionNumber}`,
			reference: `PIUTANG-${payment.transactionNumber}`,
			createdBy: options.userId ?? null,
			createdAt: now
		});

		await tx
			.update(payments)
			.set({
				amount: remaining.toString(),
				status: nextStatus,
				...(nextStatus === 'paid' ? { paidAt: now } : {}),
				updatedAt: now
			})
			.where(eq(payments.id, payment.paymentId));
	});

	return { success: true } as const;
}
