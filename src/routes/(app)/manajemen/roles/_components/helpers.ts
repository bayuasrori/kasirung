import type { MenuKey } from '$lib/navigation/menus';
import type { FormState, MenuSection } from './types';

export const buildPermissionMaps = (menuSections: MenuSection[]) => {
  const map = new Map<MenuKey, string>();
  const keys = new Set<MenuKey>();

  for (const section of menuSections) {
    for (const item of section.items) {
      map.set(item.key, item.label);
      keys.add(item.key);
    }
  }

  return { labelMap: map, knownKeys: keys };
};

export const isKnownMenuKey = (value: unknown, knownKeys: Set<MenuKey>): value is MenuKey =>
  typeof value === 'string' && knownKeys.has(value as MenuKey);

export const parseFormPermissions = (
  form: FormState | null | undefined,
  formName: 'create' | 'update',
  knownKeys: Set<MenuKey>
): MenuKey[] => {
  if (!form || form.form !== formName) return [];
  const raw = form.values?.permissions;
  if (!Array.isArray(raw)) return [];

  const collected: MenuKey[] = [];
  for (const entry of raw) {
    if (isKnownMenuKey(entry, knownKeys) && !collected.includes(entry)) {
      collected.push(entry);
    }
  }
  return collected;
};

export const formatDate = (value: Date) =>
  new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
