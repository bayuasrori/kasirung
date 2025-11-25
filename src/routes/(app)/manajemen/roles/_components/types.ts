import type { MenuKey } from '$lib/navigation/menus';

export type FormState = {
  form?: 'create' | 'update' | 'delete';
  errors?: Record<string, string[]>;
  values?: Record<string, unknown>;
};

export interface RoleItem {
  id: number;
  name: string;
  description: string | null;
  userCount: number;
  createdAt: Date;
  updatedAt: Date;
  permissions: MenuKey[];
}

export interface MenuSection {
  label: string;
  items: Array<{ key: MenuKey; label: string }>;
}
