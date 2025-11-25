export type ReportRange = {
  startDate: string;
  endDate: string;
  label: string;
  days: number;
};

export type ReportSummary = {
  netSales: number;
  grossSales: number;
  totalTax: number;
  totalDiscount: number;
  transactionCount: number;
  averageOrderValue: number;
  uniqueCustomers: number;
};

export type TrendSeriesRow = {
  date: string;
  label: string;
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  count: number;
};

export type ReportTrend = {
  labels: string[];
  totals: number[];
  counts: number[];
  series: TrendSeriesRow[];
};

export type PaymentSummary = {
  method: string;
  amount: number;
  percentage: number;
  count: number;
};

export type ProductSummary = {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
};

export type CustomerSummary = {
  customerId: string;
  name: string;
  total: number;
  count: number;
};

export type ReportPayload = {
  range: ReportRange;
  summary: ReportSummary;
  trend: ReportTrend;
  payments: PaymentSummary[];
  topProducts: ProductSummary[];
  topCustomers: CustomerSummary[];
};

export type ReportFilters = {
  range: 'today' | '7d' | '30d' | 'custom';
  startDateInput: string;
  endDateInput: string;
  rangeLabel: string;
  days: number;
  options: Array<{ value: 'today' | '7d' | '30d' | 'custom'; label: string }>;
};
