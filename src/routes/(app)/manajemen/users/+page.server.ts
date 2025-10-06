import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

import {
	createUser,
	listUsersWithMeta,
	resetUserPassword,
	toggleUserStatus,
	updateUserById
} from '$lib/server/services/users.service';
import { findRoleById } from '$lib/server/repositories/roles.repository';

function preserveQuery(url: URL) {
	const params = new URLSearchParams(url.searchParams);
	return params.size ? `?${params.toString()}` : '';
}

async function ensureAdmin(locals: App.Locals) {
	if (!locals.session || !locals.user) {
		throw redirect(302, '/login');
	}

	const role = await findRoleById(locals.user.roleId);
	if (!role || role.name !== 'admin') {
		throw redirect(302, '/dashboard');
	}
}

export const load: PageServerLoad = async ({ url, locals }) => {
	await ensureAdmin(locals);

	const search = url.searchParams.get('search') ?? '';
	const page = Number(url.searchParams.get('page') ?? '1');
	const roleIdParam = url.searchParams.get('roleId');
	const statusParam = url.searchParams.get('status');
	const sortBy = (url.searchParams.get('sortBy') ?? 'createdAt') as 'createdAt' | 'fullName' | 'email';
	const sortDir = (url.searchParams.get('sortDir') ?? 'desc') as 'asc' | 'desc';

	const roleId = roleIdParam ? Number(roleIdParam) : undefined;
	const isActive = statusParam === 'active' ? true : statusParam === 'inactive' ? false : undefined;

	const result = await listUsersWithMeta({
		search,
		page,
		pageSize: 10,
		roleId: Number.isNaN(roleId) ? undefined : roleId,
		isActive,
		sortBy,
		sortDir
	});

	return {
		users: result.items,
		total: result.total,
		page: result.page,
		pageCount: result.pageCount,
		roles: result.roles,
		filters: {
			search,
			roleId: roleIdParam ?? '',
			status: statusParam ?? '',
			sortBy,
			sortDir
		}
	};
};

export const actions: Actions = {
	create: async ({ request, url, locals }) => {
		await ensureAdmin(locals);
		const formData = await request.formData();
		const payload = Object.fromEntries(formData);
		const result = await createUser(payload);
		if (!result.success) {
			return fail(400, { form: 'create', errors: result.errors });
		}
		throw redirect(303, `/manajemen/users${preserveQuery(url)}`);
	},
	update: async ({ request, url, locals }) => {
		await ensureAdmin(locals);
		const formData = await request.formData();
		const id = formData.get('id');
		if (!id || typeof id !== 'string') {
			return fail(400, { form: 'update', errors: { id: ['Pengguna tidak valid'] } });
		}
		const payload = Object.fromEntries(formData);
		const result = await updateUserById(id, payload);
		if (!result.success) {
			if (result.notFound) {
				return fail(404, { form: 'update', errors: { id: ['Pengguna tidak ditemukan'] } });
			}
			return fail(400, { form: 'update', errors: result.errors });
		}
		throw redirect(303, `/manajemen/users${preserveQuery(url)}`);
	},
	reset: async ({ request, url, locals }) => {
		await ensureAdmin(locals);
		const formData = await request.formData();
		const id = formData.get('id');
		if (!id || typeof id !== 'string') {
			return fail(400, { form: 'reset', errors: { id: ['Pengguna tidak valid'] } });
		}
		const payload = Object.fromEntries(formData);
		const result = await resetUserPassword(id, payload);
		if (!result.success) {
			if (result.notFound) {
				return fail(404, { form: 'reset', errors: { id: ['Pengguna tidak ditemukan'] } });
			}
			return fail(400, { form: 'reset', errors: result.errors });
		}
		throw redirect(303, `/manajemen/users${preserveQuery(url)}`);
	},
	toggle: async ({ request, url, locals }) => {
		await ensureAdmin(locals);
		const formData = await request.formData();
		const id = formData.get('id');
		if (!id || typeof id !== 'string') {
			return fail(400, { form: 'toggle', errors: { id: ['Pengguna tidak valid'] } });
		}
		const result = await toggleUserStatus(id);
		if (!result.success) {
			return fail(404, { form: 'toggle', errors: { id: ['Pengguna tidak ditemukan'] } });
		}
		throw redirect(303, `/manajemen/users${preserveQuery(url)}`);
	}
};
