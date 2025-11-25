<script lang="ts">
  import Card from '$lib/components/ui/card.svelte';
  import CardHeader from '$lib/components/ui/card-header.svelte';
  import CardTitle from '$lib/components/ui/card-title.svelte';
  import CardContent from '$lib/components/ui/card-content.svelte';
  import { formatCurrency, formatNumber, formatPercentage, methodLabels } from './helpers';
  import type { PaymentSummary } from './types';

  export let payments: PaymentSummary[];
</script>

<Card className="border-slate-200">
  <CardHeader>
    <CardTitle>Metode Pembayaran</CardTitle>
    <p class="text-sm text-slate-500">Distribusi volume transaksi per metode.</p>
  </CardHeader>
  <CardContent className="space-y-4">
    {#if payments.length === 0}
      <p class="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
        Belum ada data pembayaran.
      </p>
    {:else}
      <ul class="space-y-4">
        {#each payments as payment (payment.method)}
          <li class="space-y-1">
            <div class="flex items-center justify-between text-sm font-medium text-slate-700">
              <span>{methodLabels[payment.method] ?? payment.method}</span>
              <span>{formatCurrency(payment.amount)}</span>
            </div>
            <div class="h-2 w-full rounded-full bg-slate-200">
              <div
                class="h-2 rounded-full bg-blue-500"
                style={`width: ${Math.max(4, Math.min(100, Math.round(payment.percentage)))}%`}
              ></div>
            </div>
            <p class="text-xs text-slate-500">{formatPercentage(payment.percentage)} &bull; {formatNumber(payment.count)} transaksi</p>
          </li>
        {/each}
      </ul>
    {/if}
  </CardContent>
</Card>
