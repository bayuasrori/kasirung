import { db, type DB } from '$lib/db/client';
import {
	payments,
	transactionItems,
	transactions,
	users,
	customers,
	products
} from '$lib/db/schema';
import { and, asc, desc, eq, gte, ilike, isNotNull, lte, or, sql, sum } from 'drizzle-orm';

type DBTransaction = Parameters<Parameters<DB['transaction']>[0]>[0];

export async function createTransactionRecord(
	dbClient: DB,
	values: typeof transactions.$inferInsert,
	items: Array<typeof transactionItems.$inferInsert>,
	payment: typeof payments.$inferInsert,
	options: { afterInsert?: (tx: DBTransaction, context: { transactionId: string }) => Promise<void> } = {}
) {
	return dbClient.transaction(async (tx) => {
		const [createdTransaction] = await tx
			.insert(transactions)
			.values(values)
			.returning({ id: transactions.id });

		await tx.insert(transactionItems).values(items);
		await tx.insert(payments).values(payment);

		if (options.afterInsert) {
			await options.afterInsert(tx, { transactionId: createdTransaction.id });
		}

		return createdTransaction;
	});
}

export async function getTodaySummary() {
	const [summary] = await db
		.select({
			count: sql<number>`count(*)`,
			total: sql<string>`coalesce(sum(${transactions.total}), 0)`
		})
		.from(transactions)
		.where(sql`date_trunc('day', ${transactions.createdAt}) = date_trunc('day', now())`);

	return {
		count: Number(summary?.count ?? 0),
		total: Number(summary?.total ?? 0)
	};
}

export async function getDailySales(days = 7) {
	const startDate = new Date();
	startDate.setHours(0, 0, 0, 0);
	startDate.setDate(startDate.getDate() - days);

	const rows = await db
		.select({
			date: sql<string>`to_char(date_trunc('day', ${transactions.createdAt}), 'YYYY-MM-DD')`,
			count: sql<number>`count(*)`,
			total: sql<string>`coalesce(sum(${transactions.total}), 0)`
		})
		.from(transactions)
		.where(gte(transactions.createdAt, startDate))
		.groupBy(sql`date_trunc('day', ${transactions.createdAt})`)
		.orderBy(sql`date_trunc('day', ${transactions.createdAt})`);

	return rows.map((row) => ({
		date: row.date,
		count: Number(row.count ?? 0),
		total: Number(row.total ?? 0)
	}));
}

export async function listRecentTransactions(limit = 5) {
	return db
		.select({
			id: transactions.id,
			number: transactions.number,
			total: transactions.total,
			createdAt: transactions.createdAt,
			cashier: users.fullName,
			customer: customers.name
		})
		.from(transactions)
		.leftJoin(users, eq(users.id, transactions.userId))
		.leftJoin(customers, eq(customers.id, transactions.customerId))
		.orderBy(sql`${transactions.createdAt} DESC`)
		.limit(limit);
}

export async function findTransactionById(id: string) {
	const [transaction] = await db
		.select({
			id: transactions.id,
			createdAt: transactions.createdAt,
			status: transactions.status,
			total: transactions.total
		})
		.from(transactions)
		.where(eq(transactions.id, id))
		.limit(1);

	return transaction ?? null;
}

export async function findTransactionForReceipt(id: string) {
	const [transaction] = await db
		.select({
			id: transactions.id,
			number: transactions.number,
			createdAt: transactions.createdAt,
			subtotal: transactions.subtotal,
			tax: transactions.tax,
			discount: transactions.discount,
			total: transactions.total,
			note: transactions.note,
			cashier: users.fullName,
			customer: customers.name
		})
		.from(transactions)
		.leftJoin(users, eq(users.id, transactions.userId))
		.leftJoin(customers, eq(customers.id, transactions.customerId))
		.where(eq(transactions.id, id))
		.limit(1);

	if (!transaction) {
		return null;
	}

	const items = await db
		.select({
			productId: products.id,
			name: products.name,
			sku: products.sku,
			quantity: transactionItems.quantity,
			unitPrice: transactionItems.unitPrice,
			totalPrice: transactionItems.totalPrice
		})
		.from(transactionItems)
		.innerJoin(products, eq(products.id, transactionItems.productId))
		.where(eq(transactionItems.transactionId, id))
		.orderBy(asc(transactionItems.createdAt));

	return {
		...transaction,
		items
	};
}

