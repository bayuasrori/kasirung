import { randomUUID } from 'crypto';
import { z } from 'zod';

import { db } from '$lib/db/client';
import { accountingBudgetItems } from '$lib/db/schema';
import {
	findBudgetPlanByYearScenario,
	insertBudgetItems,
	insertBudgetPlan,
	listBudgetYears,
	removeBudgetItemsByPlan,
	updateBudgetPlan
} from '$lib/server/repositories/accounting-budgets.repository';

export const budgetScenarioValues = ['baseline', 'optimistic', 'conservative'] as const;
export type BudgetScenario = (typeof budgetScenarioValues)[number];

const budgetRowSchema = z.object({
	code: z.string().trim().min(1, 'Kode akun wajib diisi'),
	name: z.string().trim().min(1, 'Nama akun wajib diisi'),
	current: z.coerce.number().min(0, 'Realisasi minimal 0').default(0),
	planned: z.coerce.number().min(0, 'Target minimal 0').default(0),
	note: z.string().optional()
});

const saveBudgetSchema = z.object({
	year: z.coerce.number().int().min(2000).max(2100),
	scenario: z.enum(budgetScenarioValues),
	notes: z.string().trim().max(2000).optional().default(''),
	revenue: z.array(budgetRowSchema).default([]),
	expense: z.array(budgetRowSchema).default([])
});

export async function loadBudgetSnapshot(params: {
	year?: number;
	scenario?: BudgetScenario;
}) {
	const requestedYear = params.year ?? new Date().getFullYear();
	const requestedScenario = params.scenario ?? 'baseline';

	const existingYears = await listBudgetYears();
	const uniqueYears = Array.from(new Set([...existingYears, requestedYear])).sort((a, b) => a - b);

	const existing = await findBudgetPlanByYearScenario(requestedYear, requestedScenario);

	const plan = existing?.plan ?? null;
	const items = existing?.items ?? [];

	const revenue = items
		.filter((item) => item.type === 'revenue')
		.map((item) => ({
			id: item.id,
			code: item.accountCode,
			name: item.accountName,
			current: Number(item.currentAmount ?? 0),
			planned: Number(item.plannedAmount ?? 0),
			note: item.note ?? undefined
		}));

	const expense = items
		.filter((item) => item.type === 'expense')
		.map((item) => ({
			id: item.id,
			code: item.accountCode,
			name: item.accountName,
			current: Number(item.currentAmount ?? 0),
			planned: Number(item.plannedAmount ?? 0),
			note: item.note ?? undefined
		}));

	return {
		plan: plan
			? {
				id: plan.id,
				year: plan.year,
				scenario: plan.scenario,
				notes: plan.notes ?? '',
				updatedAt: plan.updatedAt
			}
			: null,
		revenue,
		expense,
		notes: plan?.notes ?? '',
		year: requestedYear,
		scenario: requestedScenario,
		availableYears: uniqueYears
	};
}

function normalizeRows(rows: Array<z.infer<typeof budgetRowSchema>>) {
	return rows
		.map((row) => ({
			code: row.code.trim(),
			name: row.name.trim(),
			current: row.current,
			planned: row.planned,
			note: row.note?.trim() || null
		}))
		.filter((row) => row.code.length > 0 && row.name.length > 0);
}

function formatAmount(value: number) {
	return value.toFixed(2);
}

export async function saveBudgetPlan(userId: string | null, payload: Record<string, unknown>) {
	const parsed = saveBudgetSchema.safeParse(payload);
	if (!parsed.success) {
		return { success: false, errors: parsed.error.flatten().fieldErrors } as const;
	}

	const data = parsed.data;
	const planNotes = data.notes?.trim() ?? '';

	const revenueRows = normalizeRows(data.revenue);
	const expenseRows = normalizeRows(data.expense);

	if (!revenueRows.length && !expenseRows.length) {
		return {
			success: false,
			errors: {
				revenue: ['Tambahkan minimal satu baris anggaran pendapatan atau beban sebelum menyimpan']
			}
		} as const;
	}

	const now = new Date();

	await db.transaction(async (tx) => {
		const existing = await findBudgetPlanByYearScenario(data.year, data.scenario);

		let planId: string;

		if (existing?.plan) {
			planId = existing.plan.id;
			await updateBudgetPlan(tx, planId, {
				notes: planNotes || null
			});
			await removeBudgetItemsByPlan(tx, planId);
		} else {
			const [created] = await insertBudgetPlan(tx, {
				id: randomUUID(),
				year: data.year,
				scenario: data.scenario,
				notes: planNotes || null,
				createdBy: userId,
				createdAt: now,
				updatedAt: now
			});
			planId = created.id;
		}

		const items = [...revenueRows.map((row) => ({
			planId,
			type: 'revenue' as const,
			accountId: null,
			accountCode: row.code,
			accountName: row.name,
			currentAmount: formatAmount(row.current),
			plannedAmount: formatAmount(row.planned),
			note: row.note ? row.note : null,
			createdAt: now,
			updatedAt: now
		})),
		...expenseRows.map((row) => ({
			planId,
			type: 'expense' as const,
			accountId: null,
			accountCode: row.code,
			accountName: row.name,
			currentAmount: formatAmount(row.current),
			plannedAmount: formatAmount(row.planned),
			note: row.note ? row.note : null,
			createdAt: now,
			updatedAt: now
		}))];

		await insertBudgetItems(tx, items satisfies Array<typeof accountingBudgetItems.$inferInsert>);
	});

	return { success: true } as const;
}
