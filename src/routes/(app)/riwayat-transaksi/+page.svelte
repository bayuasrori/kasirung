<script lang="ts">
	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import CardDescription from '$lib/components/ui/card-description.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Button from '$lib/components/ui/button.svelte';
import { History as HistoryIcon, Search, Trash2 } from 'lucide-svelte';

	export let data: {
		history: {
			items: Array<{
				id: string;
				number: string;
				subtotal: string;
				tax: string;
				discount: string;
				total: string;
				status: string;
				createdAt: Date;
				cashier: string | null;
				customer: string | null;
			}>;
			total: number;
			page: number;
			pageSize: number;
			pageCount: number;
			filters: { search: string; startDate: string; endDate: string };
		};
	form?: { error?: string };
	};

	const history = data.history;
	const filters = history.filters;
	const hasActiveFilter = Boolean(filters.search || filters.startDate || filters.endDate);
const actionError = data.form?.error ?? '';

	const statusLabels: Record<string, string> = {
		completed: 'Selesai',
		pending: 'Menunggu',
		void: 'Dibatalkan'
	};

	const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'muted'> = {
		completed: 'success',
		pending: 'warning',
		void: 'destructive'
	};

	const formatCurrency = (value: string | number) =>
		`Rp ${Number(value ?? 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;

	const formatDate = (value: Date) =>
		new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

	const getStatusLabel = (status: string) => statusLabels[status] ?? status;
	const getStatusVariant = (status: string) => statusVariants[status] ?? 'muted';

const canDeleteTransaction = (value: Date) => {
	const createdAt = new Date(value);
	const now = new Date();
	const startOfToday = new Date(now);
	startOfToday.setHours(0, 0, 0, 0);
	const endOfToday = new Date(now);
	endOfToday.setHours(23, 59, 59, 999);
	return createdAt >= startOfToday && createdAt <= endOfToday;
};

	const buildQuery = (updates: Record<string, string | number | undefined>) => {
		const params = new URLSearchParams();
		if (filters.search) {
			params.set('search', filters.search);
		}
		if (filters.startDate) {
			params.set('startDate', filters.startDate);
		}
		if (filters.endDate) {
			params.set('endDate', filters.endDate);
		}
		if (history.page > 1) {
			params.set('page', String(history.page));
		}

		for (const [key, value] of Object.entries(updates)) {
			if (value === undefined || value === '') {
				params.delete(key);
				continue;
			}
			if (key === 'page' && Number(value) <= 1) {
				params.delete('page');
				continue;
			}
			params.set(key, String(value));
		}

		const query = params.toString();
		return query ? `?${query}` : '';
	};
</script>

<div class="space-y-6">
	<Card>
		<CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div class="flex items-center gap-3">
				<div class="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900/5 text-slate-700">
					<HistoryIcon class="h-5 w-5" />
				</div>
				<div>
					<CardTitle>Riwayat Transaksi</CardTitle>
					<CardDescription>Telusuri transaksi yang tercatat pada sistem kasir.</CardDescription>
				</div>
			</div>
			<Badge variant="muted">Total {history.total} transaksi</Badge>
		</CardHeader>
		<CardContent>
			<p class="text-sm text-slate-500">
				Gunakan filter pencarian untuk menemukan transaksi berdasarkan nomor, nama kasir, atau pelanggan.
			</p>
		</CardContent>
	</Card>

	<form
		method="GET"
		class="grid gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur md:grid-cols-[minmax(200px,_1fr)_200px_200px_auto]"
	>
		<div class="space-y-2">
			<Label for="search">Cari Transaksi</Label>
			<div class="relative">
				<Input
					id="search"
					name="search"
					placeholder="Nomor transaksi, kasir, atau pelanggan"
					value={filters.search}
					className="pl-9"
				/>
				<Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
			</div>
		</div>
		<div class="space-y-2">
			<Label for="startDate">Dari Tanggal</Label>
			<Input id="startDate" name="startDate" type="date" value={filters.startDate} />
		</div>
		<div class="space-y-2">
			<Label for="endDate">Sampai Tanggal</Label>
			<Input id="endDate" name="endDate" type="date" value={filters.endDate} />
		</div>
		<div class="flex items-end gap-3">
			<Button type="submit" className="gap-2">
				<Search class="h-4 w-4" />
				Cari
			</Button>
			{#if hasActiveFilter}
				<a
					href={buildQuery({ search: undefined, startDate: undefined, endDate: undefined, page: undefined })}
					class="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
				>
					Reset
				</a>
			{/if}
		</div>
	</form>

	{#if actionError}
		<div class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
			{actionError}
		</div>
	{/if}

	<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-sm">
		<table class="min-w-full divide-y divide-slate-200 text-sm">
			<thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
				<tr>
					<th class="px-4 py-3">Nomor</th>
					<th class="px-4 py-3">Kasir</th>
					<th class="px-4 py-3">Pelanggan</th>
					<th class="px-4 py-3 text-right">Subtotal</th>
					<th class="px-4 py-3 text-right">Pajak</th>
					<th class="px-4 py-3 text-right">Diskon</th>
					<th class="px-4 py-3 text-right">Total</th>
					<th class="px-4 py-3 text-center">Status</th>
					<th class="px-4 py-3 text-right">Waktu</th>
					<th class="px-4 py-3 text-right">Aksi</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-slate-100 bg-white">
				{#if history.items.length}
					{#each history.items as transaction}
						<tr class="hover:bg-blue-50/40">
							<td class="px-4 py-3 font-medium text-slate-900">{transaction.number}</td>
							<td class="px-4 py-3 text-slate-600">{transaction.cashier ?? '-'}</td>
							<td class="px-4 py-3 text-slate-600">{transaction.customer ?? 'Umum'}</td>
							<td class="px-4 py-3 text-right text-slate-600">{formatCurrency(transaction.subtotal)}</td>
							<td class="px-4 py-3 text-right text-slate-600">{formatCurrency(transaction.tax)}</td>
						<td class="px-4 py-3 text-right text-slate-600">{formatCurrency(transaction.discount)}</td>
						<td class="px-4 py-3 text-right font-semibold text-slate-900">{formatCurrency(transaction.total)}</td>
						<td class="px-4 py-3 text-center">
								<Badge variant={getStatusVariant(transaction.status)}>{getStatusLabel(transaction.status)}</Badge>
							</td>
						<td class="px-4 py-3 text-right text-slate-500">{formatDate(transaction.createdAt)}</td>
						<td class="px-4 py-3 text-right">
							{#if canDeleteTransaction(transaction.createdAt)}
								<form method="post" action="?/hapus" class="inline-flex items-center justify-end gap-2">
									<input type="hidden" name="transactionId" value={transaction.id} />
									<Button type="submit" variant="destructive" size="sm" className="gap-2">
										<Trash2 class="h-4 w-4" />
										Hapus
									</Button>
								</form>
							{:else}
								<span class="text-xs text-slate-400">Tidak dapat dihapus</span>
							{/if}
						</td>
						</tr>
					{/each}
				{:else}
				<tr>
					<td class="px-4 py-8 text-center text-sm text-slate-500" colspan="10">Belum ada transaksi yang cocok dengan filter.</td>
				</tr>
				{/if}
			</tbody>
		</table>
	</div>

	{#if history.pageCount > 1}
		<div class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
			<p>
				Halaman {history.page} dari {history.pageCount}
			</p>
			<div class="flex items-center gap-2">
				{#if history.page > 1}
					<a class="rounded-lg border border-slate-200 px-3 py-1 hover:bg-slate-100" href={buildQuery({ page: history.page - 1 })}>Sebelumnya</a>
				{/if}
				{#if history.page < history.pageCount}
					<a class="rounded-lg border border-slate-200 px-3 py-1 hover:bg-slate-100" href={buildQuery({ page: history.page + 1 })}>Berikutnya</a>
				{/if}
			</div>
		</div>
	{/if}
</div>