interface CustomerLedgerParams {
	customerId: string;
	limit: number;
	offset: number;
	startDate?: Date;
	endDate?: Date;
	paymentStatus?: 'all' | 'paid' | 'pending';
}

const buildCustomerLedgerWhere = (params: CustomerLedgerParams) => {
	const { customerId, startDate, endDate, paymentStatus } = params;
	const conditions: Array<any> = [eq(transactions.customerId, customerId)];

	if (startDate) {
		conditions.push(gte(transactions.createdAt, startDate));
	}

	if (endDate) {
		conditions.push(lte(transactions.createdAt, endDate));
	}


	const creditOutstandingCondition = sql`${payments.method} = 'credit' AND ${payments.amount} > 0`;

	if (paymentStatus === 'paid') {
		conditions.push(sql`NOT (${creditOutstandingCondition})`);
	} else if (paymentStatus === 'pending') {
		conditions.push(creditOutstandingCondition);
	}

	return conditions.length === 1
		? conditions[0]
		: and(...(conditions as [any, ...any[]]));
};

export async function findCustomerTransactions(params: CustomerLedgerParams) {
	const whereClause = buildCustomerLedgerWhere(params);

	const data = await db
		.select({
			id: transactions.id,
			number: transactions.number,
			createdAt: transactions.createdAt,
			subtotal: transactions.subtotal,
			tax: transactions.tax,
			discount: transactions.discount,
			total: transactions.total,
			status: transactions.status,
			paymentStatus: payments.status,
			paymentMethod: payments.method,
			paymentAmount: payments.amount,
			cashier: users.fullName
		})
		.from(transactions)
		.innerJoin(payments, eq(payments.transactionId, transactions.id))
		.leftJoin(users, eq(users.id, transactions.userId))
		.where(whereClause)
		.orderBy(desc(transactions.createdAt))
		.limit(params.limit)
		.offset(params.offset);

	const [{ count }] = await db
		.select({ count: sql<number>`count(*)` })
		.from(transactions)
		.innerJoin(payments, eq(payments.transactionId, transactions.id))
		.where(whereClause);

	return { data, total: Number(count ?? 0) };
}

export async function getCustomerLedgerSummary(params: CustomerLedgerParams) {
	const whereClause = buildCustomerLedgerWhere(params);

	const [row] = await db
		.select({
			totalTransactions: sql<number>`count(*)`,
			totalAmount: sql<string>`coalesce(sum(${transactions.total}), 0)`,
			pendingAmount: sql<string>`coalesce(sum(case when ${payments.method} = 'credit' and ${payments.amount} > 0 then ${payments.amount} else 0 end), 0)`,
			pendingCount: sql<number>`coalesce(sum(case when ${payments.method} = 'credit' and ${payments.amount} > 0 then 1 else 0 end), 0)`,
			lastTransactionAt: sql<Date | null>`max(${transactions.createdAt})`
		})
		.from(transactions)
		.innerJoin(payments, eq(payments.transactionId, transactions.id))
		.where(whereClause);

	const latest = row?.lastTransactionAt ?? null;

	return {
		totalTransactions: Number(row?.totalTransactions ?? 0),
		totalAmount: Number(row?.totalAmount ?? 0),
		pendingAmount: Number(row?.pendingAmount ?? 0),
		pendingCount: Number(row?.pendingCount ?? 0),
		lastTransactionAt: latest
	};
}

export async function listCustomerOutstandingTransactions(customerId: string) {
	const rows = await db
		.select({
			id: transactions.id,
			number: transactions.number,
			createdAt: transactions.createdAt,
			total: transactions.total,
			status: transactions.status,
			paymentStatus: payments.status,
			paymentAmount: payments.amount
		})
		.from(transactions)
		.innerJoin(payments, eq(payments.transactionId, transactions.id))
		.where(
			and(
				eq(transactions.customerId, customerId),
				eq(payments.method, 'credit'),
				sql`${payments.amount} > 0`
			)
		)
		.orderBy(desc(transactions.createdAt));

	return rows;
}

