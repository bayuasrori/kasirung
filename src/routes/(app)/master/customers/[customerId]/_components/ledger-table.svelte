<script lang="ts">
  import Badge from '$lib/components/ui/badge.svelte';
  import { paymentMethodLabels, statusLabels, statusVariants, formatCurrency, formatDateTime } from './helpers';
  import type { LedgerItem } from './types';

  export let items: LedgerItem[];
</script>

{#if items.length}
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
        {#each items as item (item.id)}
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
