import { randomUUID } from 'node:crypto';
import { hash } from '@node-rs/argon2';
import { z } from 'zod';

import {
	findUserByEmail,
	findUserById,
	findUsers,
	insertUser,
	updateUser,
	updateUserPassword,
	updateUserStatus
} from '$lib/server/repositories/users.repository';
import { findRoleById, listAllRoles } from '$lib/server/repositories/roles.repository';

const booleanInput = z.preprocess((value) => {
	if (typeof value === 'string') {
		const normalized = value.trim().toLowerCase();
		if (normalized === '') return undefined;
		if (normalized === 'true' || normalized === '1' || normalized === 'on') return true;
		if (normalized === 'false' || normalized === '0' || normalized === 'off') return false;
	}
	if (typeof value === 'number') {
		if (value === 1) return true;
		if (value === 0) return false;
	}
	return value;
}, z.boolean());

const createUserSchema = z.object({
	fullName: z.string().trim().min(3, 'Nama lengkap minimal 3 karakter').max(160, 'Nama lengkap maksimal 160 karakter'),
	email: z.string().trim().email('Format email tidak valid'),
	password: z.string().min(8, 'Kata sandi minimal 8 karakter'),
	roleId: z.coerce.number({ invalid_type_error: 'Role tidak valid' }).int('Role tidak valid'),
	isActive: booleanInput.optional(),
	avatarUrl: z.string().trim().optional()
});

const updateUserSchema = z.object({
	fullName: z.string().trim().min(3, 'Nama lengkap minimal 3 karakter').max(160, 'Nama lengkap maksimal 160 karakter').optional(),
	email: z.string().trim().email('Format email tidak valid').optional(),
	roleId: z
		.union([
			z.literal(''),
			z.coerce.number({ invalid_type_error: 'Role tidak valid' }).int('Role tidak valid')
		])
		.optional(),
	isActive: booleanInput.optional(),
	avatarUrl: z.string().trim().optional()
});

const passwordSchema = z.object({
	password: z.string().min(8, 'Kata sandi minimal 8 karakter')
});

interface ListParams {
	search?: string;
	page?: number;
	pageSize?: number;
	roleId?: number;
	isActive?: boolean;
	sortBy?: 'createdAt' | 'fullName' | 'email';
	sortDir?: 'asc' | 'desc';
}

function normalizeAvatarUrl(value: string | undefined): string | null | undefined {
	if (value === undefined) return undefined;
	const trimmed = value.trim();
	if (trimmed === '') return null;
	try {
		const url = new URL(trimmed);
		return url.toString();
	} catch {
		return null;
	}
}

export async function listUsersWithMeta(params: ListParams) {
	const pageSize = Math.min(Math.max(params.pageSize ?? 10, 1), 100);
	const page = Math.max(params.page ?? 1, 1);
	const offset = (page - 1) * pageSize;

	const { data, total } = await findUsers({
		search: params.search?.trim() || undefined,
		roleId: params.roleId,
		isActive: params.isActive,
		limit: pageSize,
		offset,
		sortBy: params.sortBy,
		sortDir: params.sortDir
	});

	const roles = await listAllRoles();

	return {
		items: data,
		total,
		page,
		pageSize,
		pageCount: Math.max(Math.ceil(total / pageSize), 1),
		roles
	};
}

export async function createUser(payload: Record<string, unknown>) {
	const parsed = createUserSchema.safeParse(payload);
	if (!parsed.success) {
		return { success: false, errors: parsed.error.flatten().fieldErrors } as const;
	}

	const data = parsed.data;
	const email = data.email.toLowerCase();
	const role = await findRoleById(data.roleId);
	if (!role) {
		return {
			success: false,
			errors: { roleId: ['Role tidak ditemukan'] }
		} as const;
	}

	const existing = await findUserByEmail(email);
	if (existing) {
		return {
			success: false,
			errors: { email: ['Email sudah digunakan'] }
		} as const;
	}

	const avatarUrl = normalizeAvatarUrl(data.avatarUrl);
	if (avatarUrl === null && data.avatarUrl && data.avatarUrl.trim() !== '') {
		return {
			success: false,
			errors: { avatarUrl: ['URL avatar tidak valid'] }
		} as const;
	}

	const passwordHash = await hash(data.password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});

	await insertUser({
		id: randomUUID(),
		roleId: data.roleId,
		email,
		passwordHash,
		fullName: data.fullName,
		avatarUrl: avatarUrl ?? null,
		isActive: data.isActive ?? true,
		createdAt: new Date(),
		updatedAt: new Date()
	});

	return { success: true } as const;
}

export async function updateUserById(id: string, payload: Record<string, unknown>) {
	const parsed = updateUserSchema.safeParse(payload);
	if (!parsed.success) {
		return { success: false, errors: parsed.error.flatten().fieldErrors } as const;
	}

	const existing = await findUserById(id);
	if (!existing) {
		return { success: false, notFound: true } as const;
	}

	const data = parsed.data;
	const updates: Record<string, unknown> = {};

	if (data.fullName !== undefined) {
		if (data.fullName === '') {
			return { success: false, errors: { fullName: ['Nama lengkap wajib diisi'] } } as const;
		}
		updates.fullName = data.fullName;
	}

	if (data.email && data.email !== existing.email) {
		const email = data.email.toLowerCase();
		const emailOwner = await findUserByEmail(email);
		if (emailOwner && emailOwner.id !== id) {
			return {
				success: false,
				errors: { email: ['Email sudah digunakan'] }
			} as const;
		}
		updates.email = email;
	}

	if (data.roleId !== undefined) {
		if (data.roleId === '') {
			return { success: false, errors: { roleId: ['Role wajib dipilih'] } } as const;
		}
		const roleId = typeof data.roleId === 'number' ? data.roleId : Number(data.roleId);
		const role = await findRoleById(roleId);
		if (!role) {
			return { success: false, errors: { roleId: ['Role tidak ditemukan'] } } as const;
		}
		updates.roleId = roleId;
	}

	if (data.avatarUrl !== undefined) {
		const normalized = normalizeAvatarUrl(data.avatarUrl);
		if (normalized === null && data.avatarUrl.trim() !== '') {
			return {
				success: false,
				errors: { avatarUrl: ['URL avatar tidak valid'] }
			} as const;
		}
		updates.avatarUrl = normalized ?? null;
	}

	if (data.isActive !== undefined) {
		updates.isActive = data.isActive;
	}

	if (Object.keys(updates).length === 0) {
		return { success: true } as const;
	}

	await updateUser(id, { ...updates, updatedAt: new Date() });

	return { success: true } as const;
}

export async function resetUserPassword(id: string, payload: Record<string, unknown>) {
	const parsed = passwordSchema.safeParse(payload);
	if (!parsed.success) {
		return { success: false, errors: parsed.error.flatten().fieldErrors } as const;
	}

	const existing = await findUserById(id);
	if (!existing) {
		return { success: false, notFound: true } as const;
	}

	const passwordHash = await hash(parsed.data.password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});

	await updateUserPassword(id, passwordHash);

	return { success: true } as const;
}

export async function toggleUserStatus(id: string) {
	const existing = await findUserById(id);
	if (!existing) {
		return { success: false, notFound: true } as const;
	}

	await updateUserStatus(id, !existing.isActive);

	return { success: true, isActive: !existing.isActive } as const;
}

export async function getUserRoleOptions() {
	return listAllRoles();
}
