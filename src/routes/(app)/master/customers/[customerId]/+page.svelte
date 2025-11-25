<script lang="ts">
  import type { SubmitFunction } from '@sveltejs/kit';
  import CustomerHeader from './_components/customer-header.svelte';
  import SectionNav from './_components/section-nav.svelte';
  import SummaryCards from './_components/summary-cards.svelte';
  import LedgerFilters from './_components/ledger-filters.svelte';
  import LedgerTable from './_components/ledger-table.svelte';
  import LedgerPagination from './_components/ledger-pagination.svelte';
  import ProfileCard from './_components/profile-card.svelte';
  import OutstandingList from './_components/outstanding-list.svelte';
  import SavingsSection from './_components/savings-section.svelte';
  import LoansSection from './_components/loans-section.svelte';
  import { hasActiveFilters } from './_components/helpers';
  import type {
    Customer,
    Ledger,
    Summary,
    OutstandingItem,
    FinanceData,
    FormState
  } from './_components/types';

  export let data: {
    customer: Customer;
    ledger: Ledger;
    summary: Summary;
    outstanding: OutstandingItem[];
    outstandingAmount: number;
    filters: Ledger['filters'];
    validationErrors: Record<string, string[]> | null;
    finance: FinanceData;
    form: FormState | null;
  };

  let customer = data.customer;
  let ledger = data.ledger;
  let summary = data.summary;
  let outstanding = data.outstanding;
  let outstandingAmount = data.outstandingAmount;
  let finance = data.finance;
  let validationErrors = data.validationErrors;
  let formState = data.form;
  let filters = ledger.filters;

  let savingsForm = formState?.type === 'savings' ? formState : null;
  let loanCreateForm = formState?.type === 'loanCreate' ? formState : null;
  let loanRepaymentForm = formState?.type === 'loanRepayment' ? formState : null;
  let payFromSavingsForm = formState?.type === 'payFromSavings' ? formState : null;
  let loanPayFromSavingsForm = formState?.type === 'loanPayFromSavings' ? formState : null;

  $: customer = data.customer;
  $: ledger = data.ledger;
  $: summary = data.summary;
  $: outstanding = data.outstanding;
  $: outstandingAmount = data.outstandingAmount;
  $: finance = data.finance;
  $: validationErrors = data.validationErrors;
  $: formState = data.form;
  $: filters = ledger.filters;
  $: savingsForm = formState?.type === 'savings' ? formState : null;
  $: loanCreateForm = formState?.type === 'loanCreate' ? formState : null;
  $: loanRepaymentForm = formState?.type === 'loanRepayment' ? formState : null;
  $: payFromSavingsForm = formState?.type === 'payFromSavings' ? formState : null;
  $: loanPayFromSavingsForm = formState?.type === 'loanPayFromSavings' ? formState : null;

  let savingsSubmitting = false;
  let loanCreateSubmitting = false;
  let loanRepaymentSubmitting = new Set<string>();
  let payFromSavingsSubmitting = new Set<string>();
  let loanPayFromSavingsSubmitting = new Set<string>();

  const getFormValue = (form: { values?: Record<string, FormDataEntryValue> } | null, field: string) =>
    (form?.values?.[field] as string | undefined) ?? '';

  type GenericSubmit = SubmitFunction<Record<string, unknown>, Record<string, unknown>>;

  const savingsEnhance: GenericSubmit = ({ formElement }) => {
    savingsSubmitting = true;
    return async ({ update, result }) => {
      savingsSubmitting = false;
      await update();
      if (result.type === 'success') {
        formElement.reset();
      }
    };
  };

  const loanCreateEnhance: GenericSubmit = ({ formElement }) => {
    loanCreateSubmitting = true;
    return async ({ update, result }) => {
      loanCreateSubmitting = false;
      await update();
      if (result.type === 'success') {
        formElement.reset();
      }
    };
  };

  const loanRepaymentEnhance: GenericSubmit = ({ formElement }) => {
    const loanId = (formElement.querySelector('input[name="loanId"]') as HTMLInputElement | null)?.value;
    if (loanId) {
      const next = new Set(loanRepaymentSubmitting);
      next.add(loanId);
      loanRepaymentSubmitting = next;
    }
    return async ({ update, result }) => {
      if (loanId) {
        const next = new Set(loanRepaymentSubmitting);
        next.delete(loanId);
        loanRepaymentSubmitting = next;
      }
      await update();
      if (result.type === 'success') {
        formElement.reset();
        if (loanId) {
          const hidden = formElement.querySelector('input[name="loanId"]') as HTMLInputElement | null;
          if (hidden) hidden.value = loanId;
        }
      }
    };
  };

  const payFromSavingsEnhance: GenericSubmit = ({ formElement }) => {
    const transactionId = (formElement.querySelector('input[name="transactionId"]') as HTMLInputElement | null)?.value;
    if (transactionId) {
      const next = new Set(payFromSavingsSubmitting);
      next.add(transactionId);
      payFromSavingsSubmitting = next;
    }
    return async ({ update, result }) => {
      if (transactionId) {
        const next = new Set(payFromSavingsSubmitting);
        next.delete(transactionId);
        payFromSavingsSubmitting = next;
      }
      await update();
      if (result.type === 'success') {
        formElement.reset();
      }
    };
  };

  const loanPayFromSavingsEnhance: GenericSubmit = ({ formElement }) => {
    const loanId = (formElement.querySelector('input[name="loanId"]') as HTMLInputElement | null)?.value;
    if (loanId) {
      const next = new Set(loanPayFromSavingsSubmitting);
      next.add(loanId);
      loanPayFromSavingsSubmitting = next;
    }
    return async ({ update, result }) => {
      if (loanId) {
        const next = new Set(loanPayFromSavingsSubmitting);
        next.delete(loanId);
        loanPayFromSavingsSubmitting = next;
      }
      await update();
      if (result.type === 'success') {
        formElement.reset();
        if (loanId) {
          const hidden = formElement.querySelector('input[name="loanId"]') as HTMLInputElement | null;
          if (hidden) hidden.value = loanId;
        }
      }
    };
  };

  const buildQuery = (updates: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.status && filters.status !== 'all') params.set('status', filters.status);
    if (ledger.page > 1) params.set('page', String(ledger.page));

    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === '') {
        params.delete(key);
        continue;
      }
      if (key === 'page' && Number(value) <= 1) {
        params.delete(key);
        continue;
      }
      params.set(key, String(value));
    }

    const query = params.toString();
    return query ? `?${query}` : '';
  };

  const debtDownloadUrl = `/master/customers/${customer.id}/debt`;
  let hasFilters = hasActiveFilters(filters);
  $: hasFilters = hasActiveFilters(filters);
