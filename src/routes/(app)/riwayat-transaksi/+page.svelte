<script lang="ts">
	import HistorySummaryCard from './_components/history-summary-card.svelte';
	import HistoryFilters from './_components/history-filters.svelte';
	import HistoryTable from './_components/history-table.svelte';
	import HistoryPagination from './_components/history-pagination.svelte';
	import type { TransactionHistory } from './_components/types';

	export let data: {
		history: TransactionHistory;
		form?: { error?: string };
	};

	const history = data.history;
	const filters = history.filters;
	const hasActiveFilter = Boolean(filters.search || filters.startDate || filters.endDate);
	const actionError = data.form?.error ?? '';

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

	const resetHref = buildQuery({ search: undefined, startDate: undefined, endDate: undefined, page: undefined });
</script>

<div class="space-y-6">
	<HistorySummaryCard {history} />
	<HistoryFilters {filters} {hasActiveFilter} {resetHref} />
	{#if actionError}
		<div class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
			{actionError}
		</div>
	{/if}
	<HistoryTable items={history.items} />
	<HistoryPagination page={history.page} pageCount={history.pageCount} {buildQuery} />
</div>
