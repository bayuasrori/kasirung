<script lang="ts">
  import Card from '$lib/components/ui/card.svelte';
  import CardHeader from '$lib/components/ui/card-header.svelte';
  import CardTitle from '$lib/components/ui/card-title.svelte';
  import CardContent from '$lib/components/ui/card-content.svelte';
  import { formatCurrency, formatNumber } from './helpers';
  import type { CustomerSummary } from './types';

  export let customers: CustomerSummary[];
</script>

<Card className="border-slate-200">
  <CardHeader>
    <CardTitle>Pelanggan Terbaik</CardTitle>
    <p class="text-sm text-slate-500">Pelanggan dengan nilai transaksi tertinggi.</p>
  </CardHeader>
  <CardContent className="overflow-x-auto">
    <table class="min-w-full text-sm">
      <thead class="text-left text-xs font-semibold uppercase text-slate-400">
        <tr>
          <th class="px-3 py-2">Pelanggan</th>
          <th class="px-3 py-2 text-right">Transaksi</th>
          <th class="px-3 py-2 text-right">Nilai</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-200">
        {#if customers.length === 0}
          <tr>
            <td colspan="3" class="px-3 py-6 text-center text-xs text-slate-500">Belum ada data pelanggan pada periode ini.</td>
          </tr>
        {:else}
          {#each customers as customer (customer.customerId)}
            <tr>
              <td class="px-3 py-2 font-medium text-slate-700">{customer.name}</td>
              <td class="px-3 py-2 text-right">{formatNumber(customer.count)}</td>
              <td class="px-3 py-2 text-right">{formatCurrency(customer.total)}</td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </CardContent>
</Card>
