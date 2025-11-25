<script lang="ts">
	import OverviewStats from './_component/OverviewStats.svelte';
	import KosanInsightCard from './_component/KosanInsightCard.svelte';
	import SalesTrendCard from './_component/SalesTrendCard.svelte';
	import TopProductsCard from './_component/TopProductsCard.svelte';
	import RecentTransactionsCard from './_component/RecentTransactionsCard.svelte';
	import type { DashboardSnapshot } from './_component/types';

	export let data: {
		snapshot: DashboardSnapshot | null;
	};

	const snapshot = data.snapshot;
	const chartLabels = snapshot?.sales.map((item) => item.date.slice(5)) ?? [];
	const chartTotals = snapshot?.sales.map((item) => item.total ?? 0) ?? [];
</script>

<div class="space-y-8">
	<OverviewStats {snapshot} />

	{#if snapshot?.kosan}
		<KosanInsightCard summary={snapshot.kosan} />
	{/if}

	<section class="grid gap-6 lg:grid-cols-3">
		<SalesTrendCard labels={chartLabels} totals={chartTotals} />
		<TopProductsCard products={snapshot?.topProducts} />
	</section>

	<RecentTransactionsCard transactions={snapshot?.recent} />
</div>
