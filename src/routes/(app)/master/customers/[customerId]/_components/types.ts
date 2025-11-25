export type PaymentMethod = 'cash' | 'qris' | 'debit' | 'credit';

export type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
};

export type LedgerFilters = {
  startDate?: string;
  endDate?: string;
  status: 'all' | 'paid' | 'pending';
};

export type LedgerItem = {
  id: string;
  number: string;
  createdAt: Date;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: PaymentMethod;
  paymentAmount: number;
  cashier: string | null;
};

export type Ledger = {
  items: LedgerItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  filters: LedgerFilters;
};

export type Summary = {
  totalTransactions: number;
  totalAmount: number;
  pendingAmount: number;
  pendingCount: number;
  lastTransactionAt: Date | null;
};

export type OutstandingItem = {
  id: string;
  number: string;
  createdAt: Date;
  total: number;
  paymentAmount: number;
  paymentStatus: string;
};

export type SavingsTransaction = {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  note: string | null;
  reference: string | null;
  createdAt: Date;
};

export type SavingsData = {
  totalDeposits: number;
  totalWithdrawals: number;
  balance: number;
  transactions: SavingsTransaction[];
};

export type LoanItem = {
  id: string;
  principal: number;
  balance: number;
  interestRate: number;
  termMonths: number | null;
  status: 'active' | 'closed' | 'defaulted';
  issuedAt: Date;
  dueDate: Date | null;
  notes: string | null;
  createdAt: Date;
  totalPaid: number;
  principalOutstanding: number;
  interestOutstanding: number;
  accruedInterest: number;
};

export type LoanTransaction = {
  id: string;
  loanId: string;
  type: 'disbursement' | 'repayment' | 'interest' | 'penalty' | 'adjustment';
  amount: number;
  note: string | null;
  reference: string | null;
  createdAt: Date;
};

export type LoansData = {
  items: LoanItem[];
  totalOutstanding: number;
  activeCount: number;
  recentTransactions: LoanTransaction[];
};

export type FinanceData = {
  savings: SavingsData;
  loans: LoansData;
};

export type FormState = {
  type: 'savings' | 'loanCreate' | 'loanRepayment' | 'payFromSavings' | 'loanPayFromSavings';
  errors?: Record<string, string[]>;
  values?: Record<string, FormDataEntryValue>;
  success?: boolean;
};
