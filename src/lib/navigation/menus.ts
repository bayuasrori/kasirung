export const MENU_KEYS = [
	'dashboard',
	'pos',
	'transactions.history',
	'reports',
	'master.products',
	'master.categories',
	'master.customers',
	'management.users',
	'management.roles'
] as const;

export type MenuKey = (typeof MENU_KEYS)[number];

const MENU_KEY_SET = new Set<MenuKey>(MENU_KEYS);

export function isMenuKey(value: unknown): value is MenuKey {
	return typeof value === 'string' && MENU_KEY_SET.has(value as MenuKey);
}

export function sanitizeMenuKeys(value: unknown): MenuKey[] {
	if (!Array.isArray(value)) return [];
	const collected: MenuKey[] = [];
	for (const entry of value) {
		if (isMenuKey(entry) && !collected.includes(entry)) {
			collected.push(entry);
		}
	}
	return collected;
}

export interface NavigationChild {
	key: MenuKey;
	name: string;
	href: string;
}

export interface NavigationItem {
	name: string;
	href: string;
	key?: MenuKey;
	icon?: 'dashboard' | 'pos' | 'history' | 'reports';
	children?: NavigationChild[];
}

export const NAVIGATION_TREE: NavigationItem[] = [
	{ name: 'Dashboard', href: '/dashboard', key: 'dashboard', icon: 'dashboard' },
	{
		name: 'Master Data',
		href: '/master',
		children: [
			{ key: 'master.products', name: 'Produk', href: '/master/products' },
			{ key: 'master.categories', name: 'Kategori', href: '/master/categories' },
			{ key: 'master.customers', name: 'Pelanggan', href: '/master/customers' }
		]
	},
	{
		name: 'Manajemen',
		href: '/manajemen',
		children: [
			{ key: 'management.users', name: 'Pengguna', href: '/manajemen/users' },
			{ key: 'management.roles', name: 'Role', href: '/manajemen/roles' }
		]
	},
	{ name: 'Transaksi POS', href: '/pos', key: 'pos', icon: 'pos' },
	{
		name: 'Riwayat Transaksi',
		href: '/riwayat-transaksi',
		key: 'transactions.history',
		icon: 'history'
	},
	{ name: 'Laporan', href: '/laporan', key: 'reports', icon: 'reports' }
];

export const MENU_PERMISSION_SECTIONS: Array<{
	label: string;
	items: Array<{ key: MenuKey; label: string }>;
}> = [
	{
		label: 'Menu Utama',
		items: [
			{ key: 'dashboard', label: 'Dashboard' },
			{ key: 'pos', label: 'Transaksi POS' },
			{ key: 'transactions.history', label: 'Riwayat Transaksi' },
			{ key: 'reports', label: 'Laporan' }
		]
	},
	{
		label: 'Master Data',
		items: [
			{ key: 'master.products', label: 'Produk' },
			{ key: 'master.categories', label: 'Kategori' },
			{ key: 'master.customers', label: 'Pelanggan' }
		]
	},
	{
		label: 'Manajemen',
		items: [
			{ key: 'management.users', label: 'Pengguna' },
			{ key: 'management.roles', label: 'Role' }
		]
	}
];
