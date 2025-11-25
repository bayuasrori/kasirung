import { db, type DB } from '$lib/db/client';
import { loanAccounts, loanTransactions, savingsTransactions } from '$lib/db/schema';
import { desc, eq, sql } from 'drizzle-orm';

const defaultListLimit = 10;

type LoanStatus = typeof loanAccounts.$inferSelect['status'];

export async function listSavingsTransactionsByCustomer(customerId: string, limit = defaultListLimit) {
	return db
		.select({
			id: savingsTransactions.id,
			type: savingsTransactions.type,
			amount: savingsTransactions.amount,
			note: savingsTransactions.note,
			reference: savingsTransactions.reference,
			createdAt: savingsTransactions.createdAt
		})
		.from(savingsTransactions)
		.where(eq(savingsTransactions.customerId, customerId))
		.orderBy(desc(savingsTransactions.createdAt))
		.limit(limit);
}

export async function getSavingsStats(customerId: string) {
	const [row] = await db
		.select({
			totalDeposits: sql<string>`coalesce(sum(case when ${savingsTransactions.type} = 'deposit' then ${savingsTransactions.amount} else 0 end), 0)`,
			totalWithdrawals: sql<string>`coalesce(sum(case when ${savingsTransactions.type} = 'withdraw' then ${savingsTransactions.amount} else 0 end), 0)`
		})
		.from(savingsTransactions)
		.where(eq(savingsTransactions.customerId, customerId));

	return {
		totalDeposits: Number(row?.totalDeposits ?? 0),
		totalWithdrawals: Number(row?.totalWithdrawals ?? 0)
	};
}

export async function listLoanAccountsByCustomer(customerId: string) {
	return db
		.select({
			id: loanAccounts.id,
			principal: loanAccounts.principal,
			balance: loanAccounts.balance,
			interestRate: loanAccounts.interestRate,
			termMonths: loanAccounts.termMonths,
			status: loanAccounts.status,
			issuedAt: loanAccounts.issuedAt,
			dueDate: loanAccounts.dueDate,
			notes: loanAccounts.notes,
			createdAt: loanAccounts.createdAt,
			totalPaid: sql<string>`coalesce(sum(case when ${loanTransactions.type} = 'repayment' then ${loanTransactions.amount} else 0 end), 0)`,
			interestAccrued: sql<string>`coalesce(sum(case when ${loanTransactions.type} = 'interest' then ${loanTransactions.amount} else 0 end), 0)`
		})
		.from(loanAccounts)
		.leftJoin(loanTransactions, eq(loanTransactions.loanId, loanAccounts.id))
		.where(eq(loanAccounts.customerId, customerId))
		.groupBy(
			loanAccounts.id,
			loanAccounts.principal,
			loanAccounts.balance,
			loanAccounts.interestRate,
			loanAccounts.termMonths,
			loanAccounts.status,
			loanAccounts.issuedAt,
			loanAccounts.dueDate,
			loanAccounts.notes,
			loanAccounts.createdAt
		)
		.orderBy(
			sql`case when ${loanAccounts.status} = 'active' then 0 when ${loanAccounts.status} = 'defaulted' then 1 else 2 end`,
			desc(loanAccounts.createdAt)
		);
}

export async function listRecentLoanTransactions(customerId: string, limit = defaultListLimit) {
	return db
		.select({
			id: loanTransactions.id,
			loanId: loanTransactions.loanId,
			type: loanTransactions.type,
			amount: loanTransactions.amount,
			note: loanTransactions.note,
			reference: loanTransactions.reference,
			createdAt: loanTransactions.createdAt
		})
		.from(loanTransactions)
		.innerJoin(loanAccounts, eq(loanAccounts.id, loanTransactions.loanId))
		.where(eq(loanAccounts.customerId, customerId))
		.orderBy(desc(loanTransactions.createdAt))
		.limit(limit);
}

export async function findLoanAccountById(loanId: string) {
	const [loan] = await db
		.select({
			id: loanAccounts.id,
			customerId: loanAccounts.customerId,
			principal: loanAccounts.principal,
			balance: loanAccounts.balance,
			status: loanAccounts.status,
			interestRate: loanAccounts.interestRate,
			termMonths: loanAccounts.termMonths,
			issuedAt: loanAccounts.issuedAt,
			dueDate: loanAccounts.dueDate,
			notes: loanAccounts.notes,
			totalPaid: sql<string>`coalesce(sum(case when ${loanTransactions.type} = 'repayment' then ${loanTransactions.amount} else 0 end), 0)`,
			interestAccrued: sql<string>`coalesce(sum(case when ${loanTransactions.type} = 'interest' then ${loanTransactions.amount} else 0 end), 0)`
		})
		.from(loanAccounts)
		.leftJoin(loanTransactions, eq(loanTransactions.loanId, loanAccounts.id))
		.where(eq(loanAccounts.id, loanId))
		.groupBy(
			loanAccounts.id,
			loanAccounts.customerId,
			loanAccounts.principal,
			loanAccounts.balance,
			loanAccounts.status,
			loanAccounts.interestRate,
			loanAccounts.termMonths,
			loanAccounts.issuedAt,
			loanAccounts.dueDate,
			loanAccounts.notes
		)
		.limit(1);

	return loan ?? null;
}

export async function updateLoanAccountBalance(dbClient: DB, loanId: string, newBalance: number, status: LoanStatus) {
	return dbClient
		.update(loanAccounts)
		.set({
			balance: newBalance.toString(),
			status,
			updatedAt: new Date()
		})
		.where(eq(loanAccounts.id, loanId))
		.returning({ id: loanAccounts.id });
}

export async function insertSavingsTransaction(dbClient: DB, values: typeof savingsTransactions.$inferInsert) {
	return dbClient.insert(savingsTransactions).values(values).returning({ id: savingsTransactions.id });
}

export async function insertLoanAccount(dbClient: DB, values: typeof loanAccounts.$inferInsert) {
	return dbClient.insert(loanAccounts).values(values).returning({ id: loanAccounts.id, balance: loanAccounts.balance, status: loanAccounts.status });
}

export async function insertLoanTransaction(dbClient: DB, values: typeof loanTransactions.$inferInsert) {
	return dbClient.insert(loanTransactions).values(values).returning({ id: loanTransactions.id });
}
