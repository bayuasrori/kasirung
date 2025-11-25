import { randomUUID } from 'crypto';
import { z } from 'zod';

import {
	deleteCustomer,
	findCustomerById,
	findCustomers,
	listAllCustomers,
	insertCustomer,
	updateCustomer
} from '$lib/server/repositories/customers.repository';

const customerSchema = z.object({
	name: z.string().min(2, 'Nama minimal 2 karakter'),
	email: z.string().email('Email tidak valid').optional().or(z.literal('')),
	phone: z.string().optional(),
	address: z.string().optional(),
	notes: z.string().optional()
});

interface ListParams {
	search?: string;
	page?: number;
	pageSize?: number;
	sortBy?: 'createdAt' | 'name';
	sortDir?: 'asc' | 'desc';
}

export async function listCustomersWithMeta(params: ListParams) {
	const pageSize = params.pageSize ?? 10;
	const page = Math.max(params.page ?? 1, 1);
	const offset = (page - 1) * pageSize;
	const { data, total } = await findCustomers({
		search: params.search,
		limit: pageSize,
		offset,
		sortBy: params.sortBy,
		sortDir: params.sortDir
	});

	const normalizedItems = data.map((item) => ({
		...item,
		totalSpentThisMonth: Number(item.totalSpentThisMonth ?? 0),
		outstandingThisMonth: Number(item.outstandingThisMonth ?? 0)
	}));

	return {
		items: normalizedItems,
		total,
		page,
		pageSize,
		pageCount: Math.max(Math.ceil(total / pageSize), 1)
	};
}

export async function createCustomer(payload: Record<string, unknown>) {
	const parsed = customerSchema.safeParse(payload);
	if (!parsed.success) {
		return { success: false, errors: parsed.error.flatten().fieldErrors } as const;
	}

	await insertCustomer({
		id: randomUUID(),
		name: parsed.data.name,
		email: parsed.data.email || null,
		phone: parsed.data.phone ?? null,
		address: parsed.data.address ?? null,
		notes: parsed.data.notes ?? null
	});

	return { success: true } as const;
}

export async function updateCustomerById(id: string, payload: Record<string, unknown>) {
	const parsed = customerSchema.partial().safeParse(payload);
	if (!parsed.success) {
		return { success: false, errors: parsed.error.flatten().fieldErrors } as const;
	}

	const existing = await findCustomerById(id);
	if (!existing) {
		return { success: false, notFound: true } as const;
	}

	await updateCustomer(id, {
		name: parsed.data.name ?? existing.name,
		email: parsed.data.email !== undefined ? parsed.data.email || null : existing.email,
		phone: parsed.data.phone ?? existing.phone,
		address: parsed.data.address ?? existing.address,
		notes: parsed.data.notes ?? existing.notes,
		updatedAt: new Date()
	});

	return { success: true } as const;
}

export async function deleteCustomerById(id: string) {
	const existing = await findCustomerById(id);
	if (!existing) {
		return { success: false, notFound: true } as const;
	}

	await deleteCustomer(id);
	return { success: true } as const;
}

export async function listQuickCustomers() {
	return listAllCustomers();
}
