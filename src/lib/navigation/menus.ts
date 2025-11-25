export const MENU_KEYS = [
	'dashboard',
	'pos',
	'transactions.history',
	'reports',
	'master.products',
	'master.categories',
	'master.customers',
	'management.users',
	'management.roles',
	'accounting.accounts',
	'accounting.journals',
	'accounting.ledger',
	'accounting.reports',
	'accounting.journalManual',
	'accounting.budget',
	'kosan.gedung',
	'kosan.ruangan',
	'kosan.penghuni',
	'kosan.pendaftaran',
	'simklinik.pasien',
	'simklinik.tenaga-medis',
	'simklinik.layanan',
	'simklinik.janji-temu',
	'simklinik.inventory',
	'simklinik.tagihan',
	'simklinik.rekamedis',
	'simklinik.rekamedis-inap',
	'simklinik.rawat-inap',
	'simklinik.laporan'
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
	{
		name: 'Simklinik',
		href: '/simklinik',
		children: [
			{ key: 'simklinik.pasien', name: 'Pasien', href: '/simklinik/pasien' },
			{ key: 'simklinik.tenaga-medis', name: 'Tenaga Medis', href: '/simklinik/tenaga-medis' },
			{ key: 'simklinik.layanan', name: 'Layanan Medis', href: '/simklinik/layanan' },
			{ key: 'simklinik.janji-temu', name: 'Janji Temu', href: '/simklinik/janji-temu' },
			{ key: 'simklinik.inventory', name: 'Inventory Medis', href: '/simklinik/inventory' },
			{ key: 'simklinik.tagihan', name: 'Tagihan Medis', href: '/simklinik/tagihan' },
			{ key: 'simklinik.rekamedis', name: 'Rekam Medis', href: '/simklinik/rekam-medis' },
			{ key: 'simklinik.rekamedis-inap', name: 'Rekam Medis Inap', href: '/simklinik/rekam-medis-inap' },
			{ key: 'simklinik.rawat-inap', name: 'Pasien Rawat Inap', href: '/simklinik/rawat-inap' },
			{ key: 'simklinik.laporan', name: 'Laporan Simklinik', href: '/simklinik/laporan' }
		]
	},
	{
		name: 'Manajemen Kosan',
		href: '/kosan',
		children: [
			{ key: 'kosan.gedung', name: 'Master Gedung', href: '/kosan/gedung' },
			{ key: 'kosan.ruangan', name: 'Master Ruangan', href: '/kosan/ruangan' },
			{ key: 'kosan.penghuni', name: 'Daftar Penghuni', href: '/kosan/penghuni' },
			{ key: 'kosan.pendaftaran', name: 'Pendaftaran Penghuni', href: '/kosan/pendaftaran' }
		]
	},
	{
		name: 'Akuntansi',
		href: '/akuntansi',
		children: [
			{ key: 'accounting.accounts', name: 'Daftar Akun', href: '/akuntansi/akun' },
			{ key: 'accounting.journals', name: 'Jurnal Umum', href: '/akuntansi/jurnal' },
			{ key: 'accounting.journalManual', name: 'Posting Manual', href: '/akuntansi/jurnal/manual' },
			{ key: 'accounting.ledger', name: 'Buku Besar', href: '/akuntansi/buku-besar' },
			{ key: 'accounting.budget', name: 'Desain Anggaran', href: '/akuntansi/anggaran' },
			{ key: 'accounting.reports', name: 'Laporan Keuangan', href: '/akuntansi/laporan' }
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
	},
	{
		label: 'Simklinik',
		items: [
			{ key: 'simklinik.pasien', label: 'Pasien' },
			{ key: 'simklinik.tenaga-medis', label: 'Tenaga Medis' },
			{ key: 'simklinik.layanan', label: 'Layanan Medis' },
			{ key: 'simklinik.janji-temu', label: 'Janji Temu' },
			{ key: 'simklinik.inventory', label: 'Inventory Medis' },
			{ key: 'simklinik.tagihan', label: 'Tagihan Medis' },
			{ key: 'simklinik.rekamedis', label: 'Rekam Medis' },
			{ key: 'simklinik.rawat-inap', label: 'Pasien Rawat Inap' },
			{ key: 'simklinik.laporan', label: 'Laporan Simklinik' }
		]
	},
	{
		label: 'Manajemen Kosan',
		items: [
			{ key: 'kosan.gedung', label: 'Master Gedung' },
			{ key: 'kosan.ruangan', label: 'Master Ruangan' },
			{ key: 'kosan.penghuni', label: 'Daftar Penghuni' },
			{ key: 'kosan.pendaftaran', label: 'Pendaftaran Penghuni' }
		]
	},
	{
		label: 'Akuntansi',
		items: [
			{ key: 'accounting.accounts', label: 'Daftar Akun' },
			{ key: 'accounting.journals', label: 'Jurnal Umum' },
			{ key: 'accounting.journalManual', label: 'Posting Manual' },
			{ key: 'accounting.ledger', label: 'Buku Besar' },
			{ key: 'accounting.budget', label: 'Desain Anggaran' },
			{ key: 'accounting.reports', label: 'Laporan Keuangan' }
		]
	}
];