export async function deleteTransactionCascade(id: string) {
	return db.transaction(async (tx) => {
		await tx.delete(transactionItems).where(eq(transactionItems.transactionId, id));
		await tx.delete(payments).where(eq(payments.transactionId, id));
		const result = await tx.delete(transactions).where(eq(transactions.id, id)).returning({ id: transactions.id });
		return result.length > 0;
	});
}

interface FindTransactionsParams {
	search?: string;
	startDate?: Date;
	endDate?: Date;
	limit: number;
	offset: number;
}

export async function findTransactions(params: FindTransactionsParams) {
	const { search, startDate, endDate, limit, offset } = params;
	const conditions: Array<any> = [];

	if (search) {
		conditions.push(
			or(
				ilike(transactions.number, `%${search}%`),
				ilike(users.fullName, `%${search}%`),
				ilike(customers.name, `%${search}%`)
			)
		);
	}

	if (startDate) {
		conditions.push(gte(transactions.createdAt, startDate));
	}

	if (endDate) {
		conditions.push(lte(transactions.createdAt, endDate));
	}

	const whereClause =
		conditions.length === 0
			? undefined
			: conditions.length === 1
					? conditions[0]
					: and(...conditions);

	const baseQuery = db
		.select({
			id: transactions.id,
			number: transactions.number,
			subtotal: transactions.subtotal,
			tax: transactions.tax,
			discount: transactions.discount,
			total: transactions.total,
			status: transactions.status,
			createdAt: transactions.createdAt,
			cashier: users.fullName,
			customer: customers.name
		})
		.from(transactions)
		.leftJoin(users, eq(users.id, transactions.userId))
		.leftJoin(customers, eq(customers.id, transactions.customerId));

	const filteredQuery = whereClause ? baseQuery.where(whereClause) : baseQuery;

	const data = await filteredQuery.orderBy(desc(transactions.createdAt)).limit(limit).offset(offset);

	const baseCountQuery = db
		.select({ count: sql<number>`count(*)` })
		.from(transactions)
		.leftJoin(users, eq(users.id, transactions.userId))
		.leftJoin(customers, eq(customers.id, transactions.customerId));

	const filteredCountQuery = whereClause ? baseCountQuery.where(whereClause) : baseCountQuery;

	const [{ count }] = await filteredCountQuery;

	return { data, total: Number(count ?? 0) };
}

export async function getTopProducts(limit = 5) {
	const rows = await db
		.select({
			productId: transactionItems.productId,
			name: products.name,
			totalQuantity: sum(transactionItems.quantity)
		})
		.from(transactionItems)
		.innerJoin(transactions, eq(transactionItems.transactionId, transactions.id))
		.innerJoin(products, eq(transactionItems.productId, products.id))
		.groupBy(transactionItems.productId, products.name)
		.orderBy(sql`sum(${transactionItems.quantity}) DESC`)
		.limit(limit);

	return rows.map((row) => ({
		productId: row.productId,
		name: row.name,
		quantity: Number(row.totalQuantity ?? 0)
	}));
}

const buildReportClause = (startDate?: Date, endDate?: Date) => {
	const conditions: Array<any> = [eq(transactions.status, 'completed')];
	if (startDate) {
		conditions.push(gte(transactions.createdAt, startDate));
	}
	if (endDate) {
		conditions.push(lte(transactions.createdAt, endDate));
	}
	return conditions.length === 1
		? conditions[0]
		: and(...(conditions as [any, ...any[]]));
};

export async function getSalesSummaryInRange(startDate?: Date, endDate?: Date) {
	const whereClause = buildReportClause(startDate, endDate);
	const baseQuery = db
		.select({
			total: sql<string>`coalesce(sum(${transactions.total}), 0)`,
			subtotal: sql<string>`coalesce(sum(${transactions.subtotal}), 0)`,
			tax: sql<string>`coalesce(sum(${transactions.tax}), 0)`,
			discount: sql<string>`coalesce(sum(${transactions.discount}), 0)`,
			count: sql<number>`count(*)`,
			average: sql<string>`coalesce(avg(${transactions.total}), 0)`,
			uniqueCustomers: sql<number>`count(distinct ${transactions.customerId})`
		})
		.from(transactions);

	const rows = await baseQuery.where(whereClause);
	const [row] = rows;

	return {
		total: Number(row?.total ?? 0),
		subtotal: Number(row?.subtotal ?? 0),
		tax: Number(row?.tax ?? 0),
		discount: Number(row?.discount ?? 0),
		count: Number(row?.count ?? 0),
		average: Number(row?.average ?? 0),
		uniqueCustomers: Number(row?.uniqueCustomers ?? 0)
	};
}

