import type { ReportPayload } from './types';
import { CreditCard, Package, Users, Wallet, BarChart3, Receipt, ShoppingCart } from 'lucide-svelte';

export const methodLabels: Record<string, string> = {
  cash: 'Tunai',
  qris: 'QRIS',
  debit: 'Debit',
  credit: 'Kartu Kredit'
};

export const formatCurrency = (value: number) =>
  `Rp ${Number(value ?? 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;

export const formatNumber = (value: number) => Number(value ?? 0).toLocaleString('id-ID');

export const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

export const formatDateLabel = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
};

type SummaryCard = {
  title: string;
  description: string;
  value: string;
  icon: typeof Wallet;
  accent: string;
};

type SecondaryCard = {
  title: string;
  value: string;
  icon: typeof Wallet;
  accent: string;
};

export const createSummaryCards = (report: ReportPayload | null): SummaryCard[] =>
  report
    ? [
        {
          title: 'Penjualan Bersih',
          description: 'Total transaksi setelah pajak dan diskon.',
          value: formatCurrency(report.summary.netSales),
          icon: Wallet,
          accent: 'bg-emerald-100 text-emerald-600'
        },
        {
          title: 'Penjualan Kotor',
          description: 'Nilai sebelum pajak dan diskon.',
          value: formatCurrency(report.summary.grossSales),
          icon: BarChart3,
          accent: 'bg-blue-100 text-blue-600'
        },
        {
          title: 'Jumlah Transaksi',
          description: 'Transaksi yang diselesaikan.',
          value: formatNumber(report.summary.transactionCount),
          icon: Receipt,
          accent: 'bg-violet-100 text-violet-600'
        },
        {
          title: 'Rata-rata Transaksi',
          description: 'Nilai rata-rata per transaksi.',
          value: formatCurrency(report.summary.averageOrderValue),
          icon: ShoppingCart,
          accent: 'bg-amber-100 text-amber-600'
        }
      ]
    : [];

export const createSecondaryCards = (report: ReportPayload | null): SecondaryCard[] =>
  report
    ? [
        {
          title: 'Total Pajak',
          value: formatCurrency(report.summary.totalTax),
          icon: CreditCard,
          accent: 'bg-sky-100 text-sky-600'
        },
        {
          title: 'Total Diskon',
          value: formatCurrency(report.summary.totalDiscount),
          icon: Package,
          accent: 'bg-rose-100 text-rose-600'
        },
        {
          title: 'Pelanggan Unik',
          value: formatNumber(report.summary.uniqueCustomers),
          icon: Users,
          accent: 'bg-slate-100 text-slate-600'
        }
      ]
    : [];
