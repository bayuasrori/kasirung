import { randomUUID } from 'crypto';
import { z } from 'zod';

import { createTransactionRecord } from '$lib/server/repositories/transactions.repository';
import { findProductsByIds } from '$lib/server/repositories/products.repository';
import { findCustomerById } from '$lib/server/repositories/customers.repository';
import { getPenghuniAktifDetail } from '$lib/server/services/kosan-penghuni.service';
import { db } from '$lib/db/client';
import {
	LedgerConfigurationError,
	recordPosSaleJournal
} from '$lib/server/services/accounting.service';

const cartSchema = z.object({
	items: z
		.array(
			z.object({
				productId: z.string().uuid('Produk tidak valid'),
				quantity: z.coerce.number().min(1, 'Qty minimal 1')
			})
		)
		.min(1, 'Keranjang tidak boleh kosong'),
	paymentMethod: z.enum(['cash', 'qris', 'debit', 'credit']),
	customerId: z.union([z.string().uuid('Pelanggan tidak valid'), z.literal(''), z.null()]).optional(),
	tenantId: z.union([z.string().uuid('Penghuni tidak valid'), z.literal(''), z.null()]).optional(),
	taxRate: z.coerce.number().min(0).max(1).optional(),
	discount: z.coerce.number().min(0).optional(),
	note: z.string().optional()
});

function formatMoney(value: number) {
	return value.toFixed(2);
}

function generateTransactionNumber() {
	const now = new Date();
	const pad = (num: number) => num.toString().padStart(2, '0');
	return `TRX-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${now.getHours()}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

export async function createPosTransaction(userId: string, payload: Record<string, unknown>) {
	const parsed = cartSchema.safeParse(payload);
	if (!parsed.success) {
		return { success: false, errors: parsed.error.flatten().fieldErrors } as const;
	}

	const cart = parsed.data;
	const productIds = cart.items.map((item) => item.productId);
	const products = await findProductsByIds(productIds);

	if (products.length !== productIds.length) {
		return { success: false, errors: { items: ['Beberapa produk tidak ditemukan atau tidak aktif'] } } as const;
	}

	let subtotal = 0;
	const transactionItems = cart.items.map((item) => {
		const product = products.find((p) => p.id === item.productId);
		const unitPrice = Number(product?.price ?? 0);
		if (!product || !product.isActive || unitPrice <= 0) {
			throw new Error('Produk tidak valid');
		}
		const totalPrice = unitPrice * item.quantity;
		subtotal += totalPrice;
		return {
			id: randomUUID(),
			transactionId: '',
			productId: product.id,
			quantity: item.quantity,
			unitPrice: formatMoney(unitPrice),
			totalPrice: formatMoney(totalPrice),
			createdAt: new Date(),
			updatedAt: new Date()
		};
	});

	const taxRate = cart.taxRate ?? 0.1;
	const discount = cart.discount ?? 0;
	const taxAmount = subtotal * taxRate;
	const total = subtotal + taxAmount - discount;

	let customerId = cart.customerId ? cart.customerId : null;
	const tenantId = cart.tenantId ? cart.tenantId : null;
	let tenantMetadata: Record<string, unknown> | null = null;

	if (tenantId) {
		const tenant = await getPenghuniAktifDetail(tenantId);
		if (!tenant) {
			return { success: false, errors: { tenantId: ['Penghuni tidak ditemukan atau tidak aktif'] } } as const;
		}
		if (customerId && tenant.pelangganId !== customerId) {
			return { success: false, errors: { customerId: ['Pelanggan tidak sesuai dengan penghuni'] } } as const;
		}
		customerId = tenant.pelangganId;
		tenantMetadata = {
			id: tenant.id,
			gedungId: tenant.gedungId,
			gedungNama: tenant.gedungNama,
			ruanganId: tenant.ruanganId,
			ruanganNama: tenant.ruanganNama
		};
	}

	if (customerId) {
		const customer = await findCustomerById(customerId);
		if (!customer) {
			return { success: false, errors: { customerId: ['Pelanggan tidak ditemukan'] } } as const;
		}
	}

	const transactionId = randomUUID();
	const transactionNumber = generateTransactionNumber();

	const now = new Date();
	const transactionValues = {
		id: transactionId,
		number: transactionNumber,
		userId,
		customerId,
		subtotal: formatMoney(subtotal),
		tax: formatMoney(taxAmount),
		discount: formatMoney(discount),
		total: formatMoney(total),
		status: 'completed' as const,
		note: cart.note ?? null,
		createdAt: now,
		updatedAt: now
	};

	const paymentValues = {
		id: randomUUID(),
		transactionId,
		amount: formatMoney(total),
		method: cart.paymentMethod,
		status: cart.paymentMethod === 'credit' ? 'pending' : 'paid',
		paidAt: now,
		createdAt: now,
		updatedAt: now,
		metadata: tenantMetadata ? { tenant: tenantMetadata } : null,
		reference: null
	};

	const itemsToInsert = transactionItems.map((item) => ({
		...item,
		transactionId
	}));

	try {
		await createTransactionRecord(db, transactionValues, itemsToInsert, paymentValues, {
			afterInsert: async (tx) => {
				await recordPosSaleJournal(tx, {
					subtotal,
					discount,
					tax: taxAmount,
					total,
					paymentMethod: cart.paymentMethod,
					entryDate: now,
					reference: transactionId,
					number: transactionNumber,
					createdBy: userId
				});
			}
		});
	} catch (error) {
		if (error instanceof LedgerConfigurationError) {
			return { success: false, errors: { root: [error.message] } } as const;
		}
		throw error;
	}

	return {
		success: true,
		transactionId,
		transactionNumber,
		total: formatMoney(total)
	} as const;
}
