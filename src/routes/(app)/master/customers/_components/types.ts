export type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  transactionCount: number;
  totalSpentThisMonth: number;
  outstandingThisMonth: number;
  createdAt: Date;
};

export type CustomerFilters = {
  search: string;
  sortBy: string;
  sortDir: string;
};

export type CustomerFormState = {
  form?: 'create' | 'update' | 'delete';
  errors?: Record<string, string[]>;
};
