import type { LayoutServerLoad } from './$types';

import { findRoleById } from '$lib/server/repositories/roles.repository';
import { MENU_KEYS, sanitizeMenuKeys } from '$lib/navigation/menus';

export const load: LayoutServerLoad = async ({ locals, parent }) => {
	const parentData = await parent();
	const user = locals.user;
	let allowedMenus = [...MENU_KEYS];

	if (user) {
		const role = await findRoleById(user.roleId);
		if (role) {
			if (role.name === 'admin') {
				allowedMenus = [...MENU_KEYS];
			} else {
				const permissions = sanitizeMenuKeys(role.permissions);
				allowedMenus = permissions.length ? permissions : [...MENU_KEYS];
			}
		}
	}

	return {
		...parentData,
		allowedMenus
	};
};