</script>

<div class="space-y-6">
  <CustomerHeader
    customer={customer}
    outstandingAmount={outstandingAmount}
    debtDownloadUrl={debtDownloadUrl}
  />

  <SectionNav />

  <SummaryCards summary={summary} outstandingAmount={outstandingAmount} />

  <div class="grid gap-4 lg:grid-cols-[2fr_1fr]" id="ledger">
    <section class="space-y-4">
      <LedgerFilters
        filters={filters}
        validationErrors={validationErrors}
        hasFilters={hasFilters}
        resetHref={buildQuery({ startDate: undefined, endDate: undefined, status: undefined, page: undefined })}
      />
      <LedgerTable items={ledger.items} />
      <LedgerPagination page={ledger.page} pageCount={ledger.pageCount} buildQuery={buildQuery} />
    </section>

    <aside class="space-y-4">
      <ProfileCard customer={customer} />
      <OutstandingList
        outstanding={outstanding}
        finance={finance}
        payFromSavingsForm={payFromSavingsForm}
        payFromSavingsEnhance={payFromSavingsEnhance}
        payFromSavingsSubmitting={payFromSavingsSubmitting}
        getFormValue={getFormValue}
      />
    </aside>
  </div>

  <div class="grid gap-4 xl:grid-cols-2">
    <SavingsSection
      finance={finance}
      savingsForm={savingsForm}
      savingsEnhance={savingsEnhance}
      savingsSubmitting={savingsSubmitting}
      getFormValue={getFormValue}
    />
    <LoansSection
      finance={finance}
      loanCreateForm={loanCreateForm}
      loanCreateEnhance={loanCreateEnhance}
      loanCreateSubmitting={loanCreateSubmitting}
      loanPayFromSavingsForm={loanPayFromSavingsForm}
      loanPayFromSavingsEnhance={loanPayFromSavingsEnhance}
      loanPayFromSavingsSubmitting={loanPayFromSavingsSubmitting}
      loanRepaymentForm={loanRepaymentForm}
      loanRepaymentEnhance={loanRepaymentEnhance}
      loanRepaymentSubmitting={loanRepaymentSubmitting}
      getFormValue={getFormValue}
    />
  </div>
</div>
