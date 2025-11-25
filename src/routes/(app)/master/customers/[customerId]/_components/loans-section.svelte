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
  import Badge from '$lib/components/ui/badge.svelte';
  import { formatCurrency, formatDate, formatDateTime, formatPercent, loanStatusLabels, loanTransactionLabels } from './helpers';
  import type { FinanceData, FormState } from './types';

  export let finance: FinanceData;
  export let loanCreateForm: FormState | null;
  export let loanCreateEnhance: SubmitFunction<Record<string, unknown>, Record<string, unknown>>;
  export let loanCreateSubmitting: boolean;
  export let loanPayFromSavingsForm: FormState | null;
  export let loanPayFromSavingsEnhance: SubmitFunction<Record<string, unknown>, Record<string, unknown>>;
  export let loanPayFromSavingsSubmitting: Set<string>;
  export let loanRepaymentForm: FormState | null;
  export let loanRepaymentEnhance: SubmitFunction<Record<string, unknown>, Record<string, unknown>>;
  export let loanRepaymentSubmitting: Set<string>;
  export let getFormValue: (form: { values?: Record<string, FormDataEntryValue> } | null, field: string) => string;
</script>

<Card id="loans" className="border-slate-200">
  <CardHeader>
    <CardTitle>Pinjaman Anggota</CardTitle>
    <CardDescription>Kelola pencairan dan angsuran pinjaman pelanggan.</CardDescription>
  </CardHeader>
  <CardContent className="space-y-6">
    <div class="grid gap-3 sm:grid-cols-3">
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p class="text-xs text-slate-500">Total Outstanding</p>
        <p class="text-lg font-semibold text-slate-900">{formatCurrency(finance.loans.totalOutstanding)}</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p class="text-xs text-slate-500">Pinjaman Aktif</p>
        <p class="text-lg font-semibold text-slate-900">{finance.loans.activeCount}</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p class="text-xs text-slate-500">Riwayat Transaksi</p>
        <p class="text-lg font-semibold text-slate-900">{finance.loans.recentTransactions.length}</p>
      </div>
    </div>

    {#if loanCreateForm?.success}
      <p class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
        Pinjaman baru berhasil dibuat.
      </p>
    {/if}

    <form
      method="POST"
      action="?/loanCreate"
      class="space-y-4 rounded-xl border border-slate-200 bg-white/70 p-4"
      use:enhance={loanCreateEnhance}
    >
      <h4 class="text-sm font-semibold text-slate-900">Pencairan Pinjaman Baru</h4>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <Label for="loanPrincipal">Nominal Pokok</Label>
          <Input
            id="loanPrincipal"
            name="principal"
            type="number"
            min="0"
            step="1000"
            placeholder="Rp"
            value={getFormValue(loanCreateForm, 'principal')}
            required
          />
          {#if loanCreateForm?.errors?.principal?.length}
            <p class="text-xs text-red-500">{loanCreateForm.errors.principal[0]}</p>
          {/if}
        </div>
        <div class="space-y-2">
          <Label for="loanInterest">Bunga (% per tahun)</Label>
          <Input
            id="loanInterest"
            name="interestRate"
            type="number"
            min="0"
            step="0.1"
            placeholder="5"
            value={getFormValue(loanCreateForm, 'interestRate')}
            required
          />
          {#if loanCreateForm?.errors?.interestRate?.length}
            <p class="text-xs text-red-500">{loanCreateForm.errors.interestRate[0]}</p>
          {/if}
        </div>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <Label for="loanTerm">Tenor (bulan)</Label>
          <Input
            id="loanTerm"
            name="termMonths"
            type="number"
            min="1"
            step="1"
            placeholder="12"
            value={getFormValue(loanCreateForm, 'termMonths')}
          />
          {#if loanCreateForm?.errors?.termMonths?.length}
            <p class="text-xs text-red-500">{loanCreateForm.errors.termMonths[0]}</p>
          {/if}
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="loanIssuedAt">Tanggal Cair</Label>
            <Input id="loanIssuedAt" name="issuedAt" type="date" value={getFormValue(loanCreateForm, 'issuedAt')} />
            {#if loanCreateForm?.errors?.issuedAt?.length}
              <p class="text-xs text-red-500">{loanCreateForm.errors.issuedAt[0]}</p>
            {/if}
          </div>
          <div class="space-y-2">
            <Label for="loanDueDate">Jatuh Tempo</Label>
            <Input id="loanDueDate" name="dueDate" type="date" value={getFormValue(loanCreateForm, 'dueDate')} />
            {#if loanCreateForm?.errors?.dueDate?.length}
              <p class="text-xs text-red-500">{loanCreateForm.errors.dueDate[0]}</p>
            {/if}
          </div>
        </div>
      </div>
      <div class="space-y-2">
        <Label for="loanReference">Referensi</Label>
        <Input id="loanReference" name="reference" placeholder="No. perjanjian" value={getFormValue(loanCreateForm, 'reference')} />
        {#if loanCreateForm?.errors?.reference?.length}
          <p class="text-xs text-red-500">{loanCreateForm.errors.reference[0]}</p>
        {/if}
      </div>
      <div class="space-y-2">
        <Label for="loanNotes">Catatan</Label>
        <Textarea id="loanNotes" name="notes" rows={3} placeholder="Tujuan pinjaman atau keterangan lain" value={getFormValue(loanCreateForm, 'notes')} />
        {#if loanCreateForm?.errors?.notes?.length}
          <p class="text-xs text-red-500">{loanCreateForm.errors.notes[0]}</p>
        {/if}
      </div>
      <div class="flex justify-end">
        <Button type="submit" className="gap-2" disabled={loanCreateSubmitting}>
        <FileText class="h-4 w-4" />
        {#if loanCreateSubmitting}
          Memproses...
        {:else}
          Simpan Pinjaman
        {/if}
        </Button>
      </div>
    </form>

    <div class="space-y-3">
      <h4 class="text-sm font-semibold text-slate-900">Daftar Pinjaman</h4>
      {#if finance.loans.items.length}
        <div class="space-y-4">
          {#each finance.loans.items as loan (loan.id)}
            <div class="rounded-2xl border border-slate-200 bg-white/70 p-4">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p class="text-sm font-semibold text-slate-900">Pinjaman #{loan.id.slice(0, 8).toUpperCase()}</p>
                  <p class="text-xs text-slate-500">
                    Cair {formatDate(loan.issuedAt)}
                    {#if loan.dueDate}
                      • Jatuh tempo {formatDate(loan.dueDate)}
                    {/if}
                  </p>
                </div>
                <Badge variant={loan.status === 'active' ? 'warning' : loan.status === 'closed' ? 'success' : 'destructive'}>
                  {loanStatusLabels[loan.status] ?? loan.status}
                </Badge>
              </div>
              <div class="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                <div>
                  <p class="text-xs text-slate-500">Pokok</p>
                  <p class="font-medium text-slate-900">{formatCurrency(loan.principal)}</p>
                  <p class="text-xs text-slate-500">Sisa pokok: {formatCurrency(loan.principalOutstanding)}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-500">Sisa Pinjaman</p>
                  <p class="font-medium text-slate-900">{formatCurrency(loan.balance)}</p>
                  <p class="text-xs text-slate-500">Bunga tersisa: {formatCurrency(loan.interestOutstanding)}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-500">Bunga / Pembayaran</p>
                  <p class="font-medium text-slate-900">{formatPercent(loan.interestRate)} • {formatCurrency(loan.totalPaid)}</p>
                </div>
              </div>
              {#if loan.notes}
                <p class="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">{loan.notes}</p>
              {/if}

              {#if loan.status === 'active'}
                <div class="mt-4 space-y-4">
                  <div class="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                    <h5 class="text-sm font-semibold text-slate-900">Bayar dari Tabungan</h5>
                    {#if loanPayFromSavingsForm?.success && loanPayFromSavingsForm?.values?.loanId === loan.id}
                      <p class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">Pembayaran pinjaman via tabungan berhasil.</p>
                    {/if}
                    <form
                      method="POST"
                      action="?/loanPayFromSavings"
                      class="space-y-3"
                      use:enhance={loanPayFromSavingsEnhance}
                    >
                      <input type="hidden" name="loanId" value={loan.id} />
                      <div class="text-xs text-slate-500">
                        <p>Saldo tabungan: {formatCurrency(finance.savings.balance)}</p>
                        <p>Sisa pinjaman: {formatCurrency(loan.balance)}</p>
                        <p>Bunga tersisa: {formatCurrency(loan.interestOutstanding)}</p>
                      </div>
                      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Input
                          name="amount"
                          type="number"
                          min="0"
                          step="1000"
                          max={Math.min(loan.balance, finance.savings.balance)}
                          required
                          value={
                            loanPayFromSavingsForm?.values?.loanId === loan.id
                              ? getFormValue(loanPayFromSavingsForm, 'amount')
                              : Math.min(loan.balance, finance.savings.balance) > 0
                                ? String(Math.min(loan.balance, finance.savings.balance))
                                : ''
                          }
                          className="sm:flex-1"
                          placeholder="Nominal pembayaran"
                        />
                        <Button
                          type="submit"
                          variant="ghost"
                          className="gap-2 text-emerald-700 hover:bg-emerald-50"
                          disabled={loanPayFromSavingsSubmitting.has(loan.id) || finance.savings.balance <= 0}
                        >
                        <FileText class="h-4 w-4" />
                        {#if loanPayFromSavingsSubmitting.has(loan.id)}
                          Memproses...
                        {:else if finance.savings.balance <= 0}
                          Saldo tabungan kosong
                        {:else}
                          Bayar dari tabungan
                        {/if}
                        </Button>
                      </div>
                      {#if loanPayFromSavingsForm?.values?.loanId === loan.id && loanPayFromSavingsForm?.errors}
                        {#if loanPayFromSavingsForm.errors.amount?.length}
                          <p class="text-xs text-red-500">{loanPayFromSavingsForm.errors.amount[0]}</p>
                        {/if}
                        {#if loanPayFromSavingsForm.errors.balance?.length}
                          <p class="text-xs text-red-500">{loanPayFromSavingsForm.errors.balance[0]}</p>
                        {/if}
                        {#if loanPayFromSavingsForm.errors.loanId?.length}
                          <p class="text-xs text-red-500">{loanPayFromSavingsForm.errors.loanId[0]}</p>
                        {/if}
                      {/if}
                    </form>
                  </div>
                  <div class="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                    <h5 class="text-sm font-semibold text-slate-900">Catat Angsuran</h5>
                    {#if loanRepaymentForm?.success && loanRepaymentForm?.values?.loanId === loan.id}
                      <p class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">Angsuran berhasil dicatat.</p>
                    {/if}
                    <form
                      method="POST"
                      action="?/loanRepayment"
                      class="grid gap-3 sm:grid-cols-2"
                      use:enhance={loanRepaymentEnhance}
                    >
                      <input type="hidden" name="loanId" value={loan.id} />
                      <div class="space-y-2">
                        <Label for={`repay-amount-${loan.id}`}>Nominal Angsuran</Label>
                        <Input
                          id={`repay-amount-${loan.id}`}
                          name="amount"
                          type="number"
                          min="0"
                          step="1000"
                          placeholder="Rp"
                          value={loanRepaymentForm?.values?.loanId === loan.id ? getFormValue(loanRepaymentForm, 'amount') : ''}
                          required
                        />
                        {#if loanRepaymentForm?.values?.loanId === loan.id && loanRepaymentForm?.errors?.amount?.length}
                          <p class="text-xs text-red-500">{loanRepaymentForm.errors.amount[0]}</p>
                        {/if}
                      </div>
                      <div class="space-y-2">
                        <Label for={`repay-note-${loan.id}`}>Catatan</Label>
                        <Textarea
                          id={`repay-note-${loan.id}`}
                          name="note"
                          rows={2}
                          placeholder="Keterangan pembayaran"
                          value={loanRepaymentForm?.values?.loanId === loan.id ? getFormValue(loanRepaymentForm, 'note') : ''}
                        />
                        {#if loanRepaymentForm?.values?.loanId === loan.id && loanRepaymentForm?.errors?.note?.length}
                          <p class="text-xs text-red-500">{loanRepaymentForm.errors.note[0]}</p>
                        {/if}
                      </div>
                      <div class="space-y-2 sm:col-span-2">
                        <Label for={`repay-reference-${loan.id}`}>Referensi</Label>
                        <Input
                          id={`repay-reference-${loan.id}`}
                          name="reference"
                          placeholder="No. kwitansi / kas"
                          value={loanRepaymentForm?.values?.loanId === loan.id ? getFormValue(loanRepaymentForm, 'reference') : ''}
                        />
                        {#if loanRepaymentForm?.values?.loanId === loan.id && loanRepaymentForm?.errors?.reference?.length}
                          <p class="text-xs text-red-500">{loanRepaymentForm.errors.reference[0]}</p>
                        {/if}
                      </div>
                      <div class="flex justify-end sm:col-span-2">
                        <Button type="submit" className="gap-2" disabled={loanRepaymentSubmitting.has(loan.id)}>
                        <FileText class="h-4 w-4" />
                        {#if loanRepaymentSubmitting.has(loan.id)}
                          Memproses...
                        {:else}
                          Catat Angsuran
                        {/if}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-sm text-slate-500">Belum ada pinjaman yang tercatat.</p>
      {/if}
    </div>

    <div class="space-y-3">
      <h4 class="text-sm font-semibold text-slate-900">Riwayat Transaksi Pinjaman</h4>
      {#if finance.loans.recentTransactions.length}
        <div class="overflow-hidden rounded-xl border border-slate-200">
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th class="px-3 py-2">Tanggal</th>
                <th class="px-3 py-2">Pinjaman</th>
                <th class="px-3 py-2">Jenis</th>
                <th class="px-3 py-2 text-right">Nominal</th>
                <th class="px-3 py-2">Catatan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              {#each finance.loans.recentTransactions as trx (trx.id ?? trx.createdAt)}
                <tr>
                  <td class="px-3 py-2 text-slate-600">{formatDateTime(trx.createdAt)}</td>
                  <td class="px-3 py-2 text-slate-600">#{trx.loanId.slice(0, 8).toUpperCase()}</td>
                  <td class="px-3 py-2">
                    <Badge variant={trx.type === 'repayment' ? 'success' : trx.type === 'disbursement' ? 'warning' : 'muted'}>
                      {loanTransactionLabels[trx.type] ?? trx.type}
                    </Badge>
                  </td>
                  <td class="px-3 py-2 text-right font-medium text-slate-900">{formatCurrency(trx.amount)}</td>
                  <td class="px-3 py-2 text-slate-500">{trx.note ?? '-'}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else}
        <p class="text-sm text-slate-500">Belum ada transaksi pinjaman.</p>
      {/if}
    </div>
  </CardContent>
</Card>
