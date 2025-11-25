<script lang="ts">
  import Card from '$lib/components/ui/card.svelte';
  import CardHeader from '$lib/components/ui/card-header.svelte';
  import CardTitle from '$lib/components/ui/card-title.svelte';
  import CardContent from '$lib/components/ui/card-content.svelte';
  import Badge from '$lib/components/ui/badge.svelte';
  import SalesLineChart from '$lib/components/charts/sales-line-chart.svelte';
  import type { ReportPayload } from './types';

  export let report: ReportPayload;

  const hasTrendData = report.trend.totals.some((value) => value > 0);
</script>

<Card className="border-slate-200">
  <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
    <div>
      <CardTitle>Tren Penjualan</CardTitle>
      <p class="text-sm text-slate-500">Total penjualan harian selama {report.range.days} hari.</p>
    </div>
    <Badge variant="muted">{report.range.label}</Badge>
  </CardHeader>
  <CardContent className="pt-4">
    {#if hasTrendData}
      <SalesLineChart labels={report.trend.labels} totals={report.trend.totals} />
    {:else}
      <p class="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
        Belum ada transaksi pada periode ini.
      </p>
    {/if}
  </CardContent>
</Card>
