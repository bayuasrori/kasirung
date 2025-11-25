import { z } from 'zod';

import {
	countUsersForRole,
	deleteRole,
	findRoleById,
	findRoleByName,
	findRoles,
	insertRole,
	listAllRoles,
	updateRole
} from '$lib/server/repositories/roles.repository';
import { MENU_KEYS, sanitizeMenuKeys, type MenuKey } from '$lib/navigation/menus';

const menuKeyEnum = z.enum(MENU_KEYS);

const roleInputSchema = z.object({
	name: z
		.string()
		.trim()
		.min(3, 'Nama role minimal 3 karakter')
		.max(64, 'Nama role maksimal 64 karakter'),
	description: z
		.string()
		.trim()
		.refine((value) => value.length === 0 || value.length >= 3, {
			message: 'Deskripsi minimal 3 karakter',
			path: ['description']
		})
		.optional(),
	permissions: z.array(menuKeyEnum).min(1, 'Minimal pilih satu menu yang dapat diakses')
});

const roleUpdateSchema = roleInputSchema.partial();

interface ListParams {
	search?: string;
	page?: number;
	pageSize?: number;
	sortBy?: 'createdAt' | 'name';
	sortDir?: 'asc' | 'desc';
}

export async function listRolesWithMeta(params: ListParams) {
	const pageSize = Math.min(Math.max(params.pageSize ?? 10, 1), 100);
	const page = Math.max(params.page ?? 1, 1);
	const offset = (page - 1) * pageSize;

	const { data, total } = await findRoles({
		search: params.search?.trim() || undefined,
		limit: pageSize,
		offset,
		sortBy: params.sortBy,
		sortDir: params.sortDir
	});

	return {
		items: data.map((role) => ({
			...role,
			permissions: sanitizeMenuKeys(role.permissions)
		})),
		total,
		page,
		pageSize,
		pageCount: Math.max(Math.ceil(total / pageSize), 1)
	};
}

function normalizeDescription(value: string | undefined): string | null | undefined {
	if (value === undefined) return undefined;
	const trimmed = value.trim();
	return trimmed === '' ? null : trimmed;
}

export async function createRole(payload: Record<string, unknown>) {
	const parsed = roleInputSchema.safeParse(payload);
	if (!parsed.success) {
		return { success: false, errors: parsed.error.flatten().fieldErrors } as const;
	}

	const data = parsed.data;
	const name = data.name;
	const normalizedName = name.trim().toLowerCase();
	let permissions = sanitizeMenuKeys(data.permissions);

	if (normalizedName === 'admin') {
		permissions = [...MENU_KEYS];
	}

	const existing = await findRoleByName(name);
	if (existing) {
		return {
			success: false,
			errors: { name: ['Nama role sudah digunakan'] }
		} as const;
	}

	await insertRole({
		name,
		description: normalizeDescription(data.description),
		permissions,
		createdAt: new Date(),
		updatedAt: new Date()
	});

	return { success: true } as const;
}

export async function updateRoleById(id: number, payload: Record<string, unknown>) {
	const parsed = roleUpdateSchema.safeParse(payload);
	if (!parsed.success) {
		return { success: false, errors: parsed.error.flatten().fieldErrors } as const;
	}

	const existing = await findRoleById(id);
	if (!existing) {
		return { success: false, notFound: true } as const;
	}

	const data = parsed.data;
	const updates: Partial<typeof existing> = {};

	if (data.name && data.name !== existing.name) {
		const uniqueCheck = await findRoleByName(data.name);
		if (uniqueCheck && uniqueCheck.id !== id) {
			return {
				success: false,
				errors: { name: ['Nama role sudah digunakan'] }
			} as const;
		}
		updates.name = data.name;
	}

	if (data.description !== undefined) {
		updates.description = normalizeDescription(data.description) ?? null;
	}

	if (data.permissions !== undefined) {
		updates.permissions = sanitizeMenuKeys(data.permissions);
	}

	const targetName = data.name ?? existing.name;
	if ((targetName ?? '').toLowerCase() === 'admin') {
		updates.permissions = [...MENU_KEYS];
	}

	await updateRole(id, { ...updates, updatedAt: new Date() });

	return { success: true } as const;
}

export async function deleteRoleById(id: number) {
	const existing = await findRoleById(id);
	if (!existing) {
		return { success: false, notFound: true } as const;
	}

	const usage = await countUsersForRole(id);
	if (usage > 0) {
		return { success: false, inUse: true } as const;
	}

	await deleteRole(id);

	return { success: true } as const;
}

export async function getRoleOptions() {
	return listAllRoles();
}
