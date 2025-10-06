import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { verify } from '@node-rs/argon2';

import { auth } from '$lib/auth/lucia';
import { db } from '$lib/db/client';
import { users } from '$lib/db/schema';

const loginSchema = z.object({
	email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
	password: z.string().min(6, 'Kata sandi minimal 6 karakter')
});

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.session) {
		throw redirect(302, '/dashboard');
	}

	return { errors: null, values: { email: '' } };
};

export const actions: Actions = {
	default: async ({ request, locals, cookies }) => {
		const formData = Object.fromEntries(await request.formData());
		const parsed = loginSchema.safeParse({
			email: typeof formData.email === 'string' ? formData.email.trim() : '',
			password: typeof formData.password === 'string' ? formData.password : ''
		});

		if (!parsed.success) {
			const { fieldErrors } = parsed.error.flatten();
			return fail(400, {
				errors: fieldErrors,
				message: 'Periksa kembali input Anda',
				values: { email: formData.email ?? '' }
			});
		}

		const email = parsed.data.email.toLowerCase();
		const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

		if (!user) {
			return fail(400, {
				errors: { email: ['Email atau kata sandi salah'] },
				message: 'Email atau kata sandi salah',
				values: { email }
			});
		}

		if (!user.isActive) {
			return fail(403, {
				errors: { email: ['Akun Anda dinonaktifkan'] },
				message: 'Akun Anda dinonaktifkan. Hubungi administrator.',
				values: { email }
			});
		}

		const isPasswordValid = await verify(user.passwordHash, parsed.data.password);
		if (!isPasswordValid) {
			return fail(400, {
				errors: { email: ['Email atau kata sandi salah'] },
				message: 'Email atau kata sandi salah',
				values: { email }
			});
		}

		const session = await auth.createSession(user.id, {});
		const sessionCookie = auth.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: sessionCookie.attributes.path ?? '/',
			domain: sessionCookie.attributes.domain,
			httpOnly: sessionCookie.attributes.httpOnly ?? true,
			sameSite: sessionCookie.attributes.sameSite ?? 'lax',
			secure: sessionCookie.attributes.secure ?? true,
			expires: sessionCookie.attributes.expires,
			maxAge: sessionCookie.attributes.maxAge
		});

		locals.session = session;
		locals.user = {
			id: user.id,
			email: user.email,
			fullName: user.fullName,
			roleId: user.roleId,
			avatarUrl: user.avatarUrl,
			isActive: user.isActive
		};

		throw redirect(302, '/dashboard');
	}
};
