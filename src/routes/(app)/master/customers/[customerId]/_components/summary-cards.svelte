<script lang="ts">
  import Card from '$lib/components/ui/card.svelte';
  import CardHeader from '$lib/components/ui/card-header.svelte';
  import CardTitle from '$lib/components/ui/card-title.svelte';
  import CardDescription from '$lib/components/ui/card-description.svelte';
  import CardContent from '$lib/components/ui/card-content.svelte';
  import { formatCurrency, formatDateTime } from './helpers';
  import type { Summary } from './types';

  export let summary: Summary;
  export let outstandingAmount: number;
</script>

<div class="grid gap-4 md:grid-cols-3">
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
      <p class="text-2xl font-semibold" class:text-amber-700={outstandingAmount > 0} class:text-emerald-700={outstandingAmount <= 0}>
        {formatCurrency(outstandingAmount)}
      </p>
      <p class="text-xs text-slate-500">{summary.pendingCount} transaksi kredit</p>
    </CardContent>
  </Card>
</div>