export async function getSalesTrendInRange(startDate: Date, endDate: Date) {
	const whereClause = buildReportClause(startDate, endDate);
	const baseQuery = db
		.select({
			date: sql<string>`to_char(date_trunc('day', ${transactions.createdAt}), 'YYYY-MM-DD')`,
			total: sql<string>`coalesce(sum(${transactions.total}), 0)`,
			subtotal: sql<string>`coalesce(sum(${transactions.subtotal}), 0)`,
			tax: sql<string>`coalesce(sum(${transactions.tax}), 0)`,
			discount: sql<string>`coalesce(sum(${transactions.discount}), 0)`,
			count: sql<number>`count(*)`
		})
		.from(transactions)
		.groupBy(sql`date_trunc('day', ${transactions.createdAt})`)
		.orderBy(sql`date_trunc('day', ${transactions.createdAt})`);

	const rows = await baseQuery.where(whereClause);

	return rows.map((row) => ({
		date: row.date,
		total: Number(row.total ?? 0),
		subtotal: Number(row.subtotal ?? 0),
		tax: Number(row.tax ?? 0),
		discount: Number(row.discount ?? 0),
		count: Number(row.count ?? 0)
	}));
}

export async function getPaymentBreakdownInRange(startDate?: Date, endDate?: Date) {
	const whereClause = buildReportClause(startDate, endDate);
	const baseQuery = db
		.select({
			method: payments.method,
			amount: sql<string>`coalesce(sum(${payments.amount}), 0)`,
			count: sql<number>`count(*)`
		})
		.from(payments)
		.innerJoin(transactions, eq(payments.transactionId, transactions.id))
		.where(whereClause)
		.groupBy(payments.method)
		.orderBy(sql`sum(${payments.amount}) DESC`);

	const rows = await baseQuery;

	return rows.map((row) => ({
		method: row.method,
		amount: Number(row.amount ?? 0),
		count: Number(row.count ?? 0)
	}));
}

export async function getTopProductsInRange(params: { startDate?: Date; endDate?: Date; limit?: number }) {
	const { startDate, endDate, limit = 5 } = params;
	const whereClause = buildReportClause(startDate, endDate);
	const baseQuery = db
		.select({
			productId: products.id,
			name: products.name,
			quantity: sum(transactionItems.quantity),
			revenue: sql<string>`coalesce(sum(${transactionItems.totalPrice}), 0)`
		})
		.from(transactionItems)
		.innerJoin(transactions, eq(transactionItems.transactionId, transactions.id))
		.innerJoin(products, eq(transactionItems.productId, products.id))
		.where(whereClause)
		.groupBy(products.id, products.name)
		.orderBy(sql`sum(${transactionItems.totalPrice}) DESC`)
		.limit(limit);

	const rows = await baseQuery;

	return rows.map((row) => ({
		productId: row.productId,
		name: row.name,
		quantity: Number(row.quantity ?? 0),
		revenue: Number(row.revenue ?? 0)
	}));
}

export async function getTopCustomersInRange(params: { startDate?: Date; endDate?: Date; limit?: number }) {
	const { startDate, endDate, limit = 5 } = params;
	const baseClause = buildReportClause(startDate, endDate);
	const clause = and(baseClause, isNotNull(transactions.customerId));
	const baseQuery = db
		.select({
			customerId: customers.id,
			name: customers.name,
			total: sql<string>`coalesce(sum(${transactions.total}), 0)`,
			count: sql<number>`count(*)`
		})
		.from(transactions)
		.innerJoin(customers, eq(transactions.customerId, customers.id))
		.where(clause)
		.groupBy(customers.id, customers.name)
		.orderBy(sql`sum(${transactions.total}) DESC`)
		.limit(limit);

	const rows = await baseQuery;

	return rows.map((row) => ({
		customerId: row.customerId,
		name: row.name,
		total: Number(row.total ?? 0),
		count: Number(row.count ?? 0)
	}));
}
