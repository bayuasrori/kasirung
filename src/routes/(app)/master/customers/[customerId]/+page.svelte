<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { ArrowLeft, Download, FileText, Wallet } from 'lucide-svelte';

	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import CardDescription from '$lib/components/ui/card-description.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Select from '$lib/components/ui/select.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';

	export let data: {
		customer: {
			id: string;
			name: string;
			email: string | null;
			phone: string | null;
			address: string | null;
			notes: string | null;
		};
		ledger: {
			items: Array<{
				id: string;
				number: string;
				createdAt: Date;
				subtotal: number;
				tax: number;
				discount: number;
				total: number;
				status: string;
				paymentStatus: string;
				paymentMethod: 'cash' | 'qris' | 'debit' | 'credit';
				paymentAmount: number;
				cashier: string | null;
			}>;
			total: number;
			page: number;
			pageSize: number;
			pageCount: number;
			filters: { startDate?: string; endDate?: string; status: 'all' | 'paid' | 'pending' };
		};
		summary: {
			totalTransactions: number;
			totalAmount: number;
			pendingAmount: number;
			pendingCount: number;
			lastTransactionAt: Date | null;
		};
		outstanding: Array<{
			id: string;
			number: string;
			createdAt: Date;
			total: number;
			paymentAmount: number;
			paymentStatus: string;
		}>;
		outstandingAmount: number;
		filters: { startDate?: string; endDate?: string; status: 'all' | 'paid' | 'pending' };
		validationErrors: Record<string, string[]> | null;
		finance: {
			savings: {
				totalDeposits: number;
				totalWithdrawals: number;
				balance: number;
				transactions: Array<{
					id: string;
					type: 'deposit' | 'withdraw';
					amount: number;
					note: string | null;
					reference: string | null;
					createdAt: Date;
				}>;
			};
			loans: {
				items: Array<{
					id: string;
					principal: number;
					balance: number;
					interestRate: number;
					termMonths: number | null;
					status: 'active' | 'closed' | 'defaulted';
					issuedAt: Date;
					dueDate: Date | null;
					notes: string | null;
					createdAt: Date;
					totalPaid: number;
				}>;
				totalOutstanding: number;
				activeCount: number;
				recentTransactions: Array<{
					id: string;
					loanId: string;
					type: 'disbursement' | 'repayment' | 'interest' | 'penalty' | 'adjustment';
					amount: number;
					note: string | null;
					reference: string | null;
					createdAt: Date;
				}>;
			};
		};
		form: {
			type: 'savings' | 'loanCreate' | 'loanRepayment' | 'payFromSavings' | 'loanPayFromSavings';
			errors?: Record<string, string[]>;
			values?: Record<string, FormDataEntryValue>;
			success?: boolean;
		} | null;
	};

	let customer = data.customer;
	let ledger = data.ledger;
	let summary = data.summary;
	let outstanding = data.outstanding;
	let outstandingAmount = data.outstandingAmount;
	let finance = data.finance;
	let validationErrors = data.validationErrors;
	let formState = data.form;
	let filters = ledger.filters;
	let savingsForm = formState?.type === 'savings' ? formState : null;
	let loanCreateForm = formState?.type === 'loanCreate' ? formState : null;
let loanRepaymentForm = formState?.type === 'loanRepayment' ? formState : null;
let payFromSavingsForm = formState?.type === 'payFromSavings' ? formState : null;
let loanPayFromSavingsForm = formState?.type === 'loanPayFromSavings' ? formState : null;

	$: customer = data.customer;
	$: ledger = data.ledger;
	$: summary = data.summary;
	$: outstanding = data.outstanding;
	$: outstandingAmount = data.outstandingAmount;
	$: finance = data.finance;
	$: validationErrors = data.validationErrors;
	$: formState = data.form;
	$: filters = ledger.filters;
	$: savingsForm = formState?.type === 'savings' ? formState : null;
	$: loanCreateForm = formState?.type === 'loanCreate' ? formState : null;
$: loanRepaymentForm = formState?.type === 'loanRepayment' ? formState : null;
$: payFromSavingsForm = formState?.type === 'payFromSavings' ? formState : null;
$: loanPayFromSavingsForm = formState?.type === 'loanPayFromSavings' ? formState : null;

	let savingsSubmitting = false;
	let loanCreateSubmitting = false;
