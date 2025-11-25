<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Select from '$lib/components/ui/select.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';

	export let data: {
		accounts: Array<{
			id: string;
			code: string;
			name: string;
			type: string;
			isActive: boolean;
		}>;
		ledger: {
			accountId: string | null;
			lines: Array<{
				lineId: string;
				entryId: string;
				number: string;
				entryDate: Date;
				memo: string | null;
				description: string | null;
				debit: number;
				credit: number;
				balance: number;
			}>;
			totalDebit: number;
			totalCredit: number;
		};
		filters: { accountId: string; from: string; to: string };
	};

	const formatCurrency = (value: number) =>
		`Rp ${value.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
	const formatDate = (value: Date) =>
		new Date(value).toLocaleDateString('id-ID', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
</script>

<form
	method="GET"
	class="grid gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur md:grid-cols-[minmax(220px,1fr)_160px_160px_auto]"
>
	<div class="space-y-2">
		<Label for="accountId">Pilih Akun</Label>
		<Select id="accountId" name="accountId" value={data.filters.accountId}>
			<option value="">Semua Akun</option>
			{#each data.accounts as account (account.id)}
				<option value={account.id}>
					{account.code} — {account.name}
				</option>
			{/each}
		</Select>
	</div>
	<div class="space-y-2">
		<Label for="from">Dari Tanggal</Label>
		<Input id="from" name="from" type="date" value={data.filters.from} />
	</div>
	<div class="space-y-2">
		<Label for="to">Sampai Tanggal</Label>
		<Input id="to" name="to" type="date" value={data.filters.to} />
	</div>
	<div class="flex items-end justify-end gap-2">
		<Button type="submit" className="gap-2">Lihat Buku Besar</Button>
		<a
			href="/akuntansi/buku-besar"
			class="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
		>
			Reset
		</a>
	</div>
</form>

<Card class="bg-white/90 shadow-sm backdrop-blur">
	<CardHeader>
		<CardTitle>Detail Buku Besar</CardTitle>
	</CardHeader>
	<CardContent class="space-y-4">
		{#if !data.ledger.accountId}
			<p class="text-sm text-slate-500">
				Silakan pilih akun untuk menampilkan riwayat transaksi dan saldo berjalan.
			</p>
		{:else if data.ledger.lines.length === 0}
			<p class="text-sm text-slate-500">
				Tidak ada transaksi pada rentang tanggal yang dipilih.
			</p>
		{:else}
			<div class="overflow-x-auto">
				<table class="min-w-full text-left text-sm text-slate-600">
					<thead class="text-xs uppercase text-slate-400">
						<tr>
							<th class="pb-2 pr-4">Tanggal</th>
							<th class="pb-2 pr-4">No. Jurnal</th>
							<th class="pb-2 pr-4">Memo</th>
							<th class="pb-2 pr-4">Debit</th>
							<th class="pb-2 pr-4">Kredit</th>
							<th class="pb-2">Saldo Berjalan</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each data.ledger.lines as line (line.lineId ?? `${line.number}-${line.entryDate}`)}
							<tr>
								<td class="py-3 pr-4">{formatDate(line.entryDate)}</td>
								<td class="py-3 pr-4 font-medium text-slate-900">{line.number}</td>
								<td class="py-3 pr-4 text-slate-500">
									{line.memo || line.description || '—'}
								</td>
								<td class="py-3 pr-4">{formatCurrency(line.debit)}</td>
								<td class="py-3 pr-4">{formatCurrency(line.credit)}</td>
								<td class="py-3 font-medium text-slate-900">{formatCurrency(line.balance)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<div class="flex flex-wrap items-center justify-end gap-4 border-t border-slate-200 pt-4 text-sm text-slate-600">
				<span>Total Debit: <strong class="text-slate-900">{formatCurrency(data.ledger.totalDebit)}</strong></span>
				<span>Total Kredit: <strong class="text-slate-900">{formatCurrency(data.ledger.totalCredit)}</strong></span>
			</div>
		{/if}
	</CardContent>
</Card>
