import { redirect } from '@sveltejs/kit';

import { auth } from '$lib/auth/lucia';

const clearSessionCookie = (cookies: import('@sveltejs/kit').Cookies) => {
	const blank = auth.createBlankSessionCookie();
	cookies.set(blank.name, blank.value, {
		path: blank.attributes.path ?? '/',
		domain: blank.attributes.domain,
		httpOnly: blank.attributes.httpOnly ?? true,
		sameSite: blank.attributes.sameSite ?? 'lax',
		secure: blank.attributes.secure ?? true,
		expires: blank.attributes.expires,
		maxAge: blank.attributes.maxAge
	});
};

export const POST = async ({ locals, cookies }) => {
	if (locals.session) {
		await auth.invalidateSession(locals.session.id);
	}
	clearSessionCookie(cookies);
	locals.session = null;
	locals.user = null;
	throw redirect(302, '/login');
};

export const GET = POST;
