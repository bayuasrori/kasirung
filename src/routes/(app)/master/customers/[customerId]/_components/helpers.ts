import type { PaymentMethod } from './types';

export const statusLabels: Record<string, string> = {
  paid: 'Lunas',
  pending: 'Belum Lunas'
};

export const statusVariants: Record<string, 'success' | 'warning' | 'muted'> = {
  paid: 'success',
  pending: 'warning'
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: 'Tunai',
  qris: 'QRIS',
  debit: 'Debit',
  credit: 'Kredit'
};

export const savingTypeLabels: Record<'deposit' | 'withdraw', string> = {
  deposit: 'Simpanan',
  withdraw: 'Penarikan'
};

export const loanStatusLabels: Record<'active' | 'closed' | 'defaulted', string> = {
  active: 'Berjalan',
  closed: 'Lunas',
  defaulted: 'Macet'
};

export const loanTransactionLabels: Record<string, string> = {
  disbursement: 'Pencairan',
  repayment: 'Angsuran',
  interest: 'Bunga',
  penalty: 'Denda',
  adjustment: 'Penyesuaian'
};

export const formatCurrency = (value: number | string) =>
  `Rp ${Number(value ?? 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;

export const formatDate = (value: Date) =>
  new Date(value).toLocaleDateString('id-ID', { dateStyle: 'medium' });

export const formatDateTime = (value: Date) =>
  new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

export const formatPercent = (value: number) => `${value.toFixed(2)}%`;

export const hasActiveFilters = (filters: { startDate?: string; endDate?: string; status: string }) =>
  Boolean(filters.startDate || filters.endDate || (filters.status && filters.status !== 'all'));
