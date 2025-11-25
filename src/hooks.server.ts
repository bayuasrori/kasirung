import { redirect, type Handle } from '@sveltejs/kit';

import { auth } from '$lib/auth/lucia';
import { MENU_KEYS, sanitizeMenuKeys, type MenuKey } from '$lib/navigation/menus';
import { findRoleById } from '$lib/server/repositories/roles.repository';

const protectedPrefixes = [
	'/dashboard',
	'/logout',
	'/master',
	'/manajemen',
	'/pos',
	'/riwayat-transaksi',
	'/laporan',
	'/register',
	'/akuntansi',
	'/kosan'
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

type MenuGuard = { prefix: string; keys: MenuKey[] };

const normalizePath = (value: string) => {
	if (value === '/') return value;
	const trimmed = value.replace(/\/+$/, '');
	return trimmed === '' ? '/' : trimmed;
};

const rawMenuPermissionGuards = [
	{ prefix: '/dashboard', keys: ['dashboard'] },
	{ prefix: '/pos', keys: ['pos'] },
	{ prefix: '/riwayat-transaksi', keys: ['transactions.history'] },
	{ prefix: '/laporan', keys: ['reports'] },
	{ prefix: '/master/products', keys: ['master.products'] },
	{ prefix: '/master/categories', keys: ['master.categories'] },
	{ prefix: '/master/customers', keys: ['master.customers'] },
	{ prefix: '/manajemen/users', keys: ['management.users'] },
	{ prefix: '/manajemen/roles', keys: ['management.roles'] },
	{ prefix: '/kosan/gedung', keys: ['kosan.gedung'] },
	{ prefix: '/kosan/ruangan', keys: ['kosan.ruangan'] },
	{ prefix: '/kosan/penghuni', keys: ['kosan.penghuni'] },
	{ prefix: '/kosan/pendaftaran', keys: ['kosan.pendaftaran'] },
	{
		prefix: '/akuntansi',
		keys: [
			'accounting.accounts',
			'accounting.journals',
			'accounting.journalManual',
			'accounting.ledger',
			'accounting.budget',
			'accounting.reports'
		]
	},
	{ prefix: '/akuntansi/akun', keys: ['accounting.accounts'] },
	{ prefix: '/akuntansi/jurnal/manual', keys: ['accounting.journalManual'] },
	{ prefix: '/akuntansi/jurnal', keys: ['accounting.journals'] },
	{ prefix: '/akuntansi/buku-besar', keys: ['accounting.ledger'] },
	{ prefix: '/akuntansi/anggaran', keys: ['accounting.budget'] },
	{ prefix: '/akuntansi/laporan', keys: ['accounting.reports'] }
] satisfies MenuGuard[];

const menuPermissionGuards = rawMenuPermissionGuards.map((guard) => ({
	...guard,
	prefix: normalizePath(guard.prefix)
}));

const sortedMenuPermissionGuards = [...menuPermissionGuards].sort(
	(a, b) => b.prefix.length - a.prefix.length
);

const findMenuGuardForPath = (path: string): MenuGuard | undefined => {
	return sortedMenuPermissionGuards.find(
		({ prefix }) => path === prefix || path.startsWith(`${prefix}/`)
	);
};

const resolveAllowedMenus = async (user: import('lucia').User | null) => {
	if (!user) return [];
	const role = await findRoleById(user.roleId);
	if (!role) return [];
	if (role.name?.toLowerCase() === 'admin') {
		return [...MENU_KEYS];
	}
	return sanitizeMenuKeys(role.permissions);
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

	const path = normalizePath(event.url.pathname);
	const isProtected = protectedPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
	const isAuthRoute = path === '/login';

	if (isProtected && !session) {
		throw redirect(302, '/login');
	}

	if (isAuthRoute && session) {
		throw redirect(302, '/dashboard');
	}

	const allowedMenus = await resolveAllowedMenus(user);
	event.locals.allowedMenus = allowedMenus;

	const permissionGuard = findMenuGuardForPath(path);
	if (permissionGuard) {
		if (!session) {
			throw redirect(302, '/login');
		}
		const allowedSet = new Set<MenuKey>(allowedMenus);
		const hasPermission = permissionGuard.keys.some((key) => allowedSet.has(key));
		if (!hasPermission) {
			throw redirect(302, '/dashboard');
		}
	}

	return resolve(event);
};
