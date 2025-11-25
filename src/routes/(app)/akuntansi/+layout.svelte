<script lang="ts">
	import { page } from '$app/stores';

const sections = [
	{ href: '/akuntansi', label: 'Ikhtisar' },
	{ href: '/akuntansi/akun', label: 'Daftar Akun' },
	{ href: '/akuntansi/jurnal', label: 'Jurnal Umum' },
	{ href: '/akuntansi/jurnal/manual', label: 'Posting Manual' },
	{ href: '/akuntansi/anggaran', label: 'Desain Anggaran' },
	{ href: '/akuntansi/buku-besar', label: 'Buku Besar' },
	{ href: '/akuntansi/laporan', label: 'Laporan Keuangan' }
];

	function isActive(path: string, current: string) {
		if (path === '/akuntansi') {
			return current === path;
		}
		return current.startsWith(path);
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col gap-2">
		<h1 class="text-xl font-semibold text-slate-900">Akuntansi &amp; General Ledger</h1>
		<p class="text-sm text-slate-500">
			Kelola chart of accounts, pencatatan jurnal, hingga laporan buku besar untuk operasional kasir.
		</p>
	</div>

	<nav class="flex flex-wrap gap-2">
	{#each sections as item (item.href)}
			<a
				href={item.href}
				class={`rounded-lg border px-3 py-2 text-sm transition ${isActive(item.href, $page.url.pathname) ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-transparent bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50'}`}
			>
				{item.label}
			</a>
		{/each}
	</nav>

	<slot />
</div>
