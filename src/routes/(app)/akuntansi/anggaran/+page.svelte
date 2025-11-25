<script lang="ts">
	import { enhance } from '$app/forms';
	import { CheckCircle2, Loader2, Plus, Save, Trash2 } from 'lucide-svelte';
	import { onDestroy } from 'svelte';
	import type { SubmitFunction } from '@sveltejs/kit';

	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Select from '$lib/components/ui/select.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import CardHeader from '$lib/components/ui/card-header.svelte';
	import CardTitle from '$lib/components/ui/card-title.svelte';
	import CardContent from '$lib/components/ui/card-content.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';

	interface EditableBudgetRow {
		id?: string;
		code: string;
		name: string;
		current: number;
		planned: number;
		note?: string;
	}

	export let data: {
		filters: { year: number; scenario: string };
		availableYears: number[];
		plan: { id: string; year: number; scenario: string; notes: string; updatedAt: string } | null;
		budgets: { revenue: EditableBudgetRow[]; expense: EditableBudgetRow[] };
		notes: string;
		accounts: {
			revenue: Array<{ code: string; name: string }>;
			expense: Array<{ code: string; name: string }>;
		};
	};

	const scenarioOptions = [
		{ value: 'baseline', label: 'Baseline' },
		{ value: 'optimistic', label: 'Optimis' },
		{ value: 'conservative', label: 'Konservatif' }
	];

	const budgetFormId = 'budget-form';

	let year = data.filters.year;
	let scenario = data.filters.scenario;
	let yearInput = String(data.filters.year);
	let notes = data.notes ?? '';
	let revenueBudgets: EditableBudgetRow[] = structuredClone(data.budgets.revenue);
	let expenseBudgets: EditableBudgetRow[] = structuredClone(data.budgets.expense);
	function computePlanVersion(snapshot: typeof data) {
		return [
			snapshot.filters.year,
			snapshot.filters.scenario,
			snapshot.plan?.id ?? 'draft',
			snapshot.plan?.updatedAt ?? '',
			snapshot.budgets.revenue.length,
			snapshot.budgets.expense.length
		].join(':');
	}

	let planVersion = computePlanVersion(data);
	let saveStatus: 'idle' | 'saving' | 'success' | 'error' = 'idle';
	let saveErrors: Record<string, string[]> | null = null;
	let saveResetTimer: ReturnType<typeof setTimeout> | null = null;

	function scheduleSaveReset() {
		if (saveResetTimer) {
			clearTimeout(saveResetTimer);
		}
		saveResetTimer = setTimeout(() => {
			saveStatus = 'idle';
			saveResetTimer = null;
		}, 3000);
	}

	const formatIDR = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

	let revenueAccountOptions = data.accounts.revenue;
	let expenseAccountOptions = data.accounts.expense;

	$: revenueAccountOptions = data.accounts.revenue;
	$: expenseAccountOptions = data.accounts.expense;

	$: revenueAccountMap = new Map(revenueAccountOptions.map((item) => [item.code, item.name]));
	$: expenseAccountMap = new Map(expenseAccountOptions.map((item) => [item.code, item.name]));

	function submitParentForm(event: Event) {
		const target = event.currentTarget as (HTMLInputElement | HTMLSelectElement) | null;
		target?.form?.requestSubmit();
	}

	function sumPlanned(rows: EditableBudgetRow[]) {
		return rows.reduce((sum, row) => sum + Number(row.planned || 0), 0);
	}

	function syncRevenueRow(index: number) {
		const row = revenueBudgets[index];
		if (!row) return;
		const mappedName = revenueAccountMap.get(row.code);
		const next = [...revenueBudgets];
		next[index] = {
			...row,
			name: row.code && mappedName ? mappedName : row.code ? row.name : ''
		};
		revenueBudgets = next;
	}

	function syncExpenseRow(index: number) {
		const row = expenseBudgets[index];
		if (!row) return;
		const mappedName = expenseAccountMap.get(row.code);
		const next = [...expenseBudgets];
		next[index] = {
			...row,
			name: row.code && mappedName ? mappedName : row.code ? row.name : ''
		};
		expenseBudgets = next;
	}

	function addRevenueRow() {
		revenueBudgets = [...revenueBudgets, { code: '', name: '', current: 0, planned: 0 }];
	}

	function addExpenseRow() {
		expenseBudgets = [...expenseBudgets, { code: '', name: '', current: 0, planned: 0 }];
	}

	function removeRevenueRow(index: number) {
		revenueBudgets = revenueBudgets.filter((_, i) => i !== index);
	}

	function removeExpenseRow(index: number) {
		expenseBudgets = expenseBudgets.filter((_, i) => i !== index);
	}

	function normalizeAmount(value: number | string) {
		const parsed = Number(value);
		return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
	}

	function prepareRows(rows: EditableBudgetRow[]) {
		return rows
			.map((row) => ({
				code: row.code.trim(),
				name: row.name.trim(),
				current: normalizeAmount(row.current),
				planned: normalizeAmount(row.planned),
				note: row.note?.trim() ?? ''
			}))
			.filter((row) => row.code.length && row.name.length);
	}

	const saveEnhance: SubmitFunction = ({ formData }) => {
		saveStatus = 'saving';
		saveErrors = null;

		const parsedYear = Number(yearInput);
		year = Number.isFinite(parsedYear) ? parsedYear : data.filters.year;

		formData.set('year', String(year));
		formData.set('scenario', scenario);
		formData.set('notes', notes ?? '');
		formData.set('revenue', JSON.stringify(prepareRows(revenueBudgets)));
		formData.set('expense', JSON.stringify(prepareRows(expenseBudgets)));

		return async ({ result, update }) => {
			if (result.type === 'failure') {
				saveStatus = 'error';
				saveErrors = (result.data as { errors?: Record<string, string[]> })?.errors ?? null;
				return;
			}
			if (result.type === 'error') {
				saveStatus = 'error';
				return;
			}
			await update();
			saveStatus = 'success';
			saveErrors = null;
			scheduleSaveReset();
		};
	};

	$: {
		const parsed = Number(yearInput);
		if (Number.isFinite(parsed) && parsed > 0) {
			year = parsed;
		}
	}

	$: {
		const nextVersion = computePlanVersion(data);
		if (nextVersion !== planVersion) {
			planVersion = nextVersion;
			revenueBudgets = structuredClone(data.budgets.revenue);
			expenseBudgets = structuredClone(data.budgets.expense);
			year = data.filters.year;
			yearInput = String(data.filters.year);
			scenario = data.filters.scenario;
			notes = data.notes ?? '';
			saveStatus = saveStatus === 'saving' ? 'idle' : saveStatus;
			saveErrors = null;
		}
	}

	const lastUpdatedLabel = data.plan?.updatedAt
		? new Date(data.plan.updatedAt).toLocaleString('id-ID', {
			year: 'numeric',
			month: 'short',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		})
		: null;

	onDestroy(() => {
		if (saveResetTimer) {
			clearTimeout(saveResetTimer);
		}
	});
