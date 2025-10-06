import { and, asc, desc, eq, ilike, or, sql } from 'drizzle-orm';

import { db } from '$lib/db/client';
import { roles, users } from '$lib/db/schema';

type SortKey = 'createdAt' | 'fullName' | 'email';

const sortColumns: Record<SortKey, any> = {
	createdAt: users.createdAt,
	fullName: users.fullName,
	email: users.email
};

interface FindUsersParams {
	search?: string;
	roleId?: number;
	isActive?: boolean;
	limit: number;
	offset: number;
	sortBy?: SortKey;
	sortDir?: 'asc' | 'desc';
}

export async function findUsers(params: FindUsersParams) {
	const { search, roleId, isActive, limit, offset, sortBy = 'createdAt', sortDir = 'desc' } = params;
	const conditions = [] as any[];

	if (search) {
		const pattern = `%${search}%`;
		conditions.push(or(ilike(users.fullName, pattern), ilike(users.email, pattern)));
	}

	if (typeof roleId === 'number') {
		conditions.push(eq(users.roleId, roleId));
	}

	if (typeof isActive === 'boolean') {
		conditions.push(eq(users.isActive, isActive));
	}

	const whereClause = conditions.length ? and(...conditions) : undefined;
	const orderColumn = sortColumns[sortBy] ?? users.createdAt;
	const order = sortDir === 'asc' ? asc(orderColumn) : desc(orderColumn);

	const data = await db
		.select({
			id: users.id,
			fullName: users.fullName,
			email: users.email,
			avatarUrl: users.avatarUrl,
			isActive: users.isActive,
			roleId: users.roleId,
			roleName: roles.name,
			createdAt: users.createdAt,
			updatedAt: users.updatedAt
		})
		.from(users)
		.innerJoin(roles, eq(users.roleId, roles.id))
		.where(whereClause)
		.orderBy(order)
		.limit(limit)
		.offset(offset);

	const [{ count }] = await db
		.select({ count: sql<number>`count(*)` })
		.from(users)
		.where(whereClause);

	return { data, total: Number(count) };
}

export async function findUserById(id: string) {
	const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
	return user;
}

export async function findUserByEmail(email: string) {
	const [user] = await db
		.select()
		.from(users)
		.where(eq(users.email, email))
		.limit(1);
	return user;
}

export async function insertUser(values: typeof users.$inferInsert) {
	return db
		.insert(users)
		.values(values)
		.returning({
			id: users.id,
			fullName: users.fullName,
			email: users.email,
			roleId: users.roleId
		})
		.then((rows) => rows[0]);
}

export async function updateUser(id: string, values: Partial<typeof users.$inferInsert>) {
	return db
		.update(users)
		.set(values)
		.where(eq(users.id, id))
		.returning({ id: users.id })
		.then((rows) => rows[0]);
}

export async function updateUserPassword(id: string, passwordHash: string) {
	return db
		.update(users)
		.set({ passwordHash, updatedAt: new Date() })
		.where(eq(users.id, id))
		.returning({ id: users.id })
		.then((rows) => rows[0]);
}

export async function updateUserStatus(id: string, isActive: boolean) {
	return db
		.update(users)
		.set({ isActive, updatedAt: new Date() })
		.where(eq(users.id, id))
		.returning({ id: users.id, isActive: users.isActive })
		.then((rows) => rows[0]);
}
