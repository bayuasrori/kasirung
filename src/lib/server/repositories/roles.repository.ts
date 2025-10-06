import { asc, desc, eq, ilike, sql } from 'drizzle-orm';

import { db } from '$lib/db/client';
import { roles, users } from '$lib/db/schema';

type SortKey = 'createdAt' | 'name';

const sortColumns: Record<SortKey, any> = {
	createdAt: roles.createdAt,
	name: roles.name
};

interface FindRolesParams {
	search?: string;
	limit: number;
	offset: number;
	sortBy?: SortKey;
	sortDir?: 'asc' | 'desc';
}

let permissionsColumnEnsured = false;

async function ensureRolePermissionsColumn() {
	if (permissionsColumnEnsured) return;
	await db.execute(
		sql`ALTER TABLE roles ADD COLUMN IF NOT EXISTS permissions jsonb NOT NULL DEFAULT '[]'::jsonb`
	);
	permissionsColumnEnsured = true;
}

export async function findRoles(params: FindRolesParams) {
	await ensureRolePermissionsColumn();
	const { search, limit, offset, sortBy = 'createdAt', sortDir = 'desc' } = params;
	const searchCondition = search ? ilike(roles.name, `%${search}%`) : undefined;
	const whereClause = searchCondition ? searchCondition : undefined;
	const orderColumn = sortColumns[sortBy] ?? roles.createdAt;
	const order = sortDir === 'asc' ? asc(orderColumn) : desc(orderColumn);

	const data = await db
		.select({
			id: roles.id,
			name: roles.name,
			description: roles.description,
			permissions: roles.permissions,
			createdAt: roles.createdAt,
			updatedAt: roles.updatedAt,
			userCount: sql<number>`count(${users.id})`
		})
		.from(roles)
		.leftJoin(users, eq(users.roleId, roles.id))
		.where(whereClause)
		.groupBy(roles.id)
		.orderBy(order)
		.limit(limit)
		.offset(offset);

	const [{ count }] = await db
		.select({ count: sql<number>`count(*)` })
		.from(roles)
		.where(whereClause);

	return { data, total: Number(count) };
}

export async function listAllRoles() {
	await ensureRolePermissionsColumn();
	return db.select({ id: roles.id, name: roles.name }).from(roles).orderBy(asc(roles.name));
}

export async function findRoleById(id: number) {
	await ensureRolePermissionsColumn();
	const [role] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
	return role;
}

export async function findRoleByName(name: string) {
	await ensureRolePermissionsColumn();
	const [role] = await db.select().from(roles).where(ilike(roles.name, name)).limit(1);
	return role;
}

export async function insertRole(values: typeof roles.$inferInsert) {
	await ensureRolePermissionsColumn();
	return db
		.insert(roles)
		.values(values)
		.returning({
			id: roles.id,
			name: roles.name,
			description: roles.description,
			permissions: roles.permissions,
			createdAt: roles.createdAt,
			updatedAt: roles.updatedAt
		})
		.then((rows) => rows[0]);
}

export async function updateRole(id: number, values: Partial<typeof roles.$inferInsert>) {
	await ensureRolePermissionsColumn();
	return db
		.update(roles)
		.set(values)
		.where(eq(roles.id, id))
		.returning({
			id: roles.id,
			name: roles.name,
			description: roles.description,
			permissions: roles.permissions,
			createdAt: roles.createdAt,
			updatedAt: roles.updatedAt
		})
		.then((rows) => rows[0]);
}

export async function deleteRole(id: number) {
	await ensureRolePermissionsColumn();
	return db.delete(roles).where(eq(roles.id, id));
}

export async function countUsersForRole(roleId: number) {
	await ensureRolePermissionsColumn();
	const [{ count }] = await db
		.select({ count: sql<number>`count(*)` })
		.from(users)
		.where(eq(users.roleId, roleId));
	return Number(count);
}
