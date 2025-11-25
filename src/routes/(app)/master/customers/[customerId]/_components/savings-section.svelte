<script lang="ts">
  import { enhance } from '$app/forms';
  import type { SubmitFunction } from '@sveltejs/kit';
  import Card from '$lib/components/ui/card.svelte';
  import CardHeader from '$lib/components/ui/card-header.svelte';
  import CardTitle from '$lib/components/ui/card-title.svelte';
  import CardDescription from '$lib/components/ui/card-description.svelte';
  import CardContent from '$lib/components/ui/card-content.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import Label from '$lib/components/ui/label.svelte';
  import Textarea from '$lib/components/ui/textarea.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import { FileText } from 'lucide-svelte';
  import Select from '$lib/components/ui/select.svelte';
  import Badge from '$lib/components/ui/badge.svelte';
  import { formatCurrency, formatDateTime, savingTypeLabels } from './helpers';
  import type { FinanceData, FormState } from './types';

  export let finance: FinanceData;
  export let savingsForm: FormState | null;
  export let savingsEnhance: SubmitFunction<Record<string, unknown>, Record<string, unknown>>;
  export let savingsSubmitting: boolean;
  export let getFormValue: (form: { values?: Record<string, FormDataEntryValue> } | null, field: string) => string;
</script>

<Card id="savings" className="border-slate-200">
  <CardHeader>
    <CardTitle>Simpanan Anggota</CardTitle>
    <CardDescription>Catat setoran maupun penarikan tabungan pelanggan.</CardDescription>
  </CardHeader>
  <CardContent className="space-y-6">
    <div class="grid gap-3 sm:grid-cols-3">
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p class="text-xs text-slate-500">Saldo Tabungan</p>
        <p class="text-lg font-semibold text-slate-900">{formatCurrency(finance.savings.balance)}</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p class="text-xs text-slate-500">Total Simpanan</p>
        <p class="text-lg font-semibold text-slate-900">{formatCurrency(finance.savings.totalDeposits)}</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p class="text-xs text-slate-500">Total Penarikan</p>
        <p class="text-lg font-semibold text-slate-900">{formatCurrency(finance.savings.totalWithdrawals)}</p>
      </div>
    </div>

    {#if savingsForm?.success}
      <p class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
        Transaksi tabungan berhasil dicatat.
      </p>
    {/if}

    <form method="POST" action="?/savings" class="space-y-4" use:enhance={savingsEnhance}>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <Label for="savingType">Jenis Transaksi</Label>
          <Select id="savingType" name="type" value={getFormValue(savingsForm, 'type') || 'deposit'}>
            <option value="deposit">Simpanan</option>
            <option value="withdraw">Penarikan</option>
          </Select>
        </div>
        <div class="space-y-2">
          <Label for="savingAmount">Nominal</Label>
          <Input
            id="savingAmount"
            name="amount"
            type="number"
            min="0"
            step="1000"
            placeholder="Rp"
            value={getFormValue(savingsForm, 'amount')}
            required
          />
          {#if savingsForm?.errors?.amount?.length}
            <p class="text-xs text-red-500">{savingsForm.errors.amount[0]}</p>
          {/if}
        </div>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <Label for="savingReference">Referensi</Label>
          <Input id="savingReference" name="reference" placeholder="No. bukti / kas" value={getFormValue(savingsForm, 'reference')} />
          {#if savingsForm?.errors?.reference?.length}
            <p class="text-xs text-red-500">{savingsForm.errors.reference[0]}</p>
          {/if}
        </div>
        <div class="space-y-2">
          <Label for="savingNote">Catatan</Label>
          <Textarea id="savingNote" name="note" rows={2} placeholder="Keperluan transaksi" value={getFormValue(savingsForm, 'note')} />
          {#if savingsForm?.errors?.note?.length}
            <p class="text-xs text-red-500">{savingsForm.errors.note[0]}</p>
          {/if}
        </div>
      </div>
      <div class="flex justify-end">
        <Button type="submit" className="gap-2" disabled={savingsSubmitting}>
        <FileText class="h-4 w-4" />
        {#if savingsSubmitting}
          Memproses...
        {:else}
          Simpan Transaksi
        {/if}
        </Button>
      </div>
    </form>

    <div class="space-y-3">
      <h4 class="text-sm font-semibold text-slate-900">Riwayat Tabungan</h4>
      {#if finance.savings.transactions.length}
        <div class="overflow-hidden rounded-xl border border-slate-200">
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th class="px-3 py-2">Tanggal</th>
                <th class="px-3 py-2">Jenis</th>
                <th class="px-3 py-2 text-right">Nominal</th>
                <th class="px-3 py-2">Catatan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              {#each finance.savings.transactions as item (item.id ?? item.createdAt)}
                <tr>
                  <td class="px-3 py-2 text-slate-600">{formatDateTime(item.createdAt)}</td>
                  <td class="px-3 py-2">
                    <Badge variant={item.type === 'deposit' ? 'success' : 'warning'}>{savingTypeLabels[item.type]}</Badge>
                  </td>
                  <td class="px-3 py-2 text-right font-medium text-slate-900">{formatCurrency(item.amount)}</td>
                  <td class="px-3 py-2 text-slate-500">{item.note ?? '-'}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else}
        <p class="text-sm text-slate-500">Belum ada aktivitas tabungan.</p>
      {/if}
    </div>
  </CardContent>
</Card>
