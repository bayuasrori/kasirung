export type Category = {
  id: number;
  name: string;
  description: string | null;
  productCount: number;
};

export type CategoryFilters = {
  search: string;
  sortBy: string;
  sortDir: string;
};

export type CategoryFormState = {
  form?: 'create' | 'update' | 'delete';
  errors?: Record<string, string[]>;
};
