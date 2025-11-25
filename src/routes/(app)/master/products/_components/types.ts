export type Product = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price: string;
  categoryId: number | null;
  categoryName: string | null;
  isActive: boolean;
};

export type CategoryOption = {
  id: number;
  name: string;
};

export type ProductFilters = {
  search: string;
  categoryId: string;
  sortBy: string;
  sortDir: string;
};

export type ProductFormState = {
  form?: 'create' | 'update' | 'delete';
  errors?: Record<string, string[]>;
};
