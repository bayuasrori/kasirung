<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '$lib/components/ui/button.svelte';
  import Badge from '$lib/components/ui/badge.svelte';
  import { Mail, Phone, MapPin, BookOpen, Pencil, Trash2 } from 'lucide-svelte';
  import { formatCurrency } from './helpers';
  import type { Customer } from './types';

  export let customers: Customer[];

  const dispatch = createEventDispatcher<{ edit: Customer; delete: Customer }>();

  const handleEdit = (customer: Customer) => dispatch('edit', customer);
  const handleDelete = (customer: Customer) => dispatch('delete', customer);
</script>

<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
  <table class="min-w-full divide-y divide-slate-200 text-sm">
    <thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      <tr>
        <th class="px-4 py-3">Pelanggan</th>
        <th class="px-4 py-3">Kontak</th>
        <th class="px-4 py-3 text-center">Transaksi</th>
        <th class="px-4 py-3 text-right">Total Belanja (Bulan Ini)</th>
        <th class="px-4 py-3 text-right">Total Hutang (Bulan Ini)</th>
        <th class="px-4 py-3 text-right">Aksi</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-slate-100">
      {#if customers.length}
        {#each customers as customer (customer.id)}
          <tr class="hover:bg-blue-50/40">
            <td class="px-4 py-3">
              <p class="font-medium text-slate-900">{customer.name}</p>
              {#if customer.notes}
                <p class="text-xs text-slate-500">{customer.notes}</p>
              {/if}
            </td>
            <td class="space-y-1 px-4 py-3 text-sm text-slate-600">
              {#if customer.email}
                <p class="flex items-center gap-2"><Mail class="h-3.5 w-3.5 text-slate-400" /> {customer.email}</p>
              {/if}
              {#if customer.phone}
                <p class="flex items-center gap-2"><Phone class="h-3.5 w-3.5 text-slate-400" /> {customer.phone}</p>
              {/if}
              {#if customer.address}
                <p class="flex items-center gap-2"><MapPin class="h-3.5 w-3.5 text-slate-400" /> {customer.address}</p>
              {/if}
              {#if !customer.email && !customer.phone && !customer.address}
                <p class="text-xs text-slate-400">Belum ada kontak.</p>
              {/if}
            </td>
            <td class="px-4 py-3 text-center">
              <Badge variant="muted">{customer.transactionCount} trx</Badge>
            </td>
            <td class="px-4 py-3 text-right font-medium text-slate-900">
              {formatCurrency(customer.totalSpentThisMonth)}
            </td>
            <td
              class="px-4 py-3 text-right font-medium"
              class:text-amber-600={customer.outstandingThisMonth > 0}
              class:text-slate-500={customer.outstandingThisMonth === 0}
            >
              {formatCurrency(customer.outstandingThisMonth)}
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex justify-end gap-2">
                <Button variant="ghost" size="sm" className="text-slate-600" href={`/master/customers/${customer.id}`}>
                  <BookOpen class="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-blue-600" on:click={() => handleEdit(customer)}>
                  <Pencil class="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-500" on:click={() => handleDelete(customer)}>
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            </td>
          </tr>
        {/each}
      {:else}
        <tr>
          <td colspan="6" class="px-4 py-8 text-center text-sm text-slate-500">Belum ada pelanggan yang terdaftar.</td>
        </tr>
      {/if}
    </tbody>
  </table>
</div>