</script>

<div class="space-y-6">
	<div class="flex flex-wrap items-start justify-between gap-4">
		<div class="space-y-1">
			<h1 class="text-xl font-semibold text-slate-900">Desain Anggaran</h1>
			<p class="text-sm text-slate-500">
				Tetapkan target pendapatan dan pengeluaran per akun untuk memantau performa bisnis sepanjang tahun.
			</p>
			{#if lastUpdatedLabel}
				<p class="text-xs text-slate-400">Terakhir diperbarui {lastUpdatedLabel}</p>
			{/if}
		</div>
		<Button
			type="submit"
			form={budgetFormId}
			className="gap-2"
			disabled={saveStatus === 'saving'}
		>
			{#if saveStatus === 'saving'}
				<Loader2 class="h-4 w-4 animate-spin" />
			{:else}
				<Save class="h-4 w-4" />
			{/if}
			{saveStatus === 'saving' ? 'Menyimpan...' : 'Simpan Anggaran'}
		</Button>
	</div>

	{#if saveStatus === 'success'}
		<div class="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
			<CheckCircle2 class="h-4 w-4" />
			<p>Anggaran tersimpan. Data telah diperbarui.</p>
		</div>
	{:else if saveStatus === 'error' && !saveErrors}
		<div class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
			Terjadi kesalahan saat menyimpan anggaran. Coba lagi dalam beberapa saat.
		</div>
	{/if}

	{#if saveErrors}
		<div class="space-y-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
			<p class="font-medium">Validasi anggaran belum lengkap:</p>
			<ul class="list-disc space-y-1 pl-4">
				{#each Object.entries(saveErrors) as [field, messages] (field)}
					<li><span class="font-semibold capitalize">{field}</span>: {messages.join(', ')}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<form
		method="GET"
		class="grid gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur md:grid-cols-[160px_200px_auto]"
	>
		<div class="space-y-2">
			<Label for="budget-year">Tahun Anggaran</Label>
			<Input
				id="budget-year"
				name="year"
				type="number"
				min="2000"
				max="2100"
				bind:value={yearInput}
				on:change={submitParentForm}
			/>
		</div>
		<div class="space-y-2">
			<Label for="scenario">Skenario</Label>
			<Select
				id="scenario"
				name="scenario"
				bind:value={scenario}
				on:change={submitParentForm}
			>
				{#each scenarioOptions as option (option.value)}
					<option value={option.value}>{option.label}</option>
				{/each}
			</Select>
		</div>
		<div class="space-y-1 text-xs text-slate-500">
			<p>Pilih tahun &amp; skenario untuk melihat atau menyusun anggaran.</p>
			{#if data.availableYears.length > 1}
				<p>Tersedia data tahun: {data.availableYears.map(String).join(', ')}.</p>
			{/if}
		</div>
	</form>

	<form
		id={budgetFormId}
		method="POST"
		action="?/save"
		class="space-y-6"
		use:enhance={saveEnhance}
	>
		<div class="space-y-2 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
			<Label for="notes">Catatan Strategi</Label>
			<Textarea
				id="notes"
				rows={3}
				bind:value={notes}
				placeholder="Ringkas asumsi utama, sasaran pertumbuhan, atau prioritas belanja"
			/>
		</div>

		<div class="grid gap-4 xl:grid-cols-2">
		<Card class="bg-white/90 shadow-sm backdrop-blur">
			<CardHeader>
				<CardTitle>Target Pendapatan</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
		<div class="space-y-3">
			{#each revenueBudgets as row, index (row.id ?? index)}
				<div class="grid gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-[180px_auto_110px_110px_32px]">
					<Select bind:value={row.code} on:change={() => syncRevenueRow(index)}>
						<option value="">Pilih akun…</option>
						{#each revenueAccountOptions as option (option.code)}
							<option value={option.code}>{option.code} — {option.name}</option>
						{/each}
					</Select>
					<Input bind:value={row.name} placeholder="Nama akun" />
					<Input
						type="number"
								min="0"
								step="1000"
								bind:value={row.current}
								placeholder="Realisasi"
							/>
							<Input
								type="number"
								min="0"
								step="1000"
								bind:value={row.planned}
								placeholder="Target"
							/>
							<div class="flex items-start justify-end">
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="text-slate-500 hover:text-red-600"
									on:click={() => removeRevenueRow(index)}
									aria-label="Hapus baris pendapatan"
								>
									<Trash2 class="h-4 w-4" />
								</Button>
							</div>
						</div>
					{/each}
					{#if revenueBudgets.length === 0}
						<p class="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
							Belum ada target pendapatan. Tambahkan baris pertama untuk mulai menyusun anggaran.
						</p>
					{/if}
				</div>
				<div class="flex items-center justify-between border-t border-slate-200 pt-3 text-sm text-slate-600">
					<Button type="button" variant="ghost" className="gap-2" on:click={addRevenueRow}>
						<Plus class="h-4 w-4" />
						Tambah Target Pendapatan
					</Button>
					<div class="text-right">
						<p class="text-xs uppercase tracking-wide text-slate-400">Total Target</p>
						<p class="text-base font-semibold text-slate-900">{formatIDR(sumPlanned(revenueBudgets))}</p>
					</div>
				</div>
			</CardContent>
		</Card>

		<Card class="bg-white/90 shadow-sm backdrop-blur">
			<CardHeader>
				<CardTitle>Target Beban</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
		<div class="space-y-3">
			{#each expenseBudgets as row, index (row.id ?? index)}
				<div class="grid gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-[180px_auto_110px_110px_32px]">
					<Select bind:value={row.code} on:change={() => syncExpenseRow(index)}>
						<option value="">Pilih akun…</option>
						{#each expenseAccountOptions as option (option.code)}
							<option value={option.code}>{option.code} — {option.name}</option>
						{/each}
					</Select>
					<Input bind:value={row.name} placeholder="Nama akun" />
					<Input type="number" min="0" step="1000" bind:value={row.current} placeholder="Realisasi" />
					<Input type="number" min="0" step="1000" bind:value={row.planned} placeholder="Target" />
							<div class="flex items-start justify-end">
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="text-slate-500 hover:text-red-600"
									on:click={() => removeExpenseRow(index)}
									aria-label="Hapus baris beban"
								>
									<Trash2 class="h-4 w-4" />
								</Button>
							</div>
						</div>
					{/each}
					{#if expenseBudgets.length === 0}
						<p class="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
							Belum ada target beban. Tambahkan baris untuk menetapkan anggaran biaya.
						</p>
					{/if}
				</div>
				<div class="flex items-center justify-between border-t border-slate-200 pt-3 text-sm text-slate-600">
					<Button type="button" variant="ghost" className="gap-2" on:click={addExpenseRow}>
						<Plus class="h-4 w-4" />
						Tambah Target Beban
					</Button>
					<div class="text-right">
						<p class="text-xs uppercase tracking-wide text-slate-400">Total Target</p>
						<p class="text-base font-semibold text-slate-900">{formatIDR(sumPlanned(expenseBudgets))}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	</div>

	<Card class="bg-white/90 shadow-sm backdrop-blur">
		<CardHeader>
			<CardTitle>Ringkasan Anggaran</CardTitle>
		</CardHeader>
		<CardContent class="grid gap-4 text-sm text-slate-600 md:grid-cols-3">
			<div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
				<p class="text-xs uppercase tracking-wide text-emerald-600">Total Pendapatan Direncanakan</p>
				<p class="mt-1 text-lg font-semibold text-emerald-700">{formatIDR(sumPlanned(revenueBudgets))}</p>
			</div>
			<div class="rounded-xl border border-amber-200 bg-amber-50 p-4">
				<p class="text-xs uppercase tracking-wide text-amber-600">Total Beban Direncanakan</p>
				<p class="mt-1 text-lg font-semibold text-amber-700">{formatIDR(sumPlanned(expenseBudgets))}</p>
			</div>
			<div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
				<p class="text-xs uppercase tracking-wide text-blue-600">Laba/Rugi Anggaran</p>
				<p class="mt-1 text-lg font-semibold text-blue-700">{formatIDR(sumPlanned(revenueBudgets) - sumPlanned(expenseBudgets))}</p>
			</div>
		</CardContent>
	</Card>

	<Card class="bg-white/90 shadow-sm backdrop-blur">
		<CardHeader>
			<CardTitle>Langkah Selanjutnya</CardTitle>
		</CardHeader>
		<CardContent class="space-y-2 text-sm text-slate-600">
			<ul class="list-disc space-y-1 pl-5">
				<li>Integrasikan data akun aktual dan histori realisasi dari buku besar.</li>
				<li>Tambahkan penyimpanan anggaran per skenario dan periode (bulanan/kuartal).</li>
				<li>Sediakan ekspor file dan workflow approval untuk manajer keuangan.</li>
			</ul>
		</CardContent>
	</Card>
</form>
</div>
