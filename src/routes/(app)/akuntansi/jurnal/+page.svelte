<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Select from '$lib/components/ui/select.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import Badge from '$lib/components/ui/badge.svelte';

	export let data: {
		entries: Array<{
			id: string;
			number: string;
			entryDate: Date;
			memo: string | null;
			reference: string | null;
			status: 'draft' | 'posted' | 'void';
			postedAt: Date | null;
			totalDebit: number;
			totalCredit: number;
		}>;
		filters: { status: string; from: string; to: string };
	};

	const statusVariant: Record<'draft' | 'posted' | 'void', 'muted' | 'success' | 'destructive'> = {
		draft: 'muted',
		posted: 'success',
		void: 'destructive'
	};

	const formatCurrency = (value: number) =>
		`Rp ${value.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
	const formatDateTime = (value: Date | null) =>
		value
			? new Date(value).toLocaleString('id-ID', {
				day: 'numeric',
				month: 'short',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			})
			: '—';
</script>

<form
	method="GET"
	class="grid gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur md:grid-cols-[160px_160px_160px_auto]"
>
	<div class="space-y-2">
		<Label for="from">Dari Tanggal</Label>
		<Input id="from" name="from" type="date" value={data.filters.from} />
	</div>
	<div class="space-y-2">
		<Label for="to">Sampai Tanggal</Label>
		<Input id="to" name="to" type="date" value={data.filters.to} />
	</div>
	<div class="space-y-2">
		<Label for="status">Status</Label>
		<Select id="status" name="status" value={data.filters.status}>
			<option value="">Semua Status</option>
			<option value="draft">Draft</option>
			<option value="posted">Posted</option>
			<option value="void">Void</option>
		</Select>
	</div>
	<div class="flex items-end justify-end gap-2">
		<Button type="submit" className="gap-2">
			Filter Jurnal
		</Button>
		<a
			href="/akuntansi/jurnal"
			class="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
		>
			Reset
		</a>
	</div>
</form>

<Card class="bg-white/90 shadow-sm backdrop-blur">
	<CardHeader>
		<CardTitle>Daftar Jurnal</CardTitle>
	</CardHeader>
	<CardContent>
		{#if data.entries.length === 0}
			<p class="text-sm text-slate-500">Belum ada jurnal yang sesuai filter.</p>
		{:else}
			<div class="overflow-x-auto">
				<table class="min-w-full text-left text-sm text-slate-600">
					<thead class="text-xs uppercase text-slate-400">
						<tr>
							<th class="pb-2 pr-4">Nomor</th>
							<th class="pb-2 pr-4">Tanggal</th>
							<th class="pb-2 pr-4">Memo</th>
							<th class="pb-2 pr-4">Referensi</th>
							<th class="pb-2 pr-4">Total Debit</th>
							<th class="pb-2 pr-4">Total Kredit</th>
							<th class="pb-2 pr-4">Diposting</th>
							<th class="pb-2">Status</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each data.entries as entry (entry.id ?? entry.number)}
							<tr>
								<td class="py-3 pr-4 font-medium text-slate-900">{entry.number}</td>
								<td class="py-3 pr-4">{formatDateTime(entry.entryDate)}</td>
								<td class="py-3 pr-4 text-slate-500">{entry.memo || '—'}</td>
								<td class="py-3 pr-4 text-slate-500">{entry.reference || '—'}</td>
								<td class="py-3 pr-4">{formatCurrency(entry.totalDebit)}</td>
								<td class="py-3 pr-4">{formatCurrency(entry.totalCredit)}</td>
								<td class="py-3 pr-4">{formatDateTime(entry.postedAt)}</td>
								<td class="py-3">
									<Badge variant={statusVariant[entry.status]}>
										{entry.status === 'draft' ? 'Draft' : entry.status === 'posted' ? 'Posted' : 'Void'}
									</Badge>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</CardContent>
</Card>
