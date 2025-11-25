import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, parent }) => {
	const parentData = await parent();

	return {
		...parentData,
		allowedMenus: locals.allowedMenus
	};
};
