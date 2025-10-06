import { and, asc, desc, eq, ilike, inArray, isNull, or, sql } from 'drizzle-orm';

import { db } from '$lib/db/client';
import { categories, products } from '$lib/db/schema';

type SortKey = 'createdAt' | 'name' | 'price';

const sortColumns: Record<SortKey, any> = {
	createdAt: products.createdAt,
	name: products.name,
	price: products.price
};

interface FindProductsParams {
	search?: string;
	categoryId?: number | null;
	limit: number;
	offset: number;
	sortBy?: SortKey;
	sortDir?: 'asc' | 'desc';
}

export async function findProducts(params: FindProductsParams) {
	const { search, categoryId, limit, offset, sortBy = 'createdAt', sortDir = 'desc' } = params;
	const searchCondition = search
		? or(ilike(products.name, `%${search}%`), ilike(products.sku, `%${search}%`))
		: undefined;
	const where = [searchCondition, categoryId ? eq(products.categoryId, categoryId) : undefined].filter(
		Boolean
	);

	const orderColumn = sortColumns[sortBy] ?? products.createdAt;
	const order = sortDir === 'asc' ? asc(orderColumn) : desc(orderColumn);

	const whereClause = where.length === 0 ? undefined : where.length === 1 ? where[0] : and(...(where as [any, ...any[]]));

	const result = await db
		.select({
			id: products.id,
			sku: products.sku,
			name: products.name,
			description: products.description,
			price: products.price,
			isActive: products.isActive,
			categoryId: products.categoryId,
			categoryName: categories.name,
			createdAt: products.createdAt,
			updatedAt: products.updatedAt
		})
		.from(products)
		.leftJoin(categories, eq(products.categoryId, categories.id))
		.where(whereClause)
		.orderBy(order)
		.limit(limit)
		.offset(offset);

	const [{ count }] = await db
		.select({ count: sql<number>`count(*)` })
		.from(products)
		.where(whereClause);

	return {
		data: result,
		total: Number(count)
	};
}

export async function insertProduct(values: typeof products.$inferInsert) {
	return db.insert(products).values(values).returning({ id: products.id }).then((rows) => rows[0]);
}

export async function updateProduct(id: string, values: Partial<typeof products.$inferInsert>) {
	return db
		.update(products)
		.set(values)
		.where(eq(products.id, id))
		.returning({ id: products.id })
		.then((rows) => rows[0]);
}

export async function deleteProduct(id: string) {
	return db.delete(products).where(eq(products.id, id));
}

export async function findProductById(id: string) {
	const [product] = await db
		.select({
			id: products.id,
			sku: products.sku,
			name: products.name,
			description: products.description,
			price: products.price,
			categoryId: products.categoryId,
			isActive: products.isActive
		})
		.from(products)
		.where(eq(products.id, id))
		.limit(1);
	return product;
}

export async function findActiveProductsByCategory(categoryId?: number | null) {
	const conditions = [eq(products.isActive, true)];
	if (categoryId === null) {
		conditions.push(isNull(products.categoryId));
	} else if (categoryId) {
		conditions.push(eq(products.categoryId, categoryId));
	}
	const whereClause =
		conditions.length === 1 ? conditions[0] : and(...(conditions as [any, ...any[]]));
	return db
		.select({
			id: products.id,
			sku: products.sku,
			name: products.name,
			price: products.price,
			categoryId: products.categoryId
		})
		.from(products)
		.where(whereClause)
		.orderBy(asc(products.name));
}

export async function findProductsByIds(ids: string[]) {
	if (!ids.length) return [];
	return db
		.select({
			id: products.id,
			name: products.name,
			price: products.price,
			isActive: products.isActive
		})
		.from(products)
		.where(inArray(products.id, ids));
}
