import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { z } from 'zod';
import { asc, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { hash } from '@node-rs/argon2';

import { db } from '$lib/db/client';
import { roles, users } from '$lib/db/schema';

const registerSchema = z.object({
	fullName: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
	email: z.string().email('Format email tidak valid'),
	password: z.string().min(8, 'Kata sandi minimal 8 karakter'),
	roleId: z.coerce.number().int('Role tidak valid')
});

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.session) {
		throw redirect(302, '/login');
	}

	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const [currentRole] = await db
		.select({ name: roles.name })
		.from(roles)
		.where(eq(roles.id, locals.user.roleId))
		.limit(1);

	if (!currentRole || currentRole.name !== 'admin') {
		throw redirect(302, '/dashboard');
	}

	const availableRoles = await db.select().from(roles).orderBy(asc(roles.name));

	return {
		roles: availableRoles,
		message: null,
		errors: null
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.session) {
			throw redirect(302, '/login');
		}

		if (!locals.user) {
			throw redirect(302, '/login');
		}

		const [currentRole] = await db
			.select({ name: roles.name })
			.from(roles)
			.where(eq(roles.id, locals.user.roleId))
			.limit(1);

		if (!currentRole || currentRole.name !== 'admin') {
			throw redirect(302, '/dashboard');
		}

		const formData = Object.fromEntries(await request.formData());
		const parsed = registerSchema.safeParse(formData);

		if (!parsed.success) {
			const { fieldErrors } = parsed.error.flatten();
			return fail(400, {
				errors: fieldErrors,
				message: 'Periksa kembali input Anda'
			});
		}

		const role = await db.select().from(roles).where(eq(roles.id, parsed.data.roleId)).limit(1);
		if (!role[0]) {
			return fail(400, {
				errors: { roleId: ['Role tidak ditemukan'] },
				message: 'Role tidak ditemukan'
			});
		}

		const existing = await db.select().from(users).where(eq(users.email, parsed.data.email.toLowerCase())).limit(1);
		if (existing[0]) {
			return fail(400, {
				errors: { email: ['Email sudah digunakan'] },
				message: 'Email sudah digunakan'
			});
		}

		const passwordHash = await hash(parsed.data.password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		await db.insert(users).values({
			id: randomUUID(),
			roleId: parsed.data.roleId,
			email: parsed.data.email.toLowerCase(),
			passwordHash,
			fullName: parsed.data.fullName,
			isActive: true
		});

		return {
			message: 'Pengguna baru berhasil dibuat',
			errors: null
		};
	}
};
