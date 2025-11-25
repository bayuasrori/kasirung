<script lang="ts">
	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import Badge from '$lib/components/ui/badge.svelte';

	export let data: {
		overview: {
			accounts: { total: number; active: number };
			journals: {
				recent: Array<{
					id: string;
					number: string;
					entryDate: Date;
					memo: string | null;
					status: 'draft' | 'posted' | 'void';
					totalDebit: number;
					totalCredit: number;
				}>;
				totalDebit: number;
				totalCredit: number;
			};
		};
	};

	const formatNumber = (value: number) => value.toLocaleString('id-ID');
	const formatCurrency = (value: number) =>
		`Rp ${value.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
	const formatDate = (value: Date) =>
		new Date(value).toLocaleDateString('id-ID', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});

	const statusVariant: Record<'draft' | 'posted' | 'void', 'muted' | 'success' | 'destructive'> = {
		draft: 'muted',
		posted: 'success',
		void: 'destructive'
	};

	const statusLabel: Record<'draft' | 'posted' | 'void', string> = {
		draft: 'Draft',
		posted: 'Posted',
		void: 'Void'
	};
</script>

<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
	<Card class="bg-white/90 shadow-sm backdrop-blur">
		<CardHeader>
			<CardTitle>Akun Terdaftar</CardTitle>
		</CardHeader>
		<CardContent>
			<p class="text-3xl font-semibold text-slate-900">{formatNumber(data.overview.accounts.total)}</p>
			<p class="mt-1 text-sm text-slate-500">{formatNumber(data.overview.accounts.active)} aktif</p>
		</CardContent>
	</Card>
	<Card class="bg-white/90 shadow-sm backdrop-blur">
		<CardHeader>
			<CardTitle>Total Debit (5 Jurnal Terakhir)</CardTitle>
		</CardHeader>
		<CardContent>
			<p class="text-3xl font-semibold text-slate-900">
				{formatCurrency(data.overview.journals.totalDebit)}
			</p>
			<p class="mt-1 text-sm text-slate-500">Ringkasan transaksi terbaru</p>
		</CardContent>
	</Card>
	<Card class="bg-white/90 shadow-sm backdrop-blur">
		<CardHeader>
			<CardTitle>Total Kredit (5 Jurnal Terakhir)</CardTitle>
		</CardHeader>
		<CardContent>
			<p class="text-3xl font-semibold text-slate-900">
				{formatCurrency(data.overview.journals.totalCredit)}
			</p>
			<p class="mt-1 text-sm text-slate-500">Saldo harus seimbang dengan debit</p>
		</CardContent>
	</Card>
	<Card class="bg-white/90 shadow-sm backdrop-blur">
		<CardHeader>
			<CardTitle>Kontrol Internal</CardTitle>
		</CardHeader>
		<CardContent>
			<p class="text-sm text-slate-600">
				Gunakan menu ini untuk memastikan seluruh transaksi POS tercatat dan siap audit.
			</p>
		</CardContent>
	</Card>
</div>

<Card class="bg-white/90 shadow-sm backdrop-blur">
	<CardHeader>
		<CardTitle>Jurnal Terbaru</CardTitle>
	</CardHeader>
	<CardContent>
		{#if data.overview.journals.recent.length === 0}
			<p class="text-sm text-slate-500">Belum ada jurnal yang tercatat.</p>
		{:else}
			<div class="overflow-x-auto">
				<table class="min-w-full text-left text-sm text-slate-600">
					<thead class="text-xs uppercase text-slate-400">
						<tr>
							<th class="pb-2 pr-4">Nomor</th>
							<th class="pb-2 pr-4">Tanggal</th>
							<th class="pb-2 pr-4">Memo</th>
							<th class="pb-2 pr-4">Debit</th>
							<th class="pb-2 pr-4">Kredit</th>
							<th class="pb-2">Status</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each data.overview.journals.recent as journal (journal.id ?? journal.number)}
							<tr class="align-top">
								<td class="py-3 pr-4 font-medium text-slate-900">{journal.number}</td>
								<td class="py-3 pr-4">{formatDate(journal.entryDate)}</td>
								<td class="py-3 pr-4 text-slate-500">
									{journal.memo || '—'}
								</td>
								<td class="py-3 pr-4">{formatCurrency(journal.totalDebit)}</td>
								<td class="py-3 pr-4">{formatCurrency(journal.totalCredit)}</td>
								<td class="py-3">
									<Badge variant={statusVariant[journal.status]}>{statusLabel[journal.status]}</Badge>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</CardContent>
</Card>
