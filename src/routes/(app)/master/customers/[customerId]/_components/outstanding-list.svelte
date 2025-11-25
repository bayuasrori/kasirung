<script lang="ts">
  import { enhance } from '$app/forms';
  import type { SubmitFunction } from '@sveltejs/kit';
  import Card from '$lib/components/ui/card.svelte';
  import CardHeader from '$lib/components/ui/card-header.svelte';
  import CardTitle from '$lib/components/ui/card-title.svelte';
  import CardDescription from '$lib/components/ui/card-description.svelte';
  import CardContent from '$lib/components/ui/card-content.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import { FileText } from 'lucide-svelte';
  import { formatCurrency, formatDate } from './helpers';
  import type { OutstandingItem, FinanceData, FormState } from './types';

  export let outstanding: OutstandingItem[];
  export let finance: FinanceData;
  export let payFromSavingsForm: FormState | null;
  export let payFromSavingsEnhance: SubmitFunction<Record<string, unknown>, Record<string, unknown>>;
  export let payFromSavingsSubmitting: Set<string>;
  export let getFormValue: (form: { values?: Record<string, FormDataEntryValue> } | null, field: string) => string;
</script>

<Card className="border-slate-200">
  <CardHeader>
    <CardTitle>Daftar Piutang</CardTitle>
    <CardDescription>Transaksi kredit yang belum ditagih.</CardDescription>
  </CardHeader>
  <CardContent>
    {#if outstanding.length}
      <ul class="space-y-3 text-sm text-slate-600">
        {#each outstanding as item (item.id)}
          <li class="rounded-lg border border-amber-200 bg-amber-50/60 p-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-slate-900">{item.number}</p>
                <p class="text-xs text-slate-500">{formatDate(item.createdAt)}</p>
              </div>
              <span class="text-sm font-semibold text-amber-700">{formatCurrency(item.paymentAmount)}</span>
            </div>
            <div class="mt-3 space-y-2">
              {#if payFromSavingsForm?.success && payFromSavingsForm?.values?.transactionId === item.id}
                <p class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                  Piutang dibayarkan dari tabungan.
                </p>
              {/if}
              <form
                method="POST"
                action="?/payFromSavings"
                class="space-y-2"
                use:enhance={payFromSavingsEnhance}
              >
                <input type="hidden" name="transactionId" value={item.id} />
                <div class="text-xs text-slate-500">
                  <p>Saldo tabungan: {formatCurrency(finance.savings.balance)}</p>
                  <p>Sisa piutang: {formatCurrency(item.paymentAmount)}</p>
                </div>
                <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Input
                    name="amount"
                    type="number"
                    min="0"
                    step="100"
                    max={item.paymentAmount}
                    required
                    value={
                      payFromSavingsForm?.values?.transactionId === item.id
                        ? getFormValue(payFromSavingsForm, 'amount')
                        : String(item.paymentAmount)
                    }
                    className="sm:flex-1"
                    placeholder="Nominal pembayaran"
                  />
                  <Button
                    type="submit"
                    variant="ghost"
                    className="gap-2 text-emerald-700 hover:bg-emerald-50"
                    disabled={payFromSavingsSubmitting.has(item.id) || finance.savings.balance <= 0}
                  >
                    <FileText class="h-4 w-4" />
                    {#if payFromSavingsSubmitting.has(item.id)}
                      Memproses...
                    {:else if finance.savings.balance <= 0}
                      Saldo kosong
                    {:else}
                      Bayar dari tabungan
                    {/if}
                  </Button>
                </div>
                {#if payFromSavingsForm?.values?.transactionId === item.id && payFromSavingsForm?.errors}
                  {#if payFromSavingsForm.errors.amount?.length}
                    <p class="text-xs text-red-500">{payFromSavingsForm.errors.amount[0]}</p>
                  {/if}
                  {#if payFromSavingsForm.errors.balance?.length}
                    <p class="text-xs text-red-500">{payFromSavingsForm.errors.balance[0]}</p>
                  {/if}
                  {#if payFromSavingsForm.errors.transactionId?.length}
                    <p class="text-xs text-red-500">{payFromSavingsForm.errors.transactionId[0]}</p>
                  {/if}
                {/if}
              </form>
            </div>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="text-sm text-slate-500">Tidak ada piutang aktif.</p>
    {/if}
  </CardContent>
</Card>
