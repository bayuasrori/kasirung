import { and, asc, desc, eq, ilike, or, sql } from 'drizzle-orm';

import { db } from '$lib/db/client';
import { customers, transactions, payments } from '$lib/db/schema';

type SortKey = 'createdAt' | 'name';

const sortColumns: Record<SortKey, any> = {
	createdAt: customers.createdAt,
	name: customers.name
};

interface FindCustomersParams {
	search?: string;
	limit: number;
	offset: number;
	sortBy?: SortKey;
	sortDir?: 'asc' | 'desc';
}

export async function findCustomers(params: FindCustomersParams) {
	const { search, limit, offset, sortBy = 'createdAt', sortDir = 'desc' } = params;
	const searchCondition = search
		? or(
			ilike(customers.name, `%${search}%`),
			ilike(customers.email, `%${search}%`),
			ilike(customers.phone, `%${search}%`)
		)
		: undefined;
	const whereClause = searchCondition ?? undefined;
	const orderColumn = sortColumns[sortBy] ?? customers.createdAt;
	const order = sortDir === 'asc' ? asc(orderColumn) : desc(orderColumn);

	const data = await db
		.select({
			id: customers.id,
			name: customers.name,
			email: customers.email,
			phone: customers.phone,
			address: customers.address,
			notes: customers.notes,
			createdAt: customers.createdAt,
			updatedAt: customers.updatedAt,
			transactionCount: sql<number>`count(${transactions.id})`,
			totalSpentThisMonth: sql<string>`coalesce(sum(${transactions.total}) filter (where date_trunc('month', ${transactions.createdAt}) = date_trunc('month', now())), 0)`,
				outstandingThisMonth: sql<string>`coalesce(sum(${payments.amount}) filter (where date_trunc('month', ${transactions.createdAt}) = date_trunc('month', now()) and ${payments.method} = 'credit' and ${payments.amount} > 0), 0)`
		})
		.from(customers)
		.leftJoin(transactions, eq(transactions.customerId, customers.id))
		.leftJoin(payments, eq(payments.transactionId, transactions.id))
		.where(whereClause)
		.groupBy(customers.id)
		.orderBy(order)
		.limit(limit)
		.offset(offset);

	const [{ count }] = await db
		.select({ count: sql<number>`count(*)` })
		.from(customers)
		.where(whereClause);

	return { data, total: Number(count) };
}

export async function insertCustomer(values: typeof customers.$inferInsert) {
	return db.insert(customers).values(values).returning({ id: customers.id }).then((rows) => rows[0]);
}

export async function updateCustomer(id: string, values: Partial<typeof customers.$inferInsert>) {
	return db
		.update(customers)
		.set(values)
		.where(eq(customers.id, id))
		.returning({ id: customers.id })
		.then((rows) => rows[0]);
}

export async function deleteCustomer(id: string) {
	return db.delete(customers).where(eq(customers.id, id));
}

export async function findCustomerById(id: string) {
	const [customer] = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
	return customer;
}

export async function listAllCustomers() {
	return db
		.select({ id: customers.id, name: customers.name })
		.from(customers)
		.orderBy(asc(customers.name));
}
