import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.session) {
		throw redirect(302, '/demo/lucia');
	}

	return {};
};

const disabled = () => fail(501, { message: 'Demo lucia tidak dikonfigurasi pada build ini.' });

export const actions: Actions = {
	login: async () => disabled(),
	register: async () => disabled()
};
