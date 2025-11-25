<script lang="ts">
  import FiltersCard from './_components/filters-card.svelte';
  import SummaryCards from './_components/summary-cards.svelte';
  import SecondaryCards from './_components/secondary-cards.svelte';
  import TrendCard from './_components/trend-card.svelte';
  import PaymentsCard from './_components/payments-card.svelte';
  import TopProductsCard from './_components/top-products-card.svelte';
  import TopCustomersCard from './_components/top-customers-card.svelte';
  import DailyDetailsCard from './_components/daily-details-card.svelte';
  import ReportEmptyState from './_components/report-empty-state.svelte';
  import type { ReportFilters, ReportPayload } from './_components/types';

  export let data: {
    report: ReportPayload | null;
    filters: ReportFilters;
  };

  const requiresCustomRange = data.filters.range === 'custom';
  const badgeLabel = data.report ? data.report.range.label : data.filters.rangeLabel;
</script>

<div class="space-y-6">
  <FiltersCard filters={data.filters} requiresCustomRange={requiresCustomRange} badgeLabel={badgeLabel} />

  {#if !data.report}
    <ReportEmptyState />
  {:else}
    <section class="space-y-6">
      <SummaryCards report={data.report} />
      <SecondaryCards report={data.report} />

      <div class="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <TrendCard report={data.report} />
        <PaymentsCard payments={data.report.payments} />
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <TopProductsCard products={data.report.topProducts} />
        <TopCustomersCard customers={data.report.topCustomers} />
      </div>

      <DailyDetailsCard rows={data.report.trend.series} />
    </section>
  {/if}
</div>