let loanRepaymentSubmitting = new Set<string>();
let payFromSavingsSubmitting = new Set<string>();
let loanPayFromSavingsSubmitting = new Set<string>();

	const statusLabels: Record<string, string> = {
		paid: 'Lunas',
		pending: 'Belum Lunas'
	};

	const statusVariants: Record<string, 'success' | 'warning' | 'muted'> = {
		paid: 'success',
		pending: 'warning'
	};

	const paymentMethodLabels: Record<'cash' | 'qris' | 'debit' | 'credit', string> = {
		cash: 'Tunai',
		qris: 'QRIS',
		debit: 'Debit',
		credit: 'Kredit'
	};

	const formatCurrency = (value: number | string) =>
		`Rp ${Number(value ?? 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;

	const formatDate = (value: Date) =>
		new Date(value).toLocaleDateString('id-ID', { dateStyle: 'medium' });

	const formatDateTime = (value: Date) =>
		new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

	const hasFilters = Boolean(filters.startDate || filters.endDate || (filters.status && filters.status !== 'all'));

	const formatPercent = (value: number) => `${value.toFixed(2)}%`;

	const savingTypeLabels: Record<'deposit' | 'withdraw', string> = {
		deposit: 'Simpanan',
		withdraw: 'Penarikan'
	};

	const loanStatusLabels: Record<'active' | 'closed' | 'defaulted', string> = {
		active: 'Berjalan',
		closed: 'Lunas',
		defaulted: 'Macet'
	};

	const loanTransactionLabels: Record<string, string> = {
		disbursement: 'Pencairan',
		repayment: 'Angsuran',
		interest: 'Bunga',
		penalty: 'Denda',
		adjustment: 'Penyesuaian'
	};

	const getFormValue = (form: { values?: Record<string, FormDataEntryValue> } | null, field: string) =>
		(form?.values?.[field] as string | undefined) ?? '';

	type GenericSubmit = SubmitFunction<Record<string, unknown>, Record<string, unknown>>;

	const savingsEnhance: GenericSubmit = ({ formElement }) => {
		savingsSubmitting = true;
		return async ({ update, result }) => {
			savingsSubmitting = false;
			await update();
			if (result.type === 'success') {
				formElement.reset();
			}
		};
	};

	const loanCreateEnhance: GenericSubmit = ({ formElement }) => {
		loanCreateSubmitting = true;
		return async ({ update, result }) => {
			loanCreateSubmitting = false;
			await update();
			if (result.type === 'success') {
				formElement.reset();
			}
		};
	};

	const loanRepaymentEnhance: GenericSubmit = ({ formElement }) => {
		const loanId = (formElement.querySelector('input[name="loanId"]') as HTMLInputElement | null)?.value;
		if (loanId) {
			const next = new Set(loanRepaymentSubmitting);
			next.add(loanId);
			loanRepaymentSubmitting = next;
		}
		return async ({ update, result }) => {
			if (loanId) {
				const next = new Set(loanRepaymentSubmitting);
				next.delete(loanId);
				loanRepaymentSubmitting = next;
			}
			await update();
			if (result.type === 'success') {
				formElement.reset();
				if (loanId) {
					const hidden = formElement.querySelector('input[name="loanId"]') as HTMLInputElement | null;
					if (hidden) hidden.value = loanId;
				}
			}
		};
	};

	const payFromSavingsEnhance: GenericSubmit = ({ formElement }) => {
		const transactionId = (formElement.querySelector('input[name="transactionId"]') as HTMLInputElement | null)?.value;
		if (transactionId) {
			const next = new Set(payFromSavingsSubmitting);
			next.add(transactionId);
			payFromSavingsSubmitting = next;
		}
		return async ({ update, result }) => {
			if (transactionId) {
				const next = new Set(payFromSavingsSubmitting);
				next.delete(transactionId);
				payFromSavingsSubmitting = next;
			}
			await update();
			if (result.type === 'success') {
				formElement.reset();
			}
		};
	};

	const loanPayFromSavingsEnhance: GenericSubmit = ({ formElement }) => {
		const loanId = (formElement.querySelector('input[name="loanId"]') as HTMLInputElement | null)?.value;
		if (loanId) {
			const next = new Set(loanPayFromSavingsSubmitting);
			next.add(loanId);
			loanPayFromSavingsSubmitting = next;
		}
		return async ({ update, result }) => {
			if (loanId) {
				const next = new Set(loanPayFromSavingsSubmitting);
				next.delete(loanId);
				loanPayFromSavingsSubmitting = next;
			}
			await update();
			if (result.type === 'success') {
				formElement.reset();
				if (loanId) {
					const hidden = formElement.querySelector('input[name="loanId"]') as HTMLInputElement | null;
					if (hidden) hidden.value = loanId;
				}
			}
		};
	};


	const buildQuery = (updates: Record<string, string | number | undefined>) => {
		const params = new URLSearchParams();
		if (filters.startDate) params.set('startDate', filters.startDate);
		if (filters.endDate) params.set('endDate', filters.endDate);
		if (filters.status && filters.status !== 'all') params.set('status', filters.status);
		if (ledger.page > 1) params.set('page', String(ledger.page));

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

	const debtDownloadUrl = `/master/customers/${customer.id}/debt`;
</script>

<div class="space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div class="space-y-1">
			<a href="/master/customers" class="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
				<ArrowLeft class="h-4 w-4" />
				Kembali ke daftar pelanggan
			</a>
			<h1 class="text-xl font-semibold text-slate-900">Buku Transaksi - {customer.name}</h1>
			<p class="text-sm text-slate-500">Pantau riwayat transaksi dan piutang pelanggan untuk tindak lanjut penagihan.</p>
		</div>
		<Button
			type="button"
			variant="outline"
			className="gap-2"
			href={outstandingAmount > 0 ? debtDownloadUrl : undefined}
			disabled={outstandingAmount === 0}
		>
			<Download class="h-4 w-4" />
			Cetak daftar hutang
		</Button>
	</div>

	<nav class="flex flex-wrap items-center gap-2 text-sm">
		<a
			href="#ledger"
			class="rounded-lg border border-slate-200 px-3 py-1 text-slate-600 hover:bg-slate-100"
		>
			Riwayat belanja
		</a>
		<a
			href="#savings"
			class="rounded-lg border border-slate-200 px-3 py-1 text-slate-600 hover:bg-slate-100"
		>
			Simpanan
		</a>
		<a
			href="#loans"
			class="rounded-lg border border-slate-200 px-3 py-1 text-slate-600 hover:bg-slate-100"
		>
			Pinjaman
		</a>
	</nav>

	<div id="ledger" class="grid gap-4 md:grid-cols-3">
		<Card className="border-slate-200">
			<CardHeader>
				<CardTitle>Total Transaksi</CardTitle>
				<CardDescription>Jumlah transaksi terdata untuk pelanggan.</CardDescription>
			</CardHeader>
			<CardContent>
				<p class="text-2xl font-semibold text-slate-900">{summary.totalTransactions}</p>
				{#if summary.lastTransactionAt}
					<p class="text-xs text-slate-500">Terakhir: {formatDateTime(summary.lastTransactionAt)}</p>
				{/if}
			</CardContent>
		</Card>
		<Card className="border-slate-200">
			<CardHeader>
				<CardTitle>Total Belanja</CardTitle>
				<CardDescription>Akumulasi nominal seluruh transaksi.</CardDescription>
			</CardHeader>
			<CardContent>
				<p class="text-2xl font-semibold text-slate-900">{formatCurrency(summary.totalAmount)}</p>
			</CardContent>
		</Card>
		<Card className={`border ${outstandingAmount > 0 ? 'border-amber-200 bg-amber-50/80' : 'border-emerald-200 bg-emerald-50/80'}`}>
			<CardHeader>
				<CardTitle>Piutang Berjalan</CardTitle>
				<CardDescription>Nominal transaksi kredit yang belum lunas.</CardDescription>
			</CardHeader>
			<CardContent>
				<p
					class="text-2xl font-semibold"
					class:text-amber-700={outstandingAmount > 0}
					class:text-emerald-700={outstandingAmount <= 0}
				>
					{formatCurrency(outstandingAmount)}
				</p>
					<p class="text-xs text-slate-500">{summary.pendingCount} transaksi kredit</p>
			</CardContent>
		</Card>
	</div>

	<div class="grid gap-4 lg:grid-cols-[2fr_1fr]">
		<section class="space-y-4">
			<form method="GET" class="grid gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur md:grid-cols-[repeat(4,minmax(0,1fr))]">
				<div class="space-y-2">
					<Label for="startDate">Dari Tanggal</Label>
					<Input id="startDate" name="startDate" type="date" value={filters.startDate} />
					{#if validationErrors?.startDate?.length}
						<p class="text-xs text-red-500">{validationErrors.startDate[0]}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="endDate">Sampai Tanggal</Label>
					<Input id="endDate" name="endDate" type="date" value={filters.endDate} />
					{#if validationErrors?.endDate?.length}
						<p class="text-xs text-red-500">{validationErrors.endDate[0]}</p>
					{/if}
				</div>
				<div class="space-y-2">
					<Label for="status">Status Pembayaran</Label>
					<Select id="status" name="status" value={filters.status}>
						<option value="all">Semua</option>
						<option value="paid">Lunas</option>
						<option value="pending">Belum lunas</option>
					</Select>
				</div>
				<div class="flex items-end gap-2">
					<Button type="submit" className="w-full gap-2">
						<FileText class="h-4 w-4" />
						Terapkan
					</Button>
					{#if hasFilters}
						<a
							href={buildQuery({ startDate: undefined, endDate: undefined, status: undefined, page: undefined })}
							class="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
						>
							Reset
						</a>
					{/if}
				</div>
			</form>

			{#if ledger.items.length}
				<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
					<table class="min-w-full divide-y divide-slate-200 text-sm">
						<thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
							<tr>
								<th class="px-4 py-3">Nomor</th>
								<th class="px-4 py-3">Tanggal</th>
								<th class="px-4 py-3">Kasir</th>
								<th class="px-4 py-3">Metode</th>
								<th class="px-4 py-3 text-right">Subtotal</th>
								<th class="px-4 py-3 text-right">Diskon</th>
								<th class="px-4 py-3 text-right">Total</th>
								<th class="px-4 py-3 text-center">Pembayaran</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-100">
							{#each ledger.items as item (item.id)}
								<tr class="hover:bg-blue-50/40">
									<td class="px-4 py-3 font-medium text-slate-900">{item.number}</td>
									<td class="px-4 py-3 text-slate-600">{formatDateTime(item.createdAt)}</td>
									<td class="px-4 py-3 text-slate-600">{item.cashier ?? '-'}</td>
									<td class="px-4 py-3">
										<Badge variant="muted">{paymentMethodLabels[item.paymentMethod]}</Badge>
									</td>
									<td class="px-4 py-3 text-right text-slate-600">{formatCurrency(item.subtotal)}</td>
									<td class="px-4 py-3 text-right text-slate-600">{formatCurrency(item.discount)}</td>
									<td class="px-4 py-3 text-right font-semibold text-slate-900">{formatCurrency(item.total)}</td>
									<td class="px-4 py-3 text-center">
										<Badge variant={statusVariants[item.paymentStatus] ?? 'muted'}>{statusLabels[item.paymentStatus] ?? item.paymentStatus}</Badge>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<div class="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-sm text-slate-500">
					Belum ada transaksi yang sesuai dengan filter.
				</div>
			{/if}

			{#if ledger.pageCount > 1}
				<div class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
					<p>Halaman {ledger.page} dari {ledger.pageCount}</p>
					<div class="flex items-center gap-2">
						{#if ledger.page > 1}
							<a class="rounded-lg border border-slate-200 px-3 py-1" href={buildQuery({ page: ledger.page - 1 })}>Sebelumnya</a>
						{/if}
						{#if ledger.page < ledger.pageCount}
							<a class="rounded-lg border border-slate-200 px-3 py-1" href={buildQuery({ page: ledger.page + 1 })}>Berikutnya</a>
						{/if}
					</div>
				</div>
			{/if}
		</section>

		<aside class="space-y-4">
			<Card className="border-slate-200">
				<CardHeader className="flex flex-col gap-3">
					<div class="flex items-center gap-3">
						<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
							<Wallet class="h-5 w-5" />
						</div>
						<div>
							<CardTitle>Profil Pelanggan</CardTitle>
							<CardDescription>Gunakan informasi ini untuk konfirmasi penagihan.</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-3 text-sm text-slate-600">
					<p><span class="font-medium text-slate-900">Nama:</span> {customer.name}</p>
					<p><span class="font-medium text-slate-900">Telepon:</span> {customer.phone ?? '-'}</p>
					<p><span class="font-medium text-slate-900">Email:</span> {customer.email ?? '-'}</p>
					<p><span class="font-medium text-slate-900">Alamat:</span> {customer.address ?? '-'}</p>
					{#if customer.notes}
						<p class="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">{customer.notes}</p>
					{/if}
				</CardContent>
			</Card>

			<Card className="border-slate-200">
				<CardHeader>
					<CardTitle>Daftar Piutang</CardTitle>
					<CardDescription>Transaksi kredit yang belum ditagih.</CardDescription>
				</CardHeader>
				<CardContent>
						{#if outstanding.length}
							<ul class="space-y-3 text-sm text-slate-600">
								{#each outstanding as item (item.id)}
									<li class="rounded-lg border border-amber-200 bg-amber-50/60 p-3">
										<div class="flex items-center justify-between">
											<div>
												<p class="font-medium text-slate-900">{item.number}</p>
												<p class="text-xs text-slate-500">{formatDate(item.createdAt)}</p>
											</div>
											<span class="text-sm font-semibold text-amber-700">{formatCurrency(item.paymentAmount)}</span>
										</div>
										<div class="mt-3 space-y-2">
											{#if payFromSavingsForm?.success && payFromSavingsForm?.values?.transactionId === item.id}
												<p class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">Piutang dibayarkan dari tabungan.</p>
											{/if}
											<form
												method="POST"
												action="?/payFromSavings"
										class="space-y-2"
												use:enhance={payFromSavingsEnhance}
											>
												<input type="hidden" name="transactionId" value={item.id} />
										<div class="text-xs text-slate-500">
											<p>Saldo tabungan: {formatCurrency(finance.savings.balance)}</p>
											<p>Sisa piutang: {formatCurrency(item.paymentAmount)}</p>
										</div>
										<div class="flex flex-col gap-2 sm:flex-row sm:items-center">
											<Input
												name="amount"
												type="number"
												min="0"
												step="1000"
												max={item.paymentAmount}
												required
												value={
													payFromSavingsForm?.values?.transactionId === item.id
														? getFormValue(payFromSavingsForm, 'amount')
														: String(item.paymentAmount)
												}
												className="sm:flex-1"
												placeholder="Nominal pembayaran"
											/>
											<Button
										type="submit"
												variant="ghost"
												className="gap-2 text-emerald-700 hover:bg-emerald-50"
												disabled={payFromSavingsSubmitting.has(item.id) || finance.savings.balance <= 0}
											>
												<FileText class="h-4 w-4" />
												{#if payFromSavingsSubmitting.has(item.id)}
													Memproses...
												{:else if finance.savings.balance <= 0}
													Saldo kosong
												{:else}
													Bayar dari tabungan
												{/if}
											</Button>
										</div>
										{#if payFromSavingsForm?.values?.transactionId === item.id && payFromSavingsForm?.errors}
											{#if payFromSavingsForm.errors.amount?.length}
												<p class="text-xs text-red-500">{payFromSavingsForm.errors.amount[0]}</p>
											{/if}
											{#if payFromSavingsForm.errors.balance?.length}
												<p class="text-xs text-red-500">{payFromSavingsForm.errors.balance[0]}</p>
											{/if}
											{#if payFromSavingsForm.errors.transactionId?.length}
												<p class="text-xs text-red-500">{payFromSavingsForm.errors.transactionId[0]}</p>
											{/if}
										{/if}
											</form>
										</div>
								</li>
							{/each}
						</ul>
					{:else}
						<p class="text-sm text-slate-500">Tidak ada piutang aktif.</p>
					{/if}
				</CardContent>
			</Card>
		</aside>
	</div>

	<div class="grid gap-4 xl:grid-cols-2">
		<Card id="savings" className="border-slate-200">
			<CardHeader>
				<CardTitle>Simpanan Anggota</CardTitle>
				<CardDescription>Catat setoran maupun penarikan tabungan pelanggan.</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div class="grid gap-3 sm:grid-cols-3">
					<div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
						<p class="text-xs text-slate-500">Saldo Tabungan</p>
						<p class="text-lg font-semibold text-slate-900">{formatCurrency(finance.savings.balance)}</p>
					</div>
					<div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
						<p class="text-xs text-slate-500">Total Simpanan</p>
						<p class="text-lg font-semibold text-slate-900">{formatCurrency(finance.savings.totalDeposits)}</p>
					</div>
					<div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
						<p class="text-xs text-slate-500">Total Penarikan</p>
						<p class="text-lg font-semibold text-slate-900">{formatCurrency(finance.savings.totalWithdrawals)}</p>
					</div>
				</div>

				{#if savingsForm?.success}
					<p class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
						Transaksi tabungan berhasil dicatat.
					</p>
				{/if}

				<form method="POST" action="?/savings" class="space-y-4" use:enhance={savingsEnhance}>
					<div class="grid gap-4 sm:grid-cols-2">
						<div class="space-y-2">
							<Label for="savingType">Jenis Transaksi</Label>
							<Select id="savingType" name="type" value={getFormValue(savingsForm, 'type') || 'deposit'}>
								<option value="deposit">Simpanan</option>
								<option value="withdraw">Penarikan</option>
							</Select>
						</div>
						<div class="space-y-2">
							<Label for="savingAmount">Nominal</Label>
							<Input
								id="savingAmount"
								name="amount"
								type="number"
								min="0"
								step="1000"
								placeholder="Rp"
								value={getFormValue(savingsForm, 'amount')}
								required
							/>
							{#if savingsForm?.errors?.amount?.length}
								<p class="text-xs text-red-500">{savingsForm.errors.amount[0]}</p>
							{/if}
						</div>
					</div>
					<div class="grid gap-4 sm:grid-cols-2">
						<div class="space-y-2">
							<Label for="savingReference">Referensi</Label>
							<Input
								id="savingReference"
								name="reference"
								placeholder="No. bukti / kas"
								value={getFormValue(savingsForm, 'reference')}
							/>
							{#if savingsForm?.errors?.reference?.length}
								<p class="text-xs text-red-500">{savingsForm.errors.reference[0]}</p>
							{/if}
						</div>
						<div class="space-y-2">
							<Label for="savingNote">Catatan</Label>
							<Textarea
								id="savingNote"
								name="note"
								rows={2}
								placeholder="Keperluan transaksi"
								value={getFormValue(savingsForm, 'note')}
							/>
							{#if savingsForm?.errors?.note?.length}
								<p class="text-xs text-red-500">{savingsForm.errors.note[0]}</p>
							{/if}
						</div>
					</div>
					<div class="flex justify-end">
						<Button type="submit" className="gap-2" disabled={savingsSubmitting}>
							<FileText class="h-4 w-4" />
							{#if savingsSubmitting}
								Memproses...
							{:else}
								Simpan Transaksi
							{/if}
						</Button>
					</div>
				</form>

				<div class="space-y-3">
					<h4 class="text-sm font-semibold text-slate-900">Riwayat Tabungan</h4>
					{#if finance.savings.transactions.length}
						<div class="overflow-hidden rounded-xl border border-slate-200">
							<table class="min-w-full divide-y divide-slate-200 text-sm">
								<thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
									<tr>
										<th class="px-3 py-2">Tanggal</th>
										<th class="px-3 py-2">Jenis</th>
										<th class="px-3 py-2 text-right">Nominal</th>
										<th class="px-3 py-2">Catatan</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-slate-100">
									{#each finance.savings.transactions as item}
										<tr>
											<td class="px-3 py-2 text-slate-600">{formatDateTime(item.createdAt)}</td>
											<td class="px-3 py-2">
												<Badge variant={item.type === 'deposit' ? 'success' : 'warning'}>{savingTypeLabels[item.type]}</Badge>
											</td>
											<td class="px-3 py-2 text-right font-medium text-slate-900">{formatCurrency(item.amount)}</td>
											<td class="px-3 py-2 text-slate-500">{item.note ?? '-'}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{:else}
						<p class="text-sm text-slate-500">Belum ada aktivitas tabungan.</p>
					{/if}
				</div>
			</CardContent>
		</Card>

		<Card id="loans" className="border-slate-200">
			<CardHeader>
				<CardTitle>Pinjaman Anggota</CardTitle>
				<CardDescription>Kelola pencairan dan angsuran pinjaman pelanggan.</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div class="grid gap-3 sm:grid-cols-3">
					<div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
						<p class="text-xs text-slate-500">Total Outstanding</p>
						<p class="text-lg font-semibold text-slate-900">{formatCurrency(finance.loans.totalOutstanding)}</p>
					</div>
					<div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
						<p class="text-xs text-slate-500">Pinjaman Aktif</p>
						<p class="text-lg font-semibold text-slate-900">{finance.loans.activeCount}</p>
					</div>
					<div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
						<p class="text-xs text-slate-500">Riwayat Transaksi</p>
						<p class="text-lg font-semibold text-slate-900">{finance.loans.recentTransactions.length}</p>
					</div>
				</div>

				{#if loanCreateForm?.success}
					<p class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
						Pinjaman baru berhasil dibuat.
					</p>
				{/if}

				<form
					method="POST"
					action="?/loanCreate"
					class="space-y-4 rounded-xl border border-slate-200 bg-white/70 p-4"
					use:enhance={loanCreateEnhance}
				>
					<h4 class="text-sm font-semibold text-slate-900">Pencairan Pinjaman Baru</h4>
					<div class="grid gap-4 sm:grid-cols-2">
						<div class="space-y-2">
							<Label for="loanPrincipal">Nominal Pokok</Label>
							<Input
								id="loanPrincipal"
								name="principal"
								type="number"
								min="0"
								step="1000"
								placeholder="Rp"
								value={getFormValue(loanCreateForm, 'principal')}
								required
							/>
							{#if loanCreateForm?.errors?.principal?.length}
								<p class="text-xs text-red-500">{loanCreateForm.errors.principal[0]}</p>
							{/if}
						</div>
						<div class="space-y-2">
							<Label for="loanInterest">Bunga (% per tahun)</Label>
							<Input
								id="loanInterest"
								name="interestRate"
								type="number"
								min="0"
								step="0.1"
								placeholder="5"
								value={getFormValue(loanCreateForm, 'interestRate')}
								required
							/>
							{#if loanCreateForm?.errors?.interestRate?.length}
								<p class="text-xs text-red-500">{loanCreateForm.errors.interestRate[0]}</p>
							{/if}
						</div>
					</div>
					<div class="grid gap-4 sm:grid-cols-2">
						<div class="space-y-2">
							<Label for="loanTerm">Tenor (bulan)</Label>
							<Input
								id="loanTerm"
								name="termMonths"
								type="number"
								min="1"
								step="1"
								placeholder="12"
								value={getFormValue(loanCreateForm, 'termMonths')}
							/>
							{#if loanCreateForm?.errors?.termMonths?.length}
								<p class="text-xs text-red-500">{loanCreateForm.errors.termMonths[0]}</p>
							{/if}
						</div>
						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<Label for="loanIssuedAt">Tanggal Cair</Label>
								<Input
									id="loanIssuedAt"
									name="issuedAt"
									type="date"
									value={getFormValue(loanCreateForm, 'issuedAt')}
							/>
								{#if loanCreateForm?.errors?.issuedAt?.length}
									<p class="text-xs text-red-500">{loanCreateForm.errors.issuedAt[0]}</p>
								{/if}
							</div>
							<div class="space-y-2">
								<Label for="loanDueDate">Jatuh Tempo</Label>
								<Input
									id="loanDueDate"
									name="dueDate"
									type="date"
									value={getFormValue(loanCreateForm, 'dueDate')}
							/>
								{#if loanCreateForm?.errors?.dueDate?.length}
									<p class="text-xs text-red-500">{loanCreateForm.errors.dueDate[0]}</p>
								{/if}
							</div>
						</div>
					</div>
					<div class="space-y-2">
						<Label for="loanReference">Referensi</Label>
						<Input
							id="loanReference"
							name="reference"
							placeholder="No. perjanjian"
							value={getFormValue(loanCreateForm, 'reference')}
						/>
						{#if loanCreateForm?.errors?.reference?.length}
							<p class="text-xs text-red-500">{loanCreateForm.errors.reference[0]}</p>
						{/if}
					</div>
					<div class="space-y-2">
						<Label for="loanNotes">Catatan</Label>
						<Textarea
							id="loanNotes"
							name="notes"
							rows={3}
							placeholder="Tujuan pinjaman atau keterangan lain"
							value={getFormValue(loanCreateForm, 'notes')}
						/>
						{#if loanCreateForm?.errors?.notes?.length}
							<p class="text-xs text-red-500">{loanCreateForm.errors.notes[0]}</p>
						{/if}
					</div>
					<div class="flex justify-end">
						<Button type="submit" className="gap-2" disabled={loanCreateSubmitting}>
							<FileText class="h-4 w-4" />
							{#if loanCreateSubmitting}
								Memproses...
							{:else}
								Simpan Pinjaman
							{/if}
						</Button>
					</div>
				</form>

				<div class="space-y-3">
					<h4 class="text-sm font-semibold text-slate-900">Daftar Pinjaman</h4>
					{#if finance.loans.items.length}
						<div class="space-y-4">
							{#each finance.loans.items as loan}
								<div class="rounded-2xl border border-slate-200 bg-white/70 p-4">
									<div class="flex flex-wrap items-start justify-between gap-3">
										<div>
											<p class="text-sm font-semibold text-slate-900">Pinjaman #{loan.id.slice(0, 8).toUpperCase()}</p>
											<p class="text-xs text-slate-500">
												Cair {formatDate(loan.issuedAt)}
												{#if loan.dueDate}
													• Jatuh tempo {formatDate(loan.dueDate)}
												{/if}
											</p>
										</div>
										<Badge variant={loan.status === 'active' ? 'warning' : loan.status === 'closed' ? 'success' : 'destructive'}>
											{loanStatusLabels[loan.status] ?? loan.status}
										</Badge>
									</div>
									<div class="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
										<div>
											<p class="text-xs text-slate-500">Pokok</p>
											<p class="font-medium text-slate-900">{formatCurrency(loan.principal)}</p>
										</div>
										<div>
											<p class="text-xs text-slate-500">Sisa Pinjaman</p>
											<p class="font-medium text-slate-900">{formatCurrency(loan.balance)}</p>
										</div>
										<div>
											<p class="text-xs text-slate-500">Bunga / Pembayaran</p>
											<p class="font-medium text-slate-900">{formatPercent(loan.interestRate)} • {formatCurrency(loan.totalPaid)}</p>
										</div>
									</div>
									{#if loan.notes}
										<p class="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">{loan.notes}</p>
									{/if}

									{#if loan.status === 'active'}
									<div class="mt-4 space-y-4">
										<div class="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
											<h5 class="text-sm font-semibold text-slate-900">Bayar dari Tabungan</h5>
											{#if loanPayFromSavingsForm?.success && loanPayFromSavingsForm?.values?.loanId === loan.id}
												<p class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">Pembayaran pinjaman via tabungan berhasil.</p>
											{/if}
											<form
												method="POST"
												action="?/loanPayFromSavings"
												class="space-y-3"
												use:enhance={loanPayFromSavingsEnhance}
											>
												<input type="hidden" name="loanId" value={loan.id} />
												<div class="text-xs text-slate-500">
													<p>Saldo tabungan: {formatCurrency(finance.savings.balance)}</p>
													<p>Sisa pinjaman: {formatCurrency(loan.balance)}</p>
												</div>
												<div class="flex flex-col gap-2 sm:flex-row sm:items-center">
													<Input
														name="amount"
														type="number"
														min="0"
														step="1000"
														max={Math.min(loan.balance, finance.savings.balance)}
														required
														value={
															loanPayFromSavingsForm?.values?.loanId === loan.id
																? getFormValue(loanPayFromSavingsForm, 'amount')
																: Math.min(loan.balance, finance.savings.balance) > 0
																	? String(Math.min(loan.balance, finance.savings.balance))
																	: ""
														}
														className="sm:flex-1"
														placeholder="Nominal pembayaran"
													/>
													<Button
									type="submit"
														variant="ghost"
														className="gap-2 text-emerald-700 hover:bg-emerald-50"
														disabled={
															loanPayFromSavingsSubmitting.has(loan.id) || finance.savings.balance <= 0
														}
													>
														<FileText class="h-4 w-4" />
														{#if loanPayFromSavingsSubmitting.has(loan.id)}
															Memproses...
														{:else if finance.savings.balance <= 0}
															Saldo tabungan kosong
														{:else}
															Bayar dari tabungan
														{/if}
													</Button>
												</div>
												{#if loanPayFromSavingsForm?.values?.loanId === loan.id && loanPayFromSavingsForm?.errors}
													{#if loanPayFromSavingsForm.errors.amount?.length}
														<p class="text-xs text-red-500">{loanPayFromSavingsForm.errors.amount[0]}</p>
													{/if}
													{#if loanPayFromSavingsForm.errors.balance?.length}
														<p class="text-xs text-red-500">{loanPayFromSavingsForm.errors.balance[0]}</p>
													{/if}
													{#if loanPayFromSavingsForm.errors.loanId?.length}
														<p class="text-xs text-red-500">{loanPayFromSavingsForm.errors.loanId[0]}</p>
													{/if}
												{/if}
											</form>
										</div>
										<div class="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
											<h5 class="text-sm font-semibold text-slate-900">Catat Angsuran</h5>
											{#if loanRepaymentForm?.success && loanRepaymentForm?.values?.loanId === loan.id}
												<p class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">Angsuran berhasil dicatat.</p>
											{/if}
											<form
												method="POST"
												action="?/loanRepayment"
												class="grid gap-3 sm:grid-cols-2"
												use:enhance={loanRepaymentEnhance}
											>
												<input type="hidden" name="loanId" value={loan.id} />
												<div class="space-y-2">
													<Label for={`repay-amount-${loan.id}`}>Nominal Angsuran</Label>
													<Input
														id={`repay-amount-${loan.id}`}
														name="amount"
														type="number"
														min="0"
														step="1000"
														placeholder="Rp"
														value={loanRepaymentForm?.values?.loanId === loan.id ? getFormValue(loanRepaymentForm, 'amount') : ''}
														required
													/>
													{#if loanRepaymentForm?.values?.loanId === loan.id && loanRepaymentForm?.errors?.amount?.length}
														<p class="text-xs text-red-500">{loanRepaymentForm.errors.amount[0]}</p>
													{/if}
												</div>
												<div class="space-y-2">
													<Label for={`repay-note-${loan.id}`}>Catatan</Label>
													<Textarea
														id={`repay-note-${loan.id}`}
														name="note"
														rows={2}
														placeholder="Keterangan pembayaran"
														value={loanRepaymentForm?.values?.loanId === loan.id ? getFormValue(loanRepaymentForm, 'note') : ''}
													/>
													{#if loanRepaymentForm?.values?.loanId === loan.id && loanRepaymentForm?.errors?.note?.length}
														<p class="text-xs text-red-500">{loanRepaymentForm.errors.note[0]}</p>
													{/if}
												</div>
												<div class="space-y-2 sm:col-span-2">
													<Label for={`repay-reference-${loan.id}`}>Referensi</Label>
													<Input
														id={`repay-reference-${loan.id}`}
														name="reference"
														placeholder="No. kwitansi / kas"
														value={loanRepaymentForm?.values?.loanId === loan.id ? getFormValue(loanRepaymentForm, 'reference') : ''}
													/>
													{#if loanRepaymentForm?.values?.loanId === loan.id && loanRepaymentForm?.errors?.reference?.length}
														<p class="text-xs text-red-500">{loanRepaymentForm.errors.reference[0]}</p>
													{/if}
												</div>
												<div class="flex justify-end sm:col-span-2">
													<Button
														type="submit"
														className="gap-2"
														disabled={loanRepaymentSubmitting.has(loan.id)}
													>
														<FileText class="h-4 w-4" />
														{#if loanRepaymentSubmitting.has(loan.id)}
															Memproses...
														{:else}
															Catat Angsuran
														{/if}
													</Button>
												</div>
											</form>
										</div>
								</div>
								{/if}

								</div>
							{/each}
					</div>
			{:else}
						<p class="text-sm text-slate-500">Belum ada pinjaman yang tercatat.</p>
					{/if}
				</div>

				<div class="space-y-3">
					<h4 class="text-sm font-semibold text-slate-900">Riwayat Transaksi Pinjaman</h4>
					{#if finance.loans.recentTransactions.length}
						<div class="overflow-hidden rounded-xl border border-slate-200">
							<table class="min-w-full divide-y divide-slate-200 text-sm">
								<thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
									<tr>
										<th class="px-3 py-2">Tanggal</th>
										<th class="px-3 py-2">Pinjaman</th>
										<th class="px-3 py-2">Jenis</th>
										<th class="px-3 py-2 text-right">Nominal</th>
										<th class="px-3 py-2">Catatan</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-slate-100">
									{#each finance.loans.recentTransactions as trx}
										<tr>
											<td class="px-3 py-2 text-slate-600">{formatDateTime(trx.createdAt)}</td>
											<td class="px-3 py-2 text-slate-600">#{trx.loanId.slice(0, 8).toUpperCase()}</td>
											<td class="px-3 py-2">
												<Badge variant={trx.type === 'repayment' ? 'success' : trx.type === 'disbursement' ? 'warning' : 'muted'}>
													{loanTransactionLabels[trx.type] ?? trx.type}
												</Badge>
											</td>
											<td class="px-3 py-2 text-right font-medium text-slate-900">{formatCurrency(trx.amount)}</td>
											<td class="px-3 py-2 text-slate-500">{trx.note ?? '-'}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{:else}
						<p class="text-sm text-slate-500">Belum ada transaksi pinjaman.</p>
					{/if}
				</div>
			</CardContent>
		</Card>
	</div>
</div>
