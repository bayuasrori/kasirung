import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

import { createRole, deleteRoleById, listRolesWithMeta, updateRoleById } from '$lib/server/services/roles.service';
import { MENU_PERMISSION_SECTIONS } from '$lib/navigation/menus';

function preserveQuery(url: URL) {
	const params = new URLSearchParams();
	url.searchParams.forEach((value, key) => {
		if (!key || key.startsWith('/')) {
			return;
		}
		params.append(key, value);
	});
	const query = params.toString();
	return query ? `?${query}` : '';
}

function ensureRoleManagementAccess(locals: App.Locals) {
	if (!locals.session || !locals.user) {
		throw redirect(302, '/login');
	}

	const allowedMenus = locals.allowedMenus ?? [];
	if (!allowedMenus.includes('management.roles')) {
		throw redirect(302, '/dashboard');
	}
}

export const load: PageServerLoad = async ({ url, locals }) => {
	ensureRoleManagementAccess(locals);

	const search = url.searchParams.get('search') ?? '';
	const page = Number(url.searchParams.get('page') ?? '1');
	const sortBy = (url.searchParams.get('sortBy') ?? 'createdAt') as 'createdAt' | 'name';
	const sortDir = (url.searchParams.get('sortDir') ?? 'desc') as 'asc' | 'desc';

	const result = await listRolesWithMeta({
		search,
		page,
		pageSize: 10,
		sortBy,
		sortDir
	});

	return {
		roles: result.items,
		total: result.total,
		page: result.page,
		pageCount: result.pageCount,
		filters: { search, sortBy, sortDir },
		menuSections: MENU_PERMISSION_SECTIONS
	};
};

export const actions: Actions = {
	create: async ({ request, url, locals }) => {
		ensureRoleManagementAccess(locals);
		const formData = await request.formData();
		const permissions = formData.getAll('permissions').map(String);
		const formEntries = Object.fromEntries(formData);
		const payload: Record<string, unknown> = { ...formEntries, permissions };
		const result = await createRole(payload);
		if (!result.success) {
			return fail(400, { form: 'create', errors: result.errors, values: { permissions } });
		}
		throw redirect(303, `/manajemen/roles${preserveQuery(url)}`);
	},
	update: async ({ request, url, locals }) => {
		ensureRoleManagementAccess(locals);
		const formData = await request.formData();
		const id = formData.get('id');
		if (!id || typeof id !== 'string') {
			return fail(400, { form: 'update', errors: { id: ['Role tidak valid'] } });
		}
		const permissions = formData.getAll('permissions').map(String);
		const formEntries = Object.fromEntries(formData);
		const payload: Record<string, unknown> = { ...formEntries, permissions };
		const result = await updateRoleById(Number(id), payload);
		if (!result.success) {
			if (result.notFound) {
				return fail(404, { form: 'update', errors: { id: ['Role tidak ditemukan'] } });
			}
			return fail(400, { form: 'update', errors: result.errors, values: { permissions } });
		}
		throw redirect(303, `/manajemen/roles${preserveQuery(url)}`);
	},
	delete: async ({ request, url, locals }) => {
		ensureRoleManagementAccess(locals);
		const formData = await request.formData();
		const id = formData.get('id');
		if (!id || typeof id !== 'string') {
			return fail(400, { form: 'delete', errors: { id: ['Role tidak valid'] } });
		}
		const result = await deleteRoleById(Number(id));
		if (!result.success) {
			if (result.notFound) {
				return fail(404, { form: 'delete', errors: { id: ['Role tidak ditemukan'] } });
			}
			if (result.inUse) {
				return fail(400, { form: 'delete', errors: { id: ['Role sedang digunakan oleh pengguna aktif'] } });
			}
		}
		throw redirect(303, `/manajemen/roles${preserveQuery(url)}`);
	}
};
