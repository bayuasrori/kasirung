<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';

	export let data: { filters: { from: string; to: string } };
	let { from, to } = data.filters;

	const incomeAccounts = [
		{ code: '4101', name: 'Pendapatan Penjualan', amount: 0 },
		{ code: '4102', name: 'Pendapatan Bunga Pinjaman', amount: 0 }
	];

	const expenseAccounts = [{ code: '5101', name: 'Diskon Penjualan', amount: 0 }];
</script>

<div class="space-y-6">
	<div>
		<h2 class="text-xl font-semibold text-slate-900">Laporan Laba Rugi</h2>
		<p class="text-sm text-slate-500">
			Rancang laporan laba rugi untuk menganalisis pendapatan dan beban selama periode tertentu.
		</p>
	</div>

	<form class="grid gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur md:grid-cols-[160px_160px_auto]">
		<div class="space-y-2">
			<Label for="from">Periode dari</Label>
			<Input id="from" type="date" bind:value={from} />
		</div>
		<div class="space-y-2">
			<Label for="to">Hingga</Label>
			<Input id="to" type="date" bind:value={to} />
		</div>
		<div class="flex items-end gap-2">
			<Button type="button" className="gap-2" disabled>Segarkan (Coming Soon)</Button>
			<a href="/akuntansi/laporan" class="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">Kembali</a>
		</div>
	</form>

	<div class="grid gap-4 lg:grid-cols-2">
		<Card class="bg-white/90 shadow-sm backdrop-blur">
			<CardHeader>
				<CardTitle>Pendapatan</CardTitle>
			</CardHeader>
			<CardContent class="space-y-2 text-sm text-slate-600">
				{#each incomeAccounts as account (account.code)}
					<div class="flex items-center justify-between">
						<span>{account.code} — {account.name}</span>
						<span class="font-medium text-slate-900">Rp {account.amount.toLocaleString('id-ID')}</span>
					</div>
				{/each}
				<div class="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 font-semibold text-slate-900">
					<span>Total Pendapatan</span>
					<span>Rp 0</span>
				</div>
			</CardContent>
		</Card>

		<Card class="bg-white/90 shadow-sm backdrop-blur">
			<CardHeader>
				<CardTitle>Beban</CardTitle>
			</CardHeader>
			<CardContent class="space-y-2 text-sm text-slate-600">
				{#each expenseAccounts as account (account.code)}
					<div class="flex items-center justify-between">
						<span>{account.code} — {account.name}</span>
						<span class="font-medium text-slate-900">Rp {account.amount.toLocaleString('id-ID')}</span>
					</div>
				{/each}
				<div class="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 font-semibold text-slate-900">
					<span>Total Beban</span>
					<span>Rp 0</span>
				</div>
			</CardContent>
		</Card>
	</div>

	<Card class="bg-white/90 shadow-sm backdrop-blur">
		<CardHeader>
			<CardTitle>Ringkasan Laba Rugi</CardTitle>
		</CardHeader>
		<CardContent class="space-y-3 text-sm text-slate-600">
			<div class="flex items-center justify-between">
				<span>Total Pendapatan</span>
				<span class="font-semibold text-slate-900">Rp 0</span>
			</div>
			<div class="flex items-center justify-between">
				<span>Total Beban</span>
				<span class="font-semibold text-slate-900">Rp 0</span>
			</div>
			<div class="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
				<span>Laba Bersih / Rugi Bersih</span>
				<span>Rp 0</span>
			</div>
			<p class="text-xs text-slate-500">
				Koneksi ke data GL akan diselesaikan pada tahap berikutnya (detail akun, kalkulasi periode, dan ekspor laporan).
			</p>
		</CardContent>
	</Card>
</div>
