import { db, type DB } from '$lib/db/client';
import { accountingBudgetItems, accountingBudgetPlans, budgetScenarioEnum } from '$lib/db/schema';
import { and, asc, eq } from 'drizzle-orm';

type TransactionLike = DB | Parameters<Parameters<DB['transaction']>[0]>[0];

type BudgetScenario = (typeof budgetScenarioEnum.enumValues)[number];

export async function findBudgetPlanByYearScenario(year: number, scenario: BudgetScenario) {
	const [plan] = await db
		.select({
			id: accountingBudgetPlans.id,
			year: accountingBudgetPlans.year,
			scenario: accountingBudgetPlans.scenario,
			notes: accountingBudgetPlans.notes,
			createdBy: accountingBudgetPlans.createdBy,
			createdAt: accountingBudgetPlans.createdAt,
			updatedAt: accountingBudgetPlans.updatedAt
		})
		.from(accountingBudgetPlans)
		.where(
			and(
				eq(accountingBudgetPlans.year, year),
				eq(accountingBudgetPlans.scenario, scenario)
			)
		)
		.limit(1);

	if (!plan) {
		return null;
	}

	const items = await db
		.select({
			id: accountingBudgetItems.id,
			planId: accountingBudgetItems.planId,
			type: accountingBudgetItems.type,
			accountId: accountingBudgetItems.accountId,
			accountCode: accountingBudgetItems.accountCode,
			accountName: accountingBudgetItems.accountName,
			currentAmount: accountingBudgetItems.currentAmount,
			plannedAmount: accountingBudgetItems.plannedAmount,
			note: accountingBudgetItems.note,
			createdAt: accountingBudgetItems.createdAt,
			updatedAt: accountingBudgetItems.updatedAt
		})
		.from(accountingBudgetItems)
		.where(eq(accountingBudgetItems.planId, plan.id))
		.orderBy(asc(accountingBudgetItems.type), asc(accountingBudgetItems.accountCode));

	return { plan, items };
}

export async function listBudgetYears() {
	const rows = await db
		.select({ year: accountingBudgetPlans.year })
		.from(accountingBudgetPlans)
		.groupBy(accountingBudgetPlans.year)
		.orderBy(asc(accountingBudgetPlans.year));

	return rows.map((row) => row.year);
}

export async function insertBudgetPlan(dbClient: TransactionLike, values: typeof accountingBudgetPlans.$inferInsert) {
	return dbClient
		.insert(accountingBudgetPlans)
		.values(values)
		.returning({ id: accountingBudgetPlans.id });
}

export async function updateBudgetPlan(
	dbClient: TransactionLike,
	id: string,
	values: Partial<typeof accountingBudgetPlans.$inferInsert>
) {
	return dbClient
		.update(accountingBudgetPlans)
		.set({ ...values, updatedAt: new Date() })
		.where(eq(accountingBudgetPlans.id, id))
		.returning({ id: accountingBudgetPlans.id });
}

export async function removeBudgetItemsByPlan(dbClient: TransactionLike, planId: string) {
	return dbClient.delete(accountingBudgetItems).where(eq(accountingBudgetItems.planId, planId));
}

export async function insertBudgetItems(
	dbClient: TransactionLike,
	values: Array<typeof accountingBudgetItems.$inferInsert>
) {
	if (!values.length) {
		return [] as Array<{ id: string }>;
	}

	return dbClient
		.insert(accountingBudgetItems)
		.values(values)
		.returning({ id: accountingBudgetItems.id });
}
