import { and, asc, desc, eq, ilike, sql } from 'drizzle-orm';

import { db } from '$lib/db/client';
import { categories, products } from '$lib/db/schema';

type SortKey = 'createdAt' | 'name';

const sortColumns: Record<SortKey, any> = {
	createdAt: categories.createdAt,
	name: categories.name
};

interface FindCategoriesParams {
	search?: string;
	limit: number;
	offset: number;
	sortBy?: SortKey;
	sortDir?: 'asc' | 'desc';
}

export async function findCategories(params: FindCategoriesParams) {
	const { search, limit, offset, sortBy = 'createdAt', sortDir = 'desc' } = params;
	const searchCondition = search ? ilike(categories.name, `%${search}%`) : undefined;
	const whereClause = searchCondition ? searchCondition : undefined;
	const orderColumn = sortColumns[sortBy] ?? categories.createdAt;
	const order = sortDir === 'asc' ? asc(orderColumn) : desc(orderColumn);

	const data = await db
		.select({
			id: categories.id,
			name: categories.name,
			description: categories.description,
			createdAt: categories.createdAt,
			updatedAt: categories.updatedAt,
			productCount: sql<number>`count(${products.id})`
		})
		.from(categories)
		.leftJoin(products, eq(products.categoryId, categories.id))
		.where(whereClause)
		.groupBy(categories.id)
		.orderBy(order)
		.limit(limit)
		.offset(offset);

	const [{ count }] = await db
		.select({ count: sql<number>`count(*)` })
		.from(categories)
		.where(whereClause);

	return { data, total: Number(count) };
}

export async function insertCategory(values: typeof categories.$inferInsert) {
	return db.insert(categories).values(values).returning({ id: categories.id }).then((rows) => rows[0]);
}

export async function updateCategory(id: number, values: Partial<typeof categories.$inferInsert>) {
	return db
		.update(categories)
		.set(values)
		.where(eq(categories.id, id))
		.returning({ id: categories.id })
		.then((rows) => rows[0]);
}

export async function deleteCategory(id: number) {
	return db.delete(categories).where(eq(categories.id, id));
}

export async function findCategoryById(id: number) {
	const [category] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
	return category;
}

export async function listAllCategories() {
	return db
		.select({ id: categories.id, name: categories.name })
		.from(categories)
		.orderBy(asc(categories.name));
}
