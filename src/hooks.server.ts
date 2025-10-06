import { redirect, type Handle } from '@sveltejs/kit';

import { auth } from '$lib/auth/lucia';

const protectedPrefixes = [
	'/dashboard',
	'/logout',
	'/master',
	'/manajemen',
	'/pos',
	'/riwayat-transaksi',
	'/laporan',
	'/register'
];

type LuciaCookie =
	| ReturnType<typeof auth.createSessionCookie>
	| ReturnType<typeof auth.createBlankSessionCookie>;

const setCookie = (event: Parameters<Handle>[0]['event'], cookie: LuciaCookie) => {
	event.cookies.set(cookie.name, cookie.value, {
		path: cookie.attributes.path ?? '/',
		domain: cookie.attributes.domain,
		httpOnly: cookie.attributes.httpOnly ?? true,
		sameSite: cookie.attributes.sameSite ?? 'lax',
		secure: cookie.attributes.secure ?? true,
		expires: cookie.attributes.expires,
		maxAge: cookie.attributes.maxAge
	});
};

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(auth.sessionCookieName);
	let session = null;
	let user = null;

	if (sessionId) {
		const result = await auth.validateSession(sessionId);
		session = result.session;
		user = result.user;

		if (session && session.fresh) {
			const sessionCookie = auth.createSessionCookie(session.id);
			setCookie(event, sessionCookie);
		}

		if (!session) {
			const blankCookie = auth.createBlankSessionCookie();
			setCookie(event, blankCookie);
		}
	}

	event.locals.session = session;
	event.locals.user = user;

	const path = event.url.pathname;
	const isProtected = protectedPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
	const isAuthRoute = path === '/login';

	if (isProtected && !session) {
		throw redirect(302, '/login');
	}

	if (isAuthRoute && session) {
		throw redirect(302, '/dashboard');
	}

	return resolve(event);
};
