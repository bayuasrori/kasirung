import { auth } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || !locals.session) {
		throw redirect(302, '/demo/lucia/login');
	}

	return { user: locals.user };
};

export const actions: Actions = {
	logout: async (event) => {
		if (!event.locals.session) {
			return fail(401, { message: 'Session tidak ditemukan' });
		}

		await auth.invalidateSession(event.locals.session.id);
		const blankCookie = auth.createBlankSessionCookie();
		event.cookies.set(blankCookie.name, blankCookie.value, {
			path: blankCookie.attributes.path ?? '/',
			domain: blankCookie.attributes.domain,
			httpOnly: blankCookie.attributes.httpOnly ?? true,
			sameSite: blankCookie.attributes.sameSite ?? 'lax',
			secure: blankCookie.attributes.secure ?? true,
			expires: blankCookie.attributes.expires,
			maxAge: blankCookie.attributes.maxAge
		});
		event.locals.session = null;
		event.locals.user = null;

		throw redirect(302, '/demo/lucia/login');
	}
};
