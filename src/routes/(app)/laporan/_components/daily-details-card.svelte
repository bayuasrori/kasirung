<script lang="ts">
  import Card from '$lib/components/ui/card.svelte';
  import CardHeader from '$lib/components/ui/card-header.svelte';
  import CardTitle from '$lib/components/ui/card-title.svelte';
  import CardContent from '$lib/components/ui/card-content.svelte';
  import { formatCurrency, formatDateLabel, formatNumber } from './helpers';
  import type { TrendSeriesRow } from './types';

  export let rows: TrendSeriesRow[];
</script>

<Card className="border-slate-200">
  <CardHeader>
    <CardTitle>Rincian Harian</CardTitle>
    <p class="text-sm text-slate-500">Ringkasan penjualan per hari pada periode terpilih.</p>
  </CardHeader>
  <CardContent className="overflow-x-auto">
    <table class="min-w-full divide-y divide-slate-200 text-sm">
      <thead class="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
        <tr>
          <th class="px-3 py-2">Tanggal</th>
          <th class="px-3 py-2 text-right">Transaksi</th>
          <th class="px-3 py-2 text-right">Subtotal</th>
          <th class="px-3 py-2 text-right">Diskon</th>
          <th class="px-3 py-2 text-right">Pajak</th>
          <th class="px-3 py-2 text-right">Total</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100">
        {#if rows.length === 0}
          <tr>
            <td colspan="6" class="px-3 py-6 text-center text-xs text-slate-500">Belum ada transaksi pada periode ini.</td>
          </tr>
        {:else}
          {#each rows as row (row.date)}
            <tr>
              <td class="px-3 py-2 font-medium text-slate-700">{formatDateLabel(row.date)}</td>
              <td class="px-3 py-2 text-right text-slate-500">{formatNumber(row.count)}</td>
              <td class="px-3 py-2 text-right text-slate-600">{formatCurrency(row.subtotal)}</td>
              <td class="px-3 py-2 text-right text-rose-500">{formatCurrency(row.discount)}</td>
              <td class="px-3 py-2 text-right text-blue-500">{formatCurrency(row.tax)}</td>
              <td class="px-3 py-2 text-right font-semibold text-slate-900">{formatCurrency(row.total)}</td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </CardContent>
</Card>
