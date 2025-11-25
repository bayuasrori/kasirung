import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

import {
	budgetScenarioValues,
	loadBudgetSnapshot,
	saveBudgetPlan
} from '$lib/server/services/accounting-budgets.service';
import { listAccounts } from '$lib/server/repositories/accounting.repository';

function parseYear(value: string | null) {
	if (!value) return undefined;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : undefined;
}

function parseScenario(value: string | null) {
	if (!value) return undefined;
	return budgetScenarioValues.includes(value as (typeof budgetScenarioValues)[number])
		? (value as (typeof budgetScenarioValues)[number])
		: undefined;
}

function parseJsonRows(value: FormDataEntryValue | null) {
	if (typeof value !== 'string') return [];
	try {
		const parsed = JSON.parse(value);
		return Array.isArray(parsed) ? parsed : [];
	} catch (error) {
		return [];
	}
}

export const load: PageServerLoad = async ({ url }) => {
	const selectedYear = parseYear(url.searchParams.get('year'));
	const selectedScenario = parseScenario(url.searchParams.get('scenario'));

	const [snapshot, accounts] = await Promise.all([
		loadBudgetSnapshot({ year: selectedYear, scenario: selectedScenario }),
		listAccounts()
	]);

	const revenueAccounts = accounts
		.filter((account) => account.type === 'revenue')
		.map((account) => ({ code: account.code, name: account.name }));

	const expenseAccounts = accounts
		.filter((account) => account.type === 'expense')
		.map((account) => ({ code: account.code, name: account.name }));

	return {
		filters: {
			year: snapshot.year,
			scenario: snapshot.scenario
		},
		availableYears: snapshot.availableYears,
		plan: snapshot.plan,
		budgets: {
			revenue: snapshot.revenue,
			expense: snapshot.expense
		},
		notes: snapshot.notes,
		accounts: {
			revenue: revenueAccounts,
			expense: expenseAccounts
		}
	};
};

export const actions: Actions = {
	save: async ({ request, locals }) => {
		const formData = await request.formData();

		const payload = {
			year: formData.get('year'),
			scenario: formData.get('scenario'),
			notes: formData.get('notes') ?? '',
			revenue: parseJsonRows(formData.get('revenue')),
			expense: parseJsonRows(formData.get('expense'))
		};

		const result = await saveBudgetPlan(locals.user?.id ?? locals.session?.userId ?? null, payload);

		if (!result.success) {
			return fail(400, { errors: result.errors });
		}

		return { success: true };
	}
};
