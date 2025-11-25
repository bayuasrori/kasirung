<script lang="ts">
	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import Badge from '$lib/components/ui/badge.svelte';

	export let data: {
		overview: {
			accounts: { total: number; active: number };
			journals: { totalDebit: number; totalCredit: number };
		};
	};

	const formatCurrency = (value: number) =>
		`Rp ${value.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
</script>

<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
	<Card class="bg-white/90 shadow-sm backdrop-blur">
		<CardHeader>
			<CardTitle>Trial Balance</CardTitle>
		</CardHeader>
		<CardContent class="space-y-2 text-sm text-slate-600">
			<p>Pastikan total debit dan kredit seimbang sebelum menyusun laporan keuangan.</p>
			<Badge variant="muted">
				Saldo Debit: {formatCurrency(data.overview.journals.totalDebit)} | Kredit: {formatCurrency(data.overview.journals.totalCredit)}
			</Badge>
		</CardContent>
	</Card>
	<Card class="bg-white/90 shadow-sm backdrop-blur">
		<CardHeader>
			<CardTitle>Neraca (Balance Sheet)</CardTitle>
		</CardHeader>
		<CardContent class="space-y-2 text-sm text-slate-600">
			<p>Ringkasan posisi aset, liabilitas, dan ekuitas berdasarkan chart of accounts.</p>
			<p>{data.overview.accounts.active} akun aktif akan digunakan dalam perhitungan.</p>
		</CardContent>
	</Card>
	<Card class="bg-white/90 shadow-sm backdrop-blur">
		<CardHeader>
			<CardTitle>Laba Rugi</CardTitle>
		</CardHeader>
		<CardContent class="space-y-2 text-sm text-slate-600">
			<p>Pantau performa usaha dengan menganalisis akun pendapatan dan beban.</p>
			<p>Konfigurasikan periode laporan melalui filter tanggal di bagian atas (akan datang).</p>
		</CardContent>
	</Card>
</div>

<Card class="bg-white/90 shadow-sm backdrop-blur">
	<CardHeader>
		<CardTitle>Integrasi Laporan</CardTitle>
	</CardHeader>
	<CardContent class="space-y-3 text-sm text-slate-600">
		<p>
			Menu laporan akan mendukung ekspor PDF/CSV serta sinkronisasi dengan modul POS agar transaksi kasir
			langsung tercermin dalam buku besar.
		</p>
		<p>
			Silakan catat kebutuhan tambahan seperti klasifikasi akun khusus atau format laporan tertentu untuk
			dikonfigurasi pada iterasi berikutnya.
		</p>
	</CardContent>
</Card>
