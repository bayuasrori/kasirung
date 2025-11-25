import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const stats = {
	totalPatients: 0,
	activePatients: 0,
	totalAppointments: 0,
	todayAppointments: 0
};

const recentPatients: any[] = [];
const recentAppointments: any[] = [];

export const load = (async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	try {
		// Get dashboard stats for simklinik
		// This would be implemented in dashboard service
		
		return {
			stats,
			recentPatients,
			recentAppointments
		};
	} catch (error) {
		console.error('Error loading simklinik dashboard:', error);
		return {
			stats,
			recentPatients,
			recentAppointments
		};
	}
}) satisfies PageServerLoad;
