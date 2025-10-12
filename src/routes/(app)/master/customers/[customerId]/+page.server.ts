import { error, fail } from '@sveltejs/kit';

import { getCustomerLedger } from '$lib/server/services/customer-ledger.service';
import {
	createLoanAccount,
	getCustomerFinance,
	recordLoanRepayment,
	recordSavingsTransaction,
	payOutstandingWithSavings,
	payLoanFromSavings
} from '$lib/server/services/customer-finance.service';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const customerId = params.customerId;
	if (!customerId) {
		throw error(400, 'Pelanggan tidak valid');
	}

	const [ledger, finance] = await Promise.all([
		getCustomerLedger(customerId, url.searchParams),
		getCustomerFinance(customerId)
	]);
	if (ledger === null) {
		throw error(404, 'Pelanggan tidak ditemukan');
	}

	return {
		...ledger,
		finance,
		form: null
	};
};

export const actions: Actions = {
	savings: async ({ request, params, locals }) => {
		const customerId = params.customerId;
		if (!customerId) {
			throw error(400, 'Pelanggan tidak valid');
		}

		const formData = Object.fromEntries(await request.formData());
		const result = await recordSavingsTransaction(customerId, formData, {
			userId: locals.user?.id ?? null
		});

		if (!result.success) {
			return fail(400, {
				form: {
					type: 'savings',
					errors: result.errors,
					values: formData
				}
			});
		}

		const finance = await getCustomerFinance(customerId);

		return {
			form: {
				type: 'savings',
				success: true,
				values: { type: formData.type ?? 'deposit' }
			},
			finance
		};
	},
	loanCreate: async ({ request, params, locals }) => {
		const customerId = params.customerId;
		if (!customerId) {
			throw error(400, 'Pelanggan tidak valid');
		}

		const formData = Object.fromEntries(await request.formData());
		const result = await createLoanAccount(customerId, formData, {
			userId: locals.user?.id ?? null
		});

		if (!result.success) {
			return fail(400, {
				form: {
					type: 'loanCreate',
					errors: result.errors,
					values: formData
				}
			});
		}

		const finance = await getCustomerFinance(customerId);

		return {
			form: {
				type: 'loanCreate',
				success: true
			},
			finance
		};
	},
	loanRepayment: async ({ request, params, locals }) => {
		const customerId = params.customerId;
		if (!customerId) {
			throw error(400, 'Pelanggan tidak valid');
		}

		const formData = Object.fromEntries(await request.formData());
		const result = await recordLoanRepayment(customerId, formData, {
			userId: locals.user?.id ?? null
		});

		if (!result.success) {
			return fail(400, {
				form: {
					type: 'loanRepayment',
					errors: result.errors,
					values: formData
				}
			});
		}

	const finance = await getCustomerFinance(customerId);

	return {
		form: {
			type: 'loanRepayment',
			success: true,
			values: { loanId: formData.loanId ?? '' }
		},
		finance
	};
	},
	payFromSavings: async ({ request, params, locals, url }) => {
		const customerId = params.customerId;
		if (!customerId) {
			throw error(400, 'Pelanggan tidak valid');
		}

		const rawData = await request.formData();
		const formData = Object.fromEntries(rawData);
	const transactionId = typeof formData.transactionId === 'string' ? formData.transactionId : '';

	const result = await payOutstandingWithSavings(customerId, formData, {
			userId: locals.user?.id ?? null
		});

		if (!result.success) {
			return fail(400, {
				form: {
					type: 'payFromSavings',
					errors: result.errors,
					values: formData
				}
			});
		}

		const [ledger, finance] = await Promise.all([
			getCustomerLedger(customerId, url.searchParams),
			getCustomerFinance(customerId)
		]);

		if (ledger === null) {
			throw error(500, 'Data pelanggan tidak tersedia');
		}

		return {
			...ledger,
			finance,
			form: {
				type: 'payFromSavings',
				success: true,
				values: { transactionId }
			}
		};
	},
	loanPayFromSavings: async ({ request, params, locals }) => {
		const customerId = params.customerId;
		if (!customerId) {
			throw error(400, 'Pelanggan tidak valid');
		}

		const formData = Object.fromEntries(await request.formData());
		const loanId = typeof formData.loanId === 'string' ? formData.loanId : '';

		const result = await payLoanFromSavings(customerId, formData, {
			userId: locals.user?.id ?? null
		});

		if (!result.success) {
			return fail(400, {
				form: {
					type: 'loanPayFromSavings',
					errors: result.errors,
					values: formData
				}
			});
		}

		const finance = await getCustomerFinance(customerId);

		return {
			finance,
			form: {
				type: 'loanPayFromSavings',
				success: true,
				values: { loanId }
			}
		};
	}
};
